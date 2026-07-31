import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createPaymentIntent(tenantId: string, userId: string, bookingId: string, method: string, amount: number) {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId, userId },
    });

    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const payment = await this.prisma.payment.create({
      data: {
        tenantId,
        userId,
        bookingId,
        amount,
        currency: 'BDT',
        method,
        status: 'pending',
        transactionId: `PAY-${Date.now()}`,
      },
    });

    return payment;
  }

  async getPaymentStatus(id: string, tenantId: string, userId: string) {
    return this.prisma.payment.findFirst({
      where: { id, tenantId, userId },
    });
  }

  async handleStripeWebhook(signature: string, payload: Buffer) {
    // TODO: Implement Stripe webhook verification
    return { received: true };
  }

  async handleBKashWebhook(payload: any) {
    // TODO: Implement bKash webhook verification
    return { received: true };
  }

  async listAllPayments(tenantId: string, page = 1, limit = 20, filters?: { status?: string; method?: string }) {
    const where: any = { tenantId };
    if (filters?.status) where.status = filters.status;
    if (filters?.method) where.method = filters.method;
    const [items, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          booking: { select: { id: true, bookingCode: true, totalAmount: true } },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async updatePaymentStatus(id: string, tenantId: string, status: string) {
    const existing = await this.prisma.payment.findFirst({ where: { id, tenantId } });
    if (!existing) throw new BadRequestException('Payment not found');
    return this.prisma.payment.update({ where: { id }, data: { status } });
  }

  async getPaymentStats(tenantId: string) {
    const [total, byStatus, byMethod, sum] = await Promise.all([
      this.prisma.payment.count({ where: { tenantId } }),
      this.prisma.payment.groupBy({ by: ['status'], where: { tenantId }, _count: { id: true } }),
      this.prisma.payment.groupBy({ by: ['method'], where: { tenantId }, _count: { id: true } }),
      this.prisma.payment.aggregate({ where: { tenantId, status: 'completed' }, _sum: { amount: true } }),
    ]);
    return {
      total,
      totalCompleted: sum._sum.amount || 0,
      byStatus: byStatus.reduce((acc: Record<string, number>, b) => ({ ...acc, [b.status]: b._count.id }), {}),
      byMethod: byMethod.reduce((acc: Record<string, number>, b) => ({ ...acc, [b.method]: b._count.id }), {}),
    };
  }
}
