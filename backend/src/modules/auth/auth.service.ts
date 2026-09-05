import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { ReferralService } from '../referral/referral.service';
import { TrackingService } from '../tracking/tracking.service';
import { NotificationsService } from '../notifications/notifications.service';
import type { SignOptions } from 'jsonwebtoken';

// Single definition, shared with booking provisioning — see phone.util.ts for
// why the login rule and the account key must be the same function.
import { phoneKey as phoneCore } from '../../common/utils/phone.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly referralService: ReferralService,
    private readonly trackingService: TrackingService,
    private readonly notifications: NotificationsService,
  ) {}

  async login(dto: LoginDto, tenantId: string): Promise<TokenResponseDto> {
    // Users can sign in by either email or phone. The frontend sends both keys
    // with the unused one blank, so only non-empty identifiers become filters:
    // an `undefined` value would be dropped by Prisma and let the OR match an
    // arbitrary user in the tenant.
    const orFilters: any[] = [];
    if (dto.email) orFilters.push({ email: dto.email });
    const core = phoneCore(dto.phone);
    if (core) orFilters.push({ phone: { endsWith: core } });
    else if (dto.phone) orFilters.push({ phone: dto.phone });

    if (orFilters.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findFirst({
      where: { tenantId, OR: orFilters, deletedAt: null },
    });

    // A provisional account (created by a booking) has no hash and is therefore
    // unreachable here — same generic error, so this cannot be used to probe
    // which numbers have booked.
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcryptjs.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // First login with a staff-issued temporary password: hand back a token
    // scoped to the password-change endpoint only. A full session here would
    // let the holder skip the change and keep using a password that was read
    // aloud over WhatsApp.
    if (user.mustChangePassword) {
      if (user.tempPasswordExpiresAt && user.tempPasswordExpiresAt < new Date()) {
        throw new UnauthorizedException('This temporary password has expired. Ask us to send a new one.');
      }
      return {
        mustChangePassword: true,
        changePasswordToken: await this.jwtService.signAsync(
          { sub: user.id, tenantId, scope: 'password_change' },
          { expiresIn: '15m' },
        ),
        user: { id: user.id, fullName: user.fullName },
      } as any;
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    return this.generateTokens(user.id, tenantId);
  }

  async register(dto: RegisterDto, tenantId: string, refCode?: string | null): Promise<TokenResponseDto> {
    // Uniqueness check — at least one of (email, phone) must be present
    // and neither can already be registered for this tenant.
    const orFilters: any[] = [];
    if (dto.email) orFilters.push({ email: dto.email });
    const core = phoneCore(dto.phone);
    if (core) orFilters.push({ phone: { endsWith: core } });
    else if (dto.phone) orFilters.push({ phone: dto.phone });

    const existing = await this.prisma.user.findFirst({
      where: { tenantId, OR: orFilters, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('An account with this email or phone already exists');
    }

    const passwordHash = await bcryptjs.hash(dto.password, 12);

    const customerRole = await this.prisma.role.findFirst({
      where: { code: 'customer', tenantId },
    });

    // Pre-compute a referral code so we can store it on the user in one shot
    const prep = await this.referralService.prepareRegistration(tenantId, refCode || null);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email || null,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        // Canonical match key, so a later booking with the same number in a
        // different format resolves to this account instead of a duplicate.
        phoneKey: core,
        accountStatus: 'active',
        claimedAt: new Date(),
        address: dto.address ?? null,
        tenantId,
        roleId: customerRole!.id,
        referralCode: prep.referralCode,
        referredByCode: refCode ? refCode.trim().toUpperCase() : null,
      },
    });

    // Fire-and-forget: bootstrap affiliate row + create pending referral entry
    try {
      await this.referralService.finalizeRegistration(
        tenantId,
        { id: user.id, fullName: user.fullName, referralCode: prep.referralCode, phone: user.phone },
        refCode || null,
      );
    } catch (err: any) {
      this.logger.warn(`Referral bootstrap failed (non-blocking): ${err.message}`);
    }

    // Signup bonus: every new user is credited their signup points immediately.
    try {
      await this.referralService.awardSignupBonus(tenantId, user.id);
    } catch (err: any) {
      this.logger.warn(`Signup bonus failed (non-blocking): ${err.message}`);
    }

    // Emit server CompleteRegistration so Meta CAPI can dedupe against Pixel
    void this.trackingService.emitServerEvent(tenantId, 'complete_registration', {
      userId: user.id,
      value: 0,
      contentName: 'signup',
      email: user.email ?? undefined,
      phone: user.phone ?? undefined,
      fullName: user.fullName ?? undefined,
      externalId: user.id,
    });

    return this.generateTokens(user.id, tenantId);
  }

  async refreshToken(refreshToken: string, tenantId: string): Promise<TokenResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findFirst({
        where: { id: payload.sub, tenantId },
      });

    if (!user || user.deletedAt || !user.passwordHash) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id, tenantId);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateOAuthUser(
    profile: { email: string; fullName: string; provider: string; providerId: string },
    tenantId: string,
    referralCode?: string | null,
  ) {
    let user = await this.prisma.user.findFirst({
      where: { email: profile.email, tenantId },
    });

    if (user) {
      // Link the OAuth identity to the existing account so future logins can
      // find it directly. Do not clobber a different provider on the same row.
      if (!user.provider || !user.providerId || !user.emailVerifiedAt) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            provider: profile.provider,
            providerId: profile.providerId,
            emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
            lastLoginAt: new Date(),
          },
        });
      } else {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }
      try {
        await this.referralService.onUserVerified(tenantId, user.id);
      } catch (err: any) {
        this.logger.warn(`OAuth referral verification hook failed: ${err.message}`);
      }
    } else {
      const customerRole = await this.prisma.role.findFirst({
        where: { code: 'customer', tenantId },
      });
      const prep = await this.referralService.prepareRegistration(tenantId, referralCode || null);

      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          fullName: profile.fullName,
          tenantId,
          roleId: customerRole!.id,
          provider: profile.provider,
          providerId: profile.providerId,
          emailVerifiedAt: new Date(),
          lastLoginAt: new Date(),
          referralCode: prep.referralCode,
          referredByCode: referralCode ? referralCode.trim().toUpperCase() : null,
        },
      });

      try {
        await this.referralService.finalizeRegistration(
          tenantId,
          { id: user.id, fullName: user.fullName, referralCode: prep.referralCode, phone: user.phone },
          referralCode || null,
        );
        // OAuth users are verified by the provider. The hook itself still checks
        // the persisted verification marker before awarding signup points.
        await this.referralService.onUserVerified(tenantId, user.id);
        // Signup bonus for the new OAuth user (idempotent on the user id).
        await this.referralService.awardSignupBonus(tenantId, user.id);
      } catch (err: any) {
        this.logger.warn(`OAuth referral bootstrap failed (non-blocking): ${err.message}`);
      }
    }

    return this.generateTokens(user.id, tenantId);
  }

  // ===========================================================================
  // PASSWORD RESET
  // ===========================================================================

  /** Find an active user by email (case-insensitive) or phone. */
  private async findUserByIdentifier(tenantId: string, identifier: string) {
    const id = identifier.trim();
    if (!id) return null;
    const core = phoneCore(id);
    return this.prisma.user.findFirst({
      where: {
        tenantId,
        deletedAt: null,
        OR: [
          { email: { equals: id, mode: 'insensitive' } },
          ...(core ? [{ phone: { endsWith: core } }] : [{ phone: id }]),
        ],
      },
      // accountStatus/passwordHash let the reset flow refuse a provisional
      // account: there is no password to reset, and it must not be claimable
      // without the staff-issued credential.
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        accountStatus: true,
        passwordHash: true,
      },
    });
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const shown = local.slice(0, Math.min(2, local.length));
    return `${shown}${'*'.repeat(Math.max(1, local.length - shown.length))}@${domain}`;
  }

  private maskPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return phone;
    return `${phone.slice(0, phone.length - 4).replace(/\d/g, '*')}${phone.slice(-4)}`;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /** Step 1 — which channels can receive a reset link for this identifier. */
  async passwordResetOptions(tenantId: string, identifier: string) {
    const user = await this.findUserByIdentifier(tenantId, identifier);
    const channels: { channel: 'email' | 'sms'; hint: string }[] = [];
    if (user?.email) channels.push({ channel: 'email', hint: this.maskEmail(user.email) });
    if (user?.phone) channels.push({ channel: 'sms', hint: this.maskPhone(user.phone) });
    return { channels };
  }

  /** Step 2 — issue a single-use token and send it over the chosen channel. */
  async sendPasswordReset(tenantId: string, identifier: string, channel: 'email' | 'sms') {
    const user = await this.findUserByIdentifier(tenantId, identifier);
    // Always report success — never reveal whether an account/channel exists.
    if (!user) return { sent: true };
    // A provisional account has no password to reset. Allowing one here would
    // turn "forgot password" into self-service account claiming for any number
    // that has ever booked, bypassing the staff-issued credential entirely.
    if (user.accountStatus === 'provisional' || !user.passwordHash) return { sent: true };
    const destination = channel === 'email' ? user.email : user.phone;
    if (!destination) return { sent: true };

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Retire any earlier outstanding tokens before issuing a fresh one.
    await this.prisma.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    await this.prisma.passwordReset.create({
      data: { tenantId, userId: user.id, tokenHash, channel, destination, expiresAt },
    });

    const base = (this.configService.getOrNull('FRONTEND_URL') || 'http://localhost:3000').replace(/\/+$/, '');
    const resetUrl = `${base}/auth/reset-password?token=${rawToken}`;

    // Best-effort delivery.
    try {
      if (channel === 'email') {
        await this.notifications.sendEmail(destination, 'Reset your Flyngo password', 'password-reset', {
          fullName: user.fullName,
          resetUrl,
        });
      } else {
        await this.notifications.sendSms(
          destination,
          `Flyngo: reset your password using this link (expires in 1 hour): ${resetUrl}`,
        );
      }
    } catch (err: any) {
      // Never leak delivery state to the caller; just record it.
      this.logger.warn(`Password reset delivery failed (${channel}): ${err.message}`);
    }
    // SECURITY: never return the token or the reset URL from this PUBLIC endpoint.
    // Doing so let anyone who knows an email/phone mint a reset link for that
    // account and take it over. The link now only travels over the chosen
    // channel. Two escape hatches exist for the "email is not configured yet"
    // problem this originally solved:
    //   - local dev: EXPOSE_PASSWORD_RESET_LINK=true (ignored in production)
    //   - production: POST /auth/admin/password-reset-link, admin-only, audited
    if (!this.configService.isProduction && this.configService.getBoolean('EXPOSE_PASSWORD_RESET_LINK', false)) {
      return { sent: true, channel, resetUrl, expiresAt };
    }
    return { sent: true, channel };
  }

  /**
   * Admin-issued reset link. Lets staff hand a customer a working link over
   * WhatsApp while email/SMS delivery is unconfigured, without exposing the
   * token generation to the public internet. Caller must be admin/super_admin.
   */
  async createResetLinkForUser(tenantId: string, userId: string, actorId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
      select: { id: true, email: true, phone: true, fullName: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const rawToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await this.prisma.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });
    await this.prisma.passwordReset.create({
      data: {
        tenantId,
        userId: user.id,
        tokenHash: this.hashToken(rawToken),
        channel: 'admin',
        destination: user.email || user.phone || 'admin-issued',
        expiresAt,
      },
    });

    const base = (this.configService.getOrNull('FRONTEND_URL') || 'http://localhost:3000').replace(/\/+$/, '');
    // Handing out a credential is exactly the kind of action that needs a trail.
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: 'auth.password_reset_link.issued',
        entity: 'User',
        entityId: user.id,
      },
    });

    return {
      resetUrl: `${base}/auth/reset-password?token=${rawToken}`,
      expiresAt,
      user: { id: user.id, fullName: user.fullName, phone: user.phone, email: user.email },
    };
  }

  /** Step 3 — consume a token and set the new password. */
  async resetPassword(token: string, password: string) {
    const record = await this.prisma.passwordReset.findUnique({
      where: { tokenHash: this.hashToken(token.trim()) },
    });
    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('This reset link is invalid or has expired. Request a new one.');
    }
    const passwordHash = await bcryptjs.hash(password, 12);
    await this.prisma.$transaction([
      // New password + drop any active refresh token (log out other sessions).
      this.prisma.user.update({
        where: { id: record.userId },
        // Choosing your own password settles the account: clear any outstanding
        // forced-change state so a stale temp password can't linger alongside it.
        data: {
          passwordHash,
          refreshToken: null,
          mustChangePassword: false,
          tempPasswordExpiresAt: null,
          accountStatus: 'active',
          claimedAt: new Date(),
        },
      }),
      this.prisma.passwordReset.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.passwordReset.updateMany({
        where: { userId: record.userId, usedAt: null, id: { not: record.id } },
        data: { usedAt: new Date() },
      }),
    ]);
    return { success: true };
  }

  // ===========================================================================
  // Capture-first accounts
  // ===========================================================================

  /**
   * Resolve the account a booking belongs to, creating a provisional one when
   * the caller is a guest whose number we've never seen.
   *
   * The collision cases are the whole point of this method:
   *
   *   signed in                  → always that user; the typed phone is treated
   *                                as booking contact only, never as identity.
   *   no match                   → create provisional (no password, cannot log in).
   *   provisional match          → reuse it, backfill any blank name/email.
   *   ACTIVE match, not signed in→ link the booking, but return claimed: false
   *                                and say nothing to the caller. Auto-linking
   *                                is safe (they own the number); revealing that
   *                                the account exists, or logging them in, would
   *                                turn the public booking form into an account
   *                                takeover and a phone-enumeration oracle.
   */
  async resolveBookingAccount(
    tenantId: string,
    signedInUserId: string | null,
    contact: { fullName?: string | null; phone?: string | null; email?: string | null },
  ): Promise<{ userId: string | null; created: boolean; provisional: boolean }> {
    if (signedInUserId) {
      return { userId: signedInUserId, created: false, provisional: false };
    }

    const key = phoneCore(contact.phone);
    // Without a usable phone there is no identity to attach to. The booking
    // still saves as a pure guest row — we do not invent an account.
    if (!key) return { userId: null, created: false, provisional: false };

    // Guest accounts are provisioned with a well-known temporary password so
    // staff can share it with the customer over WhatsApp immediately. It never
    // expires (tempPasswordExpiresAt stays null) — first login still forces a
    // change, so the well-known password is only ever used to claim the account.
    const GUEST_TEMP_PASSWORD = '12345678';
    const tempHash = await bcryptjs.hash(GUEST_TEMP_PASSWORD, 12);

    const existing = await this.prisma.user.findFirst({
      where: { tenantId, phoneKey: key, deletedAt: null },
      select: { id: true, accountStatus: true, fullName: true, email: true, phone: true, passwordHash: true },
    });

    if (existing) {
      const isProvisional = existing.accountStatus === 'provisional' || existing.accountStatus === 'invited';
      if (isProvisional) {
        // Fill gaps only — never overwrite something the customer already gave us.
        const patch: Record<string, unknown> = {};
        if (!existing.fullName?.trim() && contact.fullName?.trim()) patch.fullName = contact.fullName.trim();
        if (!existing.email && contact.email?.trim()) patch.email = contact.email.trim();
        // Backfill temp password on old provisionals created before auto-provisioning.
        if (existing.accountStatus === 'provisional' && !existing.passwordHash) {
          patch.passwordHash = tempHash;
          patch.accountStatus = 'invited';
          patch.mustChangePassword = true;
          patch.tempPasswordExpiresAt = null;
        }
        if (Object.keys(patch).length) {
          await this.prisma.user.update({ where: { id: existing.id }, data: patch });
        }
      }
      return { userId: existing.id, created: false, provisional: isProvisional };
    }

    const customerRole = await this.prisma.role.findFirst({ where: { code: 'customer', tenantId } });
    if (!customerRole) {
      // Never fail a booking because the role table is misconfigured.
      this.logger.warn('No customer role for tenant; booking will be saved without an account');
      return { userId: null, created: false, provisional: false };
    }

    try {
      const user = await this.prisma.user.create({
        data: {
          tenantId,
          roleId: customerRole.id,
          fullName: contact.fullName?.trim() || 'Guest',
          phone: contact.phone?.trim() || null,
          phoneKey: key,
          email: contact.email?.trim() || null,
          passwordHash: tempHash,
          accountStatus: 'invited',
          mustChangePassword: true,
          tempPasswordExpiresAt: null,
        },
        select: { id: true },
      });
      // Every new account is credited the signup bonus (default 100 points).
      try {
        await this.referralService.awardSignupBonus(tenantId, user.id);
      } catch (err: any) {
        this.logger.warn(`Signup bonus for provisioned user ${user.id} failed: ${err.message}`);
      }
      return { userId: user.id, created: true, provisional: true };
    } catch (err: any) {
      // Unique violation: another booking for the same number landed first.
      // Re-read rather than failing the customer's booking.
      if (err?.code === 'P2002') {
        const raced = await this.prisma.user.findFirst({
          where: { tenantId, phoneKey: key, deletedAt: null },
          select: { id: true, accountStatus: true, passwordHash: true },
        });
        if (raced) {
          // Backfill the temp password on old provisional accounts that were
          // created before the auto-provisioning upgrade (no password hash).
          if (!raced.passwordHash && raced.accountStatus === 'provisional') {
            try {
              await this.prisma.user.update({
                where: { id: raced.id },
                data: {
                  passwordHash: tempHash,
                  accountStatus: 'invited',
                  mustChangePassword: true,
                  tempPasswordExpiresAt: null,
                },
              });
            } catch (e: any) {
              this.logger.warn(`Backfill temp password failed for ${raced.id}: ${e.message}`);
            }
          }
          // The raced account was just (re)provisioned for this customer — grant
          // the signup bonus if it somehow never received it.
          try {
            await this.referralService.awardSignupBonus(tenantId, raced.id);
          } catch (e: any) {
            this.logger.warn(`Signup bonus for raced user ${raced.id} failed: ${e.message}`);
          }
          return { userId: raced.id, created: false, provisional: raced.accountStatus === 'provisional' || raced.accountStatus === 'invited' };
        }
      }
      this.logger.warn(`Provisional account creation failed (non-blocking): ${err.message}`);
      return { userId: null, created: false, provisional: false };
    }
  }

  /**
   * Issue a one-time temporary password for a customer so staff can pass it on
   * over WhatsApp. Returns the plaintext exactly once — it is stored hashed and
   * cannot be read back.
   *
   * Deliberately random per user. A shared constant (the original request was
   * "12345678" for everyone) would be a public login for every customer, and
   * these accounts hold passport numbers and dates of birth.
   */
  async issueTempPassword(tenantId: string, userId: string, actorId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
      select: { id: true, fullName: true, phone: true, email: true, accountStatus: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const tempPassword = this.generateTempPassword();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcryptjs.hash(tempPassword, 12),
        mustChangePassword: true,
        tempPasswordExpiresAt: expiresAt,
        credentialsSentAt: new Date(),
        accountStatus: 'invited',
        // Any session opened with a previous temporary password is void.
        refreshToken: null,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: actorId,
        action: 'auth.temp_password.issued',
        entity: 'User',
        entityId: user.id,
      },
    });

    return {
      tempPassword,
      expiresAt,
      user: { id: user.id, fullName: user.fullName, phone: user.phone, email: user.email },
    };
  }

  /**
   * Finish the forced change after a first login with a temporary password.
   * Verifies the temporary password again rather than trusting the scoped
   * token alone, so a leaked token is not by itself enough to seize the account.
   */
  async completePasswordChange(tenantId: string, userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, tenantId, deletedAt: null },
      select: { id: true, passwordHash: true, tempPasswordExpiresAt: true },
    });
    if (!user?.passwordHash) throw new UnauthorizedException('Account cannot be updated');

    const ok = await bcryptjs.compare(currentPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('The temporary password is incorrect');
    if (user.tempPasswordExpiresAt && user.tempPasswordExpiresAt < new Date()) {
      throw new UnauthorizedException('This temporary password has expired. Ask us to send a new one.');
    }
    if (newPassword.length < 8) {
      throw new BadRequestException('Your new password must be at least 8 characters');
    }
    if (await bcryptjs.compare(newPassword, user.passwordHash)) {
      throw new BadRequestException('Choose a password different from the temporary one');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcryptjs.hash(newPassword, 12),
        mustChangePassword: false,
        tempPasswordExpiresAt: null,
        accountStatus: 'active',
        claimedAt: new Date(),
        // Reaching this point proves they received the WhatsApp message.
        phoneVerifiedAt: new Date(),
        refreshToken: null,
      },
    });

    return this.generateTokens(user.id, tenantId);
  }

  /**
   * Verify a single-purpose token. JwtAuthGuard refuses anything carrying a
   * `scope`, so the one endpoint that legitimately accepts one checks it here.
   */
  async verifyScopedToken(token: string | undefined, expectedScope: string): Promise<{ sub: string; tenantId: string }> {
    if (!token) throw new UnauthorizedException('Missing token');
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });
      if (payload.scope !== expectedScope) {
        throw new UnauthorizedException('This token cannot be used for this request');
      }
      return { sub: payload.sub, tenantId: payload.tenantId };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('This link has expired. Sign in again to continue.');
    }
  }

  /** Ambiguity-free alphabet: no O/0, I/l/1 — these get read aloud and retyped. */
  private generateTempPassword(): string {
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    return Array.from(crypto.randomBytes(10))
      .map((b) => alphabet[b % alphabet.length])
      .join('');
  }

  private async generateTokens(userId: string, tenantId: string): Promise<TokenResponseDto> {
    const payload = { sub: userId, tenantId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRY', '24h') as SignOptions['expiresIn'],
      }),
    ]);

    // Report the ACTUAL access-token lifetime (seconds) to the client instead
    // of a hardcoded value that silently disagrees with the configured expiry.
    const accessExpiry = this.configService.get('JWT_ACCESS_EXPIRY', '24h');
    const seconds = String(accessExpiry).endsWith('h')
      ? Number(accessExpiry.replace(/h$/, '')) * 3600
      : Number(accessExpiry);

    return {
      accessToken,
      refreshToken,
      expiresIn: Number.isFinite(seconds) && seconds > 0 ? seconds : 86400,
    };
  }
}
