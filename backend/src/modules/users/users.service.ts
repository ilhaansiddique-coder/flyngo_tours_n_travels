import { Injectable, NotFoundException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MediaService } from '../media/media.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { phoneKey } from '../../common/utils/phone.util';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

/** Well-known guest password used when the admin does not supply one — same
 *  constant the booking auto-provisioning uses, so the created account is
 *  immediately usable (first login forces a password change). */
const GUEST_TEMP_PASSWORD = '12345678';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
    private readonly loyalty: LoyaltyService,
  ) {}

  async createUser(tenantId: string, data: any) {
    // Email is optional site-wide (phone is the primary identifier). Only run
    // the duplicate check when one was actually supplied — otherwise the query
    // matches any existing null-email user and wrongly reports a conflict.
    const email = typeof data.email === 'string' ? data.email.trim() : '';
    if (email) {
      const existing = await this.prisma.user.findFirst({ where: { tenantId, email } });
      if (existing) throw new ConflictException('A user with this email already exists');
    }

    // Phone is normalized to a shared key so login-by-phone and the booking
    // auto-provisioning agree on identity, and duplicates are caught regardless
    // of how the number was typed.
    const phone = typeof data.phone === 'string' ? data.phone.trim() || null : null;
    const key = phoneKey(phone);
    if (key) {
      const dup = await this.prisma.user.findFirst({ where: { tenantId, phoneKey: key, deletedAt: null } });
      if (dup) throw new ConflictException('A user with this phone number already exists');
    }

    // `fullName` is required at the schema level — never 500 on a blank form.
    const fullName = typeof data.fullName === 'string' && data.fullName.trim()
      ? data.fullName.trim()
      : 'Guest';

    // `roleId` is required and must belong to this tenant. If the caller sent
    // an empty/invalid id (e.g. the admin form failed to load roles), fall back
    // to the tenant's customer role so creation never fails on a FK violation.
    let roleId = typeof data.roleId === 'string' && data.roleId ? data.roleId : '';
    if (roleId) {
      const role = await this.prisma.role.findFirst({ where: { id: roleId, tenantId } });
      if (!role) roleId = '';
    }
    if (!roleId) {
      const customerRole = await this.prisma.role.findFirst({ where: { tenantId, code: 'customer' } });
      roleId = customerRole?.id || '';
      if (!roleId) throw new BadRequestException('No customer role is configured for this tenant');
    }

    // When the admin supplies a password the account is fully active; otherwise
    // provision the well-known guest password (must change on first login) so
    // the created customer can actually sign in with their phone/email.
    const providedPassword = typeof data.password === 'string' && data.password.trim();
    const passwordHash = providedPassword
      ? await bcrypt.hash(data.password, 12)
      : await bcrypt.hash(GUEST_TEMP_PASSWORD, 12);

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: email || null,
        fullName,
        phone,
        phoneKey: key,
        nationalId: data.nationalId || null,
        passportNumber: data.passportNumber || null,
        passwordHash,
        roleId,
        accountStatus: providedPassword ? 'active' : 'invited',
        mustChangePassword: !providedPassword,
        isActive: data.isActive ?? true,
      },
      include: { role: true },
    });
    const { passwordHash: _ph, ...rest } = user;

    // Every new user is credited the signup bonus (default 100 points). Same
    // idempotent path as self-registration — non-fatal if it fails.
    try {
      await this.loyalty.awardSignupBonus(tenantId, user.id);
    } catch (err: any) {
      this.logger.warn(`Signup bonus for admin-created user ${user.id} failed: ${err.message}`);
    }

    return rest;
  }

  async findById(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async findByEmail(email: string, tenantId: string) {
    return this.prisma.user.findFirst({ where: { email, tenantId } });
  }

  async updateProfile(
    id: string,
    tenantId: string,
    data: { fullName?: string; phone?: string; email?: string; address?: string; avatarUrl?: string },
  ) {
    // Only apply the fields that were actually provided, so a partial edit
    // never blanks out something the form didn't send. Empty email/address
    // strings are stored as null.
    const patch: Record<string, unknown> = {};
    if (data.fullName !== undefined) patch.fullName = data.fullName;
    if (data.phone !== undefined) patch.phone = data.phone || null;
    if (data.email !== undefined) patch.email = data.email?.trim() ? data.email.trim() : null;
    if (data.address !== undefined) patch.address = data.address?.trim() ? data.address.trim() : null;
    if (data.avatarUrl !== undefined) patch.avatarUrl = data.avatarUrl || null;

    // Guard email uniqueness within the tenant (someone else can't already own it).
    if (typeof patch.email === 'string' && patch.email) {
      const clash = await this.prisma.user.findFirst({
        where: { tenantId, email: { equals: patch.email as string, mode: 'insensitive' }, id: { not: id }, deletedAt: null },
        select: { id: true },
      });
      if (clash) throw new ConflictException('That email is already used by another account');
    }

    const user = await this.prisma.user.updateMany({ where: { id, tenantId }, data: patch });
    if (user.count === 0) throw new NotFoundException('User not found');
    return this.findById(id, tenantId);
  }

  // ===========================================================================
  // Self-service profile media: avatar + documents
  // ===========================================================================

  /** Upload a new profile picture and set it as the user's avatar. */
  async setMyAvatar(id: string, tenantId: string, file: Express.Multer.File) {
    const res = await this.media.upload(file, { tenantId, folder: 'avatars' });
    await this.prisma.user.updateMany({ where: { id, tenantId }, data: { avatarUrl: res.url } });
    return { avatarUrl: res.url };
  }

  /** Attach a document or image to the user's own profile. */
  async addMyDocument(userId: string, tenantId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    const isImage = (file.mimetype || '').startsWith('image/');
    const res = await this.media.upload(file, { tenantId, folder: 'user-documents', allowDocuments: true });
    return this.prisma.userDocument.create({
      data: {
        tenantId,
        userId,
        url: res.url,
        filename: file.originalname || res.filename,
        mimeType: res.mimeType,
        size: res.size,
        kind: isImage ? 'image' : 'document',
      },
    });
  }

  /** List the user's own (non-deleted) documents, newest first. */
  async listMyDocuments(userId: string, tenantId: string) {
    return this.prisma.userDocument.findMany({
      where: { userId, tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Soft-delete one of the user's own documents (and remove the file). */
  async deleteMyDocument(id: string, userId: string, tenantId: string) {
    const doc = await this.prisma.userDocument.findFirst({ where: { id, userId, tenantId, deletedAt: null } });
    if (!doc) throw new NotFoundException('Document not found');
    await this.prisma.userDocument.update({ where: { id }, data: { deletedAt: new Date() } });
    await this.media.removeManyByUrl([doc.url], tenantId).catch(() => undefined);
    return { success: true };
  }

  async listUsers(tenantId: string, page = 1, limit = 20, q?: string) {
    const where: any = { tenantId, deletedAt: null };
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term } },
        { email: { contains: term, mode: 'insensitive' } },
        { nationalId: { contains: term } },
        { passportNumber: { contains: term, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { role: true, _count: { select: { bookings: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      // `include` returns every scalar column, so credential fields have to be
      // dropped explicitly — a live refresh token is a session in a JSON body.
      items: items.map(({ passwordHash, refreshToken, ...rest }) => rest),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateUser(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('User not found');

    // Optional password reset by an admin — only re-hash when a non-empty value
    // is supplied, so a normal edit never wipes the existing password.
    const passwordHash =
      typeof data.password === 'string' && data.password.trim()
        ? await bcrypt.hash(data.password, 12)
        : undefined;

    // Re-normalize the phone key whenever the phone changes, so login-by-phone
    // and booking auto-provisioning keep matching the updated number.
    const phone = typeof data.phone === 'string' ? data.phone.trim() || null : existing.phone;
    const key = phoneKey(phone);
    if (key) {
      const dup = await this.prisma.user.findFirst({
        where: { tenantId, phoneKey: key, deletedAt: null, id: { not: id } },
        select: { id: true },
      });
      if (dup) throw new ConflictException('That phone number is already used by another account');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        fullName: typeof data.fullName === 'string' && data.fullName.trim()
          ? data.fullName.trim()
          : existing.fullName,
        phone,
        phoneKey: key,
        roleId: data.roleId ?? existing.roleId,
        isActive: data.isActive,
        nationalId: data.nationalId,
        passportNumber: data.passportNumber,
        ...(passwordHash ? { passwordHash, mustChangePassword: false } : {}),
      },
      include: { role: true },
    });
    const { passwordHash: _ph, ...rest } = user;
    return rest;
  }

  // ===========================================================================
  // Admin-managed identity / travel documents (NID + passport)
  // ===========================================================================
  // Each upload replaces the corresponding document on the customer record.
  // Files go through the same media pipeline as profile documents and are
  // stored in the user-documents folder.

  private async ensureUser(id: string, tenantId: string) {
    const existing = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('User not found');
    return existing;
  }

  /** Admin: upload the front side of the customer's National ID. */
  async uploadNationalIdFront(id: string, tenantId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided in form-data field "file"');
    await this.ensureUser(id, tenantId);
    const res = await this.media.upload(file, { tenantId, folder: 'user-documents', allowDocuments: true });
    await this.prisma.user.update({ where: { id }, data: { nationalIdFrontUrl: res.url } });
    return this.findById(id, tenantId);
  }

  /** Admin: upload the back side of the customer's National ID. */
  async uploadNationalIdBack(id: string, tenantId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided in form-data field "file"');
    await this.ensureUser(id, tenantId);
    const res = await this.media.upload(file, { tenantId, folder: 'user-documents', allowDocuments: true });
    await this.prisma.user.update({ where: { id }, data: { nationalIdBackUrl: res.url } });
    return this.findById(id, tenantId);
  }

  /** Admin: upload a copy of the customer's passport. */
  async uploadPassport(id: string, tenantId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided in form-data field "file"');
    await this.ensureUser(id, tenantId);
    const res = await this.media.upload(file, { tenantId, folder: 'user-documents', allowDocuments: true });
    await this.prisma.user.update({ where: { id }, data: { passportUrl: res.url } });
    return this.findById(id, tenantId);
  }

  async removeUser(id: string, tenantId: string) {
    const existing = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  // ===========================================================================
  // GDPR: data export + right-to-be-forgotten
  // ===========================================================================

  /**
   * Build a JSON dump of every piece of personal data we hold on the user.
   * Covers: profile, bookings, payments, reviews, notifications, affiliate
   * records, referral/loyalty state, audit-log entries about the user, and
   * the pre-registrations they submitted. Sensitive fields (passwordHash,
   * OAuth provider IDs) are excluded — they have no business being in a
   * download anyway.
   */
  async exportMyData(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      include: {
        role: true,
        affiliate: {
          include: {
            referrals: true,
            commissions: true,
            payouts: true,
            ledger: true,
          },
        },
        loyaltyAccount: { include: { currentTier: true, transactions: true } },
        bookings: {
          include: {
            payments: true,
            travelers: true,
          },
        },
        reviews: true,
        notifications: { take: 100, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');

    // Records attached to the user by ID but stored in standalone tables.
    const [preRegs, blogPosts, auditLogs, ledgerEntries] = await Promise.all([
      this.prisma.hajjPreRegistration.findMany({ where: { tenantId, phone: user.phone ?? '__none__' } }),
      this.prisma.blogPost.findMany({ where: { authorId: id } }),
      this.prisma.auditLog.findMany({ where: { userId: id }, take: 100, orderBy: { createdAt: 'desc' } }),
      this.prisma.referralLedger.findMany({ where: { referredUserId: id } }),
    ]);

    const { passwordHash, refreshToken, providerId, ...safeUser } = user as any;

    return {
      generatedAt: new Date().toISOString(),
      subject: {
        id: safeUser.id,
        tenantId: safeUser.tenantId,
        fullName: safeUser.fullName,
        email: safeUser.email,
        phone: safeUser.phone,
        avatarUrl: safeUser.avatarUrl,
        provider: safeUser.provider,
        role: safeUser.role?.name ?? null,
        referralCode: safeUser.referralCode,
        referredByCode: safeUser.referredByCode,
        createdAt: safeUser.createdAt,
      },
      loyalty: safeUser.loyaltyAccount,
      bookings: safeUser.bookings,
      reviews: safeUser.reviews,
      notifications: safeUser.notifications,
      affiliate: safeUser.affiliate
        ? {
            id: safeUser.affiliate.id,
            affiliateType: safeUser.affiliate.affiliateType,
            referrals: safeUser.affiliate.referrals,
            commissions: safeUser.affiliate.commissions,
            payouts: safeUser.affiliate.payouts,
          }
        : null,
      referralLedger: ledgerEntries,
      preRegistrations: preRegs,
      blogPosts,
      auditLog: auditLogs,
      metadata: {
        note: 'Sensitive credentials (password hash, OAuth provider IDs, refresh token) are excluded from this export by design.',
        generator: 'FlynGo GDPR export v1',
      },
    };
  }

  /**
   * Anonymize the user's PII. We don't hard-delete because:
   *  - we have accounting/legal obligations to retain transactional history
   *  - other users' bookings reference this user as referrer
   *  - aggregated counts/earnings in loyalty + affiliate systems must stay intact
   *
   * Replaces: fullName, email, phone, avatarUrl, provider/providerId, refreshToken
   * Clears: passwordHash, FCM device tokens
   * Soft-deletes: the user record (deletedAt = now)
   * Keeps: bookings, payments, reviews (with their userId pointing to an anonymous
   * record so the rest of the system keeps working).
   */
  async anonymizeAndSoftDelete(id: string, tenantId: string, confirmation: string) {
    if (confirmation !== 'DELETE MY ACCOUNT') {
      throw new BadRequestException(
        'Confirmation string mismatch — pass confirmation="DELETE MY ACCOUNT" to confirm deletion.',
      );
    }
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');

    const anon = `deleted-${crypto.randomBytes(6).toString('hex')}`;
    const tombstoneEmail = `${anon}@anonymized.invalid`;

    return this.prisma.$transaction(async (tx) => {
      // Drop FCM tokens so push stops working.
      await tx.deviceToken.updateMany({
        where: { userId: id },
        data: { deletedAt: new Date() },
      });

      // Anonymize pre-registrations (these have a PII shape).
      await tx.hajjPreRegistration.updateMany({
        where: { tenantId, phone: user.phone ?? '__none__' },
        data: {
          fullName: '[deleted]',
          email: null,
          phone: anon,
          passportNo: null,
          district: null,
        },
      });

      const updated = await tx.user.update({
        where: { id },
        data: {
          fullName: '[deleted user]',
          email: tombstoneEmail,
          phone: null,
          avatarUrl: null,
          passwordHash: null,
          provider: null,
          providerId: null,
          refreshToken: null,
          referralCode: null,
          emailVerifiedAt: null,
          phoneVerifiedAt: null,
          lastLoginAt: null,
          isActive: false,
          deletedAt: new Date(),
        },
        select: { id: true, tenantId: true, deletedAt: true },
      });

      this.logger.log(
        `User ${id} (tenant ${tenantId}) anonymized and soft-deleted. Tombstone email: ${tombstoneEmail}`,
      );
      return updated;
    });
  }
}
