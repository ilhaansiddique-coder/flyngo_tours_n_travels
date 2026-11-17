import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { MediaService } from '../media/media.service';
import { MediaDeletionService } from '../media/media-deletion.service';
import { phoneKey } from '../../common/utils/phone.util';

/** Deletes one account's owned data; never follows creator/referrer links into another user. */
@Injectable()
export class AccountDeletionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
    private readonly fileDeletion: MediaDeletionService,
  ) {}

  async remove(id: string, tenantId: string) {
    const queuedFiles = await this.prisma.$transaction(async (tx) => {
      // Stop a concurrent booking from attaching to the account during deletion.
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${id} AND tenant_id = ${tenantId} FOR UPDATE`;
      const user = await tx.user.findFirst({ where: { id, tenantId } });
      if (!user) throw new NotFoundException('User not found');
      const cutoff = user.deletedAt ?? new Date();
      let key = phoneKey(user.phone);
      let email = user.email?.trim().toLowerCase() || null;
      // A recycled contact is not proof that another account's guest data is ours.
      if (key) {
        const owners = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM users
          WHERE tenant_id = ${tenantId} AND id <> ${id} AND deleted_at IS NULL
          AND RIGHT(regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g'), 10) = ${key} LIMIT 1`;
        if (owners.length) key = null;
      }
      if (email && await tx.user.findFirst({ where: {
        tenantId, id: { not: id }, deletedAt: null, email: { equals: email, mode: 'insensitive' },
      }, select: { id: true } })) email = null;

      // Table/column arguments below are fixed application constants, never request input.
      const contactIds = async (table: string, phone: string, mail?: string, guestOnly = false) => {
        if (!key && !(mail && email)) return [] as string[];
        const matches: Prisma.Sql[] = [];
        if (key) matches.push(Prisma.sql`RIGHT(regexp_replace(COALESCE(${Prisma.raw(phone)}, ''), '[^0-9]', '', 'g'), 10) = ${key}`);
        if (mail && email) matches.push(Prisma.sql`LOWER(TRIM(${Prisma.raw(mail)})) = ${email}`);
        const rows = await tx.$queryRaw<{ id: string }[]>(Prisma.sql`SELECT id FROM ${Prisma.raw(table)}
          WHERE tenant_id = ${tenantId} AND created_at <= ${cutoff}
          ${guestOnly ? Prisma.sql`AND user_id IS NULL` : Prisma.empty}
          AND (${Prisma.join(matches, ' OR ')})`);
        return rows.map((row) => row.id);
      };

      const guestBookings = await contactIds('bookings', 'customer_phone', undefined, true);
      const guestPilgrimages = await contactIds('hajj_umrah_bookings', 'customer_phone', 'customer_email', true);
      const bookings = await tx.booking.findMany({ where: { tenantId, OR: [{ userId: id }, { id: { in: guestBookings } }] } });
      const pilgrimages = await tx.hajjUmrahBooking.findMany({ where: { tenantId, OR: [{ userId: id }, { id: { in: guestPilgrimages } }] } });
      const bookingIds = bookings.map((row) => row.id);
      const pilgrimageIds = pilgrimages.map((row) => row.id);
      const allBookingIds = [...bookingIds, ...pilgrimageIds];
      const payments = await tx.payment.findMany({ where: { tenantId, OR: [
        { userId: id }, { bookingId: { in: bookingIds } }, { hajjUmrahBookingId: { in: pilgrimageIds } },
      ] } });
      const paymentIds = payments.map((row) => row.id);
      const invoices = await tx.invoice.findMany({ where: { tenantId, OR: [
        { userId: id }, { bookingId: { in: bookingIds } }, { hajjUmrahBookingId: { in: pilgrimageIds } }, { paymentId: { in: paymentIds } },
      ] } });
      const documents = await tx.userDocument.findMany({ where: { userId: id, tenantId } });
      const posts = await tx.blogPost.findMany({ where: { tenantId, authorId: id } });
      const affiliates = await tx.affiliate.findMany({ where: { tenantId, userId: id }, select: { id: true, referralCode: true } });
      const affiliateIds = affiliates.map((row) => row.id);
      const codes = [...affiliates.map((row) => row.referralCode), ...(user.referralCode ? [user.referralCode] : [])];
      const accounts = await tx.loyaltyAccount.findMany({ where: { tenantId, userId: id }, select: { id: true } });
      const referrals = await tx.affiliateReferral.findMany({ where: { tenantId, OR: [{ referredUserId: id }, { affiliateId: { in: affiliateIds } }] }, select: { id: true } });
      const referralIds = referrals.map((row) => row.id);

      // Collect actual uploaded objects from owned records, including documents in booking JSON.
      const urls = new Set<string>();
      const collect = (value: unknown): void => {
        if (typeof value === 'string') {
          if (this.media.isStoredObjectUrl(value)) urls.add(value);
          for (const match of value.matchAll(/https?:\/\/[^\s"'<>]+|\/api\/v1\/uploads\/[^\s"'<>]+/g)) {
            if (this.media.isStoredObjectUrl(match[0])) urls.add(match[0]);
          }
        } else if (Array.isArray(value)) value.forEach(collect);
        else if (value && typeof value === 'object' && !(value instanceof Date)) Object.values(value).forEach(collect);
      };
      [user, bookings, pilgrimages, payments, invoices, documents, posts].forEach(collect);

      // Remove dependent records before their parents (the transaction rolls back on failure).
      await tx.invoice.deleteMany({ where: { tenantId, id: { in: invoices.map((row) => row.id) } } });
      await tx.paymentMilestone.updateMany({ where: { tenantId, paymentId: { in: paymentIds }, bookingId: { notIn: bookingIds } },
        data: { paymentId: null, paidAmount: 0, status: 'pending', paidAt: null } });
      await tx.payment.deleteMany({ where: { tenantId, id: { in: paymentIds } } });
      await tx.booking.deleteMany({ where: { tenantId, id: { in: bookingIds } } });
      await tx.hajjUmrahBooking.deleteMany({ where: { tenantId, id: { in: pilgrimageIds } } });
      // Travelers, payment milestones and pilgrims cascade with their bookings.
      await tx.blogPost.deleteMany({ where: { tenantId, authorId: id } });
      await tx.review.deleteMany({ where: { tenantId, userId: id } });
      await tx.notification.deleteMany({ where: { tenantId, userId: id } });

      const pointWhere: Prisma.PointTransactionWhereInput = { user: { tenantId }, OR: [
        { userId: id },
        { referenceType: 'REFERRAL', referenceId: id },
        { referenceType: 'BOOKING', referenceId: { in: allBookingIds } },
      ] };
      const affectedPoints = await tx.pointTransaction.findMany({ where: pointWhere, select: { userId: true } });
      await tx.pointTransaction.deleteMany({ where: pointWhere });
      const legacyWhere: Prisma.LoyaltyTransactionWhereInput = { tenantId, OR: [
        { accountId: { in: accounts.map((row) => row.id) } }, { bookingId: { in: allBookingIds } }, { referralId: { in: referralIds } },
      ] };
      const affectedLegacy = await tx.loyaltyTransaction.findMany({ where: legacyWhere, select: { accountId: true } });
      await tx.loyaltyTransaction.deleteMany({ where: legacyWhere });
      await tx.loyaltyAccount.deleteMany({ where: { tenantId, userId: id } });
      const commissionWhere: Prisma.AffiliateCommissionWhereInput = { tenantId, OR: [{ affiliateId: { in: affiliateIds } }, { bookingId: { in: allBookingIds } }] };
      const affectedAffiliates = await tx.affiliateCommission.findMany({ where: commissionWhere, select: { affiliateId: true } });
      await tx.affiliateCommission.deleteMany({ where: commissionWhere });
      await tx.referralLedger.deleteMany({ where: { tenantId, OR: [
        { affiliateId: { in: affiliateIds } }, { referredUserId: id }, { bookingId: { in: allBookingIds } },
      ] } });
      await tx.referralPayout.deleteMany({ where: { tenantId, affiliateId: { in: affiliateIds } } });
      await tx.affiliateReferral.deleteMany({ where: { tenantId, id: { in: referralIds } } });
      await tx.affiliate.deleteMany({ where: { tenantId, userId: id } });

      const leadIds = await contactIds('leads', 'phone', 'email');
      const preRegistrationIds = await contactIds('hajj_pre_registrations', 'phone', 'email');
      const eventIds = await contactIds('tracking_events', 'phone', 'email', true);
      await tx.lead.deleteMany({ where: { tenantId, id: { in: leadIds } } });
      await tx.hajjPreRegistration.deleteMany({ where: { tenantId, id: { in: preRegistrationIds } } });
      await tx.trackingEvent.deleteMany({ where: { tenantId, OR: [{ userId: id }, { externalId: id }, { id: { in: eventIds } }] } });
      const entityIds = [id, ...allBookingIds, ...paymentIds, ...invoices.map((row) => row.id), ...posts.map((row) => row.id), ...leadIds, ...preRegistrationIds];
      await tx.auditLog.deleteMany({ where: { tenantId, OR: [{ userId: id }, { entityId: { in: entityIds } }] } });
      // Payment webhook bodies can also carry contact details. Match exact structured IDs.
      const transactionIds = payments.flatMap((row) => [row.transactionId, row.gatewayRef, row.bkashTrxId].filter((value): value is string => !!value));
      const webhookMatches: Prisma.WebhookEventLogWhereInput[] = [];
      for (const transactionId of transactionIds) for (const jsonPath of [
        ['data', 'object', 'id'], ['data', 'object', 'payment_intent'], ['trxID'], ['paymentID'], ['transactionId'],
      ]) webhookMatches.push({ payload: { path: jsonPath, equals: transactionId } });
      if (webhookMatches.length) await tx.webhookEventLog.deleteMany({ where: {
        OR: webhookMatches, AND: [{ OR: [{ tenantId }, { tenantId: null }] }],
      } });

      // Remove references identifying this person from records owned by somebody else.
      await tx.user.updateMany({ where: { tenantId, createdByUserId: id }, data: { createdByUserId: null } });
      await tx.user.updateMany({ where: { tenantId, referredByCode: { in: codes } }, data: { referredByCode: null } });
      await tx.booking.updateMany({ where: { tenantId, referredByCode: { in: codes } }, data: { referredByCode: null } });
      await tx.hajjUmrahBooking.updateMany({ where: { tenantId, referredByCode: { in: codes } }, data: { referredByCode: null } });
      await tx.payment.updateMany({ where: { tenantId, verifiedById: id }, data: { verifiedById: null } });
      await tx.referralPayout.updateMany({ where: { tenantId, processedBy: id }, data: { processedBy: null } });
      await tx.lead.updateMany({ where: { tenantId, assignedTo: id }, data: { assignedTo: null } });
      await tx.user.delete({ where: { id } });
      // Device tokens, resets, documents and any remaining personal points cascade.

      await this.reconcileRewards(tx, tenantId, id, affectedPoints, affectedLegacy, affectedAffiliates);
      await this.reconcilePayments(tx, tenantId, payments, bookingIds, pilgrimageIds);

      // Only managed storage URLs; preserve files registered to another tenant or shared content.
      const registeredMedia = await tx.media.findMany({ where: { url: { in: [...urls] } }, select: { tenantId: true, tourId: true, hotelId: true, url: true } });
      const queued: string[] = [];
      for (const url of urls) {
        if (registeredMedia.some((file) => file.url === url && (file.tenantId !== tenantId || file.tourId || file.hotelId))) continue;
        // Shared uploads remain in use by their surviving owner.
        if (await this.fileDeletion.hasLiveReferences(url, tx)) continue;
        await tx.mediaDeletionJob.upsert({ where: { tenantId_url: { tenantId, url } }, create: { tenantId, url }, update: {} });
        await tx.media.deleteMany({ where: { tenantId, url } });
        queued.push(url);
      }
      return queued;
    }, { timeout: 60_000, maxWait: 10_000 });
    await this.fileDeletion.flush(tenantId);
    const pendingFileDeletions = queuedFiles.length ? await this.prisma.mediaDeletionJob.count({ where: { tenantId, url: { in: queuedFiles } } }) : 0;
    return { id, deleted: true, permanent: true, pendingFileDeletions };
  }

  private async reconcileRewards(tx: Prisma.TransactionClient, tenantId: string, deletedId: string,
    points: { userId: string }[], legacy: { accountId: string }[], affiliates: { affiliateId: string }[]) {
    for (const userId of new Set(points.map((row) => row.userId).filter((value) => value !== deletedId))) {
      const posted = await tx.pointTransaction.aggregate({ where: { userId, status: 'POSTED' }, _sum: { amount: true } });
      const earned = await tx.pointTransaction.aggregate({ where: { userId, status: 'POSTED', amount: { gt: 0 } }, _sum: { amount: true } });
      const pending = await tx.pointTransaction.aggregate({ where: { userId, status: 'PENDING' }, _sum: { amount: true } });
      const lifetime = Math.max(0, earned._sum.amount ?? 0);
      const tier = await tx.loyaltyTier.findFirst({ where: { tenantId, minPoints: { lte: lifetime } }, orderBy: { minPoints: 'desc' }, select: { id: true } });
      await tx.user.updateMany({ where: { id: userId, tenantId }, data: {
        lifetimePoints: lifetime, availablePoints: Math.max(0, posted._sum.amount ?? 0), pendingPoints: Math.max(0, pending._sum.amount ?? 0), currentTierId: tier?.id ?? null,
      } });
    }
    for (const accountId of new Set(legacy.map((row) => row.accountId))) {
      const account = await tx.loyaltyAccount.findFirst({ where: { id: accountId, tenantId }, select: { id: true } });
      if (!account) continue;
      const rows = await tx.loyaltyTransaction.findMany({ where: { tenantId, accountId }, select: { points: true, type: true } });
      await tx.loyaltyAccount.update({ where: { id: accountId }, data: {
        availablePoints: Math.max(0, rows.reduce((sum, row) => sum + row.points, 0)),
        lifetimePoints: rows.reduce((sum, row) => sum + Math.max(0, row.points), 0),
        redeemedPoints: rows.filter((row) => row.type === 'redemption').reduce((sum, row) => sum + Math.abs(row.points), 0),
      } });
    }
    for (const affiliateId of new Set(affiliates.map((row) => row.affiliateId))) {
      const total = await tx.affiliateCommission.aggregate({ where: { tenantId, affiliateId, status: { not: 'cancelled' } }, _sum: { amount: true } });
      await tx.affiliate.updateMany({ where: { id: affiliateId, tenantId }, data: { totalEarnings: total._sum.amount ?? 0 } });
    }
  }

  private async reconcilePayments(tx: Prisma.TransactionClient, tenantId: string,
    payments: { bookingId: string | null; hajjUmrahBookingId: string | null }[], removedBookings: string[], removedPilgrimages: string[]) {
    for (const bookingId of new Set(payments.map((row) => row.bookingId).filter((value): value is string => !!value && !removedBookings.includes(value)))) {
      const paid = await tx.payment.aggregate({ where: { tenantId, bookingId, status: 'completed' }, _sum: { amount: true } });
      await tx.booking.updateMany({ where: { id: bookingId, tenantId }, data: { paidAmount: paid._sum.amount ?? 0 } });
    }
    for (const bookingId of new Set(payments.map((row) => row.hajjUmrahBookingId).filter((value): value is string => !!value && !removedPilgrimages.includes(value)))) {
      const booking = await tx.hajjUmrahBooking.findFirst({ where: { id: bookingId, tenantId } });
      if (!booking) continue;
      const sum = await tx.payment.aggregate({ where: { tenantId, hajjUmrahBookingId: bookingId, status: 'completed' }, _sum: { amount: true } });
      const paid = Number(sum._sum.amount ?? 0);
      await tx.hajjUmrahBooking.update({ where: { id: bookingId }, data: {
        advancePaid: paid, balanceDue: Math.max(0, Number(booking.totalAmount) - paid), paymentStatus: paid >= Number(booking.totalAmount) ? 'paid' : paid > 0 ? 'partial' : 'unpaid',
      } });
    }
  }
}
