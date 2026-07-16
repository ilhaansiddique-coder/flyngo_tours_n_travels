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
}
