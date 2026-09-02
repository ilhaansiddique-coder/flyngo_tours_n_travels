import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/prisma.service';
import { LOYALTY_TIER_CONFIG, tierBenefits } from './tier.config';

@Injectable()
export class TierService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureDefaults(tenantId: string) {
    for (const tier of LOYALTY_TIER_CONFIG) {
      await this.prisma.loyaltyTier.upsert({
        where: { tenantId_slug: { tenantId, slug: tier.slug } },
        update: {},
        create: {
          tenantId,
          name: tier.name,
          slug: tier.slug,
          color: tier.color,
          starCount: tier.starCount,
          minPoints: tier.threshold,
          redemptionMultiplier: tier.multiplier,
          sortOrder: tier.sortOrder,
          benefits: tierBenefits(tier.slug),
        },
      });
    }
  }

  async list(tenantId: string, activeOnly = true) {
    await this.ensureDefaults(tenantId);
    return this.prisma.loyaltyTier.findMany({
      where: { tenantId, ...(activeOnly ? { isActive: true } : {}) },
      orderBy: { minPoints: 'asc' },
    });
  }

  async highest(tenantId: string, lifetimePoints: number, db?: Prisma.TransactionClient) {
    const client: any = db ?? this.prisma;
    if (!db) await this.ensureDefaults(tenantId);
    return client.loyaltyTier.findFirst({
      where: { tenantId, isActive: true, minPoints: { lte: lifetimePoints } },
      orderBy: { minPoints: 'desc' },
    });
  }

  async syncUserTier(
    tenantId: string,
    userId: string,
    lifetimePoints: number,
    currentTierId: string | null,
    db: Prisma.TransactionClient,
  ) {
    const tier = await this.highest(tenantId, lifetimePoints, db);
    if (!tier || tier.id === currentTierId) return { tier, promoted: false };

    await db.user.update({
      where: { id: userId },
      data: { currentTierId: tier.id, tierAchievedAt: new Date() },
    });
    return { tier, promoted: tier.slug !== 'none' };
  }

  progress(lifetimePoints: number, currentTier: { minPoints: number } | null, nextTier: { minPoints: number } | null) {
    if (!nextTier) return { progress: 100, pointsToNext: 0 };
    // Phase 1 progress is measured against the next absolute threshold.
    // Lifetime points, rather than available points, drive this value.
    const progress = Math.min(100, Math.max(0, Math.round((lifetimePoints / nextTier.minPoints) * 100)));
    return { progress, pointsToNext: Math.max(0, nextTier.minPoints - lifetimePoints) };
  }
}
