import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendEmail(to: string, subject: string, template: string, data: Record<string, any>) {
    // TODO: Implement Resend email sending
    this.logger.log(`Sending email to ${to}: ${subject}`);
    return { sent: true };
  }

  async sendSms(to: string, message: string) {
    // TODO: Implement Twilio SMS sending
    this.logger.log(`Sending SMS to ${to}: ${message}`);
    return { sent: true };
  }

  async sendPushNotification(userId: string, title: string, body: string, data?: Record<string, any>) {
    // TODO: Implement Firebase push notification
    this.logger.log(`Sending push to user ${userId}: ${title}`);
    return { sent: true };
  }

  async getNotifications(userId: string, tenantId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId, tenantId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId, tenantId } }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async markAsRead(id: string, userId: string) {
    await this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
    return { success: true };
  }

  async markAllAsRead(userId: string, tenantId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, tenantId, readAt: null },
      data: { readAt: new Date() },
    });
    return { success: true };
  }
}
