import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  PointReferenceType,
  PointTransactionStatus,
  PointTransactionType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { TierService } from '../tiers/tier.service';
import { LoyaltyNotificationService } from '../notifications/loyalty-notification.service';
import { LedgerEntryInput, TransactionCursor } from './ledger.types';

@Injectable()
export class LedgerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tiers: TierService,
    private readonly loyaltyNotifications: LoyaltyNotificationService,
  ) {}

  async post(input: LedgerEntryInput) {
    const user = await this.prisma.user.findUnique({ where: { id: input.userId }, select: { tenantId: true } });
    if (!user) throw new NotFoundException('User not found');
    await this.tiers.ensureDefaults(user.tenantId);
    let result;
    try {
      result = await this.prisma.$transaction((db) => this.applyEntry(db, { ...input, status: input.status ?? PointTransactionStatus.POSTED }));
    } catch (error: any) {
      if (error?.code !== 'P2002') throw error;
      const existing = await this.prisma.pointTransaction.findFirst({
        where: {
          OR: [
            { idempotencyKey: input.idempotencyKey },
            { referenceType: input.referenceType, referenceId: input.referenceId, type: input.type },
          ],
        },
      });
      if (!existing) throw error;
      result = { transaction: existing, promoted: null };
    }
    await this.notifyPromotion(input.userId, result.promoted);
    return result;
  }

  async postBookingConfirmation(userId: string, bookingId: string, amount: number, metadata: Record<string, unknown> = {}) {
    if (amount <= 0) return null;
    return this.post({
      userId,
      amount,
      type: PointTransactionType.BOOKING_CONFIRMED,
      status: PointTransactionStatus.PENDING,
      referenceType: PointReferenceType.BOOKING,
      referenceId: bookingId,
      idempotencyKey: `booking:${bookingId}:confirmed`,
      metadata,
    });
  }

  async postBookingCompletion(userId: string, bookingId: string, totalAmount: number, metadata: Record<string, unknown> = {}) {
    if (totalAmount <= 0) return null;
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    if (!user) throw new NotFoundException('User not found');
    await this.tiers.ensureDefaults(user.tenantId);

    let result;
    try {
      result = await this.prisma.$transaction(async (db) => {
      const existingCompletion = await db.pointTransaction.findFirst({
        where: {
          userId,
          type: PointTransactionType.BOOKING_COMPLETED,
          referenceType: PointReferenceType.BOOKING,
          referenceId: bookingId,
        },
      });
      if (existingCompletion) return { transaction: existingCompletion, promoted: null };

      const confirmation = await db.pointTransaction.findFirst({
        where: {
          userId,
          type: PointTransactionType.BOOKING_CONFIRMED,
          referenceType: PointReferenceType.BOOKING,
          referenceId: bookingId,
          status: { in: [PointTransactionStatus.PENDING, PointTransactionStatus.POSTED] },
        },
      });
      let confirmedEntry = confirmation;
      if (!confirmedEntry && Math.floor(totalAmount / 2) > 0) {
        const created = await this.applyEntry(db, {
          userId,
          amount: Math.floor(totalAmount / 2),
          type: PointTransactionType.BOOKING_CONFIRMED,
          status: PointTransactionStatus.PENDING,
          referenceType: PointReferenceType.BOOKING,
          referenceId: bookingId,
          idempotencyKey: `booking:${bookingId}:confirmed`,
          metadata: { ...metadata, stage: 'confirmed' },
        });
        confirmedEntry = created.transaction;
      }
      const confirmedAmount = confirmedEntry?.amount ?? 0;
      const completionAmount = Math.max(0, totalAmount - confirmedAmount);

      let promoted: any = null;
      if (confirmedEntry?.status === PointTransactionStatus.PENDING) {
        // Claim the pending row before releasing its points. A duplicate
        // completion event can therefore never release the same points twice.
        const claimed = await db.pointTransaction.updateMany({
          where: { id: confirmedEntry.id, status: PointTransactionStatus.PENDING },
          data: { status: PointTransactionStatus.POSTED },
        });
        if (claimed.count === 1) {
          const account = await db.user.update({
            where: { id: userId },
            data: {
              pendingPoints: { decrement: confirmedEntry.amount },
              lifetimePoints: { increment: confirmedEntry.amount },
              availablePoints: { increment: confirmedEntry.amount },
            },
          });
          await db.pointTransaction.update({
            where: { id: confirmedEntry.id },
            data: { balanceAfter: this.balance(account) },
          });
          const tierResult = await this.tiers.syncUserTier(
            account.tenantId,
            userId,
            account.lifetimePoints,
            account.currentTierId,
            db,
          );
          if (tierResult.promoted) promoted = tierResult.tier;
        } else {
          confirmedEntry = await db.pointTransaction.findUnique({ where: { id: confirmedEntry.id } });
        }
      }

      if (completionAmount <= 0 && confirmedEntry) return { transaction: confirmedEntry, promoted };
      const entry = await this.applyEntry(db, {
        userId,
        amount: completionAmount,
        type: PointTransactionType.BOOKING_COMPLETED,
        status: PointTransactionStatus.POSTED,
        referenceType: PointReferenceType.BOOKING,
        referenceId: bookingId,
        idempotencyKey: `booking:${bookingId}:completed`,
        metadata,
      });
      return { transaction: entry.transaction, promoted: promoted ?? entry.promoted };
      });
    } catch (error: any) {
      if (error?.code !== 'P2002') throw error;
      const existing = await this.prisma.pointTransaction.findFirst({
        where: {
          userId,
          type: PointTransactionType.BOOKING_COMPLETED,
          referenceType: PointReferenceType.BOOKING,
          referenceId: bookingId,
        },
      });
      if (!existing) throw error;
      result = { transaction: existing, promoted: null };
    }

    await this.notifyPromotion(userId, result.promoted);
    return result.transaction;
  }

  async reverseBooking(userId: string, bookingId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    if (!user) throw new NotFoundException('User not found');
    await this.tiers.ensureDefaults(user.tenantId);
    const result = await this.prisma.$transaction(async (db) => {
      const originals = await db.pointTransaction.findMany({
        where: {
          userId,
          referenceType: PointReferenceType.BOOKING,
          referenceId: bookingId,
          type: { in: [PointTransactionType.BOOKING_CONFIRMED, PointTransactionType.BOOKING_COMPLETED] },
          status: { in: [PointTransactionStatus.PENDING, PointTransactionStatus.POSTED] },
        },
        orderBy: { createdAt: 'asc' },
      });
      const reversals: any[] = [];
      for (const original of originals) {
        if (original.status === PointTransactionStatus.PENDING) {
          await db.$executeRaw`
            UPDATE "users"
            SET "pending_points" = GREATEST("pending_points" - ${original.amount}, 0)
            WHERE "id" = ${userId}
          `;
        } else {
          // A customer may have spent some points before a refund. Keep the
          // redeemable cache non-negative; lifetime history is never reduced.
          await db.$executeRaw`
            UPDATE "users"
            SET "available_points" = GREATEST("available_points" - ${original.amount}, 0)
            WHERE "id" = ${userId}
          `;
        }
        const account = await db.user.findUnique({ where: { id: userId } });
        if (!account) throw new NotFoundException('User not found');
        await db.pointTransaction.update({
          where: { id: original.id },
          data: { status: PointTransactionStatus.REVERSED, balanceAfter: this.balance(account) },
        });
        await this.tiers.syncUserTier(
          account.tenantId,
          userId,
          account.lifetimePoints,
          account.currentTierId,
          db,
        );
        // The balance was adjusted above according to the original status. A
        // reversal row is an audit entry and must not apply that adjustment a
        // second time.
        const reversal = await db.pointTransaction.create({
          data: {
            userId,
            amount: -original.amount,
            type: PointTransactionType.REVERSAL,
            status: PointTransactionStatus.POSTED,
            referenceType: PointReferenceType.BOOKING,
            referenceId: original.id,
            idempotencyKey: `booking:${bookingId}:reversal:${original.id}`,
            balanceAfter: this.balance(account),
            metadata: { originalTransactionId: original.id, bookingId },
          },
        });
        reversals.push(reversal);
      }
      return reversals;
    });
    return result;
  }

  async listForUser(userId: string, type?: string, cursor?: TransactionCursor, limit = 25) {
    const take = Math.min(Math.max(limit, 1), 100);
    const items = await this.prisma.pointTransaction.findMany({
      where: {
        userId,
        ...(type && Object.values(PointTransactionType).includes(type as PointTransactionType)
          ? { type: type as PointTransactionType }
          : {}),
        ...(cursor ? {
          OR: [
            { createdAt: { lt: new Date(cursor.createdAt) } },
            { createdAt: new Date(cursor.createdAt), id: { lt: cursor.id } },
          ],
        } : {}),
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: take + 1,
    });
    const hasMore = items.length > take;
    const page = hasMore ? items.slice(0, take) : items;
    const last = page[page.length - 1];
    return {
      items: page,
      nextCursor: hasMore && last
        ? Buffer.from(JSON.stringify({ createdAt: last.createdAt.toISOString(), id: last.id })).toString('base64url')
        : null,
    };
  }

  async listForTenant(tenantId: string, opts: { userId?: string; type?: string; page?: number; limit?: number } = {}) {
    const page = Math.max(opts.page ?? 1, 1);
    const limit = Math.min(Math.max(opts.limit ?? 50, 1), 200);
    const where: Prisma.PointTransactionWhereInput = {
      user: { tenantId },
      ...(opts.userId ? { userId: opts.userId } : {}),
      ...(opts.type && Object.values(PointTransactionType).includes(opts.type as PointTransactionType)
        ? { type: opts.type as PointTransactionType }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.pointTransaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { id: true, fullName: true, email: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.pointTransaction.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  private async applyEntry(db: Prisma.TransactionClient, input: LedgerEntryInput) {
    const existing = await db.pointTransaction.findFirst({
      where: {
        OR: [
          { idempotencyKey: input.idempotencyKey },
          { referenceType: input.referenceType, referenceId: input.referenceId, type: input.type },
        ],
      },
    });
    if (existing) return { transaction: existing, promoted: null };

    const user = await db.user.findUnique({ where: { id: input.userId } });
    if (!user) throw new NotFoundException('User not found');
    const status = input.status ?? PointTransactionStatus.POSTED;
    if (status === PointTransactionStatus.PENDING) {
      if (input.amount < 0) {
        const changed = await db.user.updateMany({
          where: { id: input.userId, pendingPoints: { gte: Math.abs(input.amount) } },
          data: { pendingPoints: { decrement: Math.abs(input.amount) } },
        });
        if (changed.count !== 1) throw new BadRequestException('Insufficient pending points');
      } else {
        await db.user.update({
          where: { id: input.userId },
          data: { pendingPoints: { increment: input.amount } },
        });
      }
    } else if (input.amount < 0) {
      // Negative entries reverse or debit available points only. Lifetime points
      // are historical and must never decrease.
      const changed = await db.user.updateMany({
        where: { id: input.userId, availablePoints: { gte: Math.abs(input.amount) } },
        data: { availablePoints: { decrement: Math.abs(input.amount) } },
      });
      if (changed.count !== 1) throw new BadRequestException('Insufficient available points');
    } else {
      await db.user.update({
        where: { id: input.userId },
        data: {
          lifetimePoints: { increment: input.amount },
          availablePoints: { increment: input.amount },
        },
      });
    }
    const updated = await db.user.findUnique({ where: { id: input.userId } });
    if (!updated) throw new NotFoundException('User not found');
    const tier = await this.tiers.highest(updated.tenantId, updated.lifetimePoints, db);
    const transaction = await db.pointTransaction.create({
      data: {
        userId: input.userId,
        type: input.type,
        amount: input.amount,
        status,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
        idempotencyKey: input.idempotencyKey,
        balanceAfter: this.balance(updated),
        metadata: {
          ...(input.metadata ?? {}),
          tier: tier?.slug ?? null,
          multiplier: tier ? Number(tier.redemptionMultiplier) : 1,
        } as Prisma.InputJsonValue,
      },
    });

    let promoted: any = null;
    if (status !== PointTransactionStatus.PENDING && input.amount > 0) {
      const tierResult = await this.tiers.syncUserTier(
        updated.tenantId,
        input.userId,
        updated.lifetimePoints,
        updated.currentTierId,
        db,
      );
      if (tierResult.promoted) promoted = tierResult.tier;
    }
    return { transaction, promoted };
  }

  private balance(user: { lifetimePoints: number; availablePoints: number; pendingPoints: number }) {
    return {
      lifetime: user.lifetimePoints,
      available: user.availablePoints,
      pending: user.pendingPoints,
    };
  }

  private async notifyPromotion(userId: string, tier: any) {
    if (!tier) return;
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { tenantId: true } });
    if (user) await this.loyaltyNotifications.tierPromoted(user.tenantId, userId, tier.name);
  }
}
