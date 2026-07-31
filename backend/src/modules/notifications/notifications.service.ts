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

  async listAllNotifications(tenantId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { tenantId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, fullName: true, email: true } } },
      }),
      this.prisma.notification.count({ where: { tenantId } }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async createNotification(tenantId: string, data: { userId?: string; userIds?: string[]; type: string; title: string; body: string; data?: any }) {
    let userIds: string[] = data.userIds ?? [];
    if (data.userId) userIds = [data.userId];
    if (userIds.length === 0) {
      const users = await this.prisma.user.findMany({ where: { tenantId, deletedAt: null }, select: { id: true } });
      userIds = users.map((u) => u.id);
    }
    const created = await this.prisma.$transaction(
      userIds.map((uid) => ({
        tenantId,
        userId: uid,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data ?? undefined,
        sentAt: new Date(),
      })).map((payload) => this.prisma.notification.create({ data: payload as any })),
    );
    return { count: created.length };
  }

  async removeNotification(id: string, tenantId: string) {
    const existing = await this.prisma.notification.findFirst({ where: { id, tenantId } });
    if (!existing) return { success: false };
    await this.prisma.notification.delete({ where: { id } });
    return { success: true };
  }
}
