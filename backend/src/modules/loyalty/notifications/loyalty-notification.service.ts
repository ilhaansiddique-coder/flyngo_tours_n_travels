import { Injectable, Logger } from '@nestjs/common';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class LoyaltyNotificationService {
  private readonly logger = new Logger(LoyaltyNotificationService.name);

  constructor(private readonly notifications: NotificationsService) {}

  async tierPromoted(tenantId: string, userId: string, tierName: string) {
    try {
      await this.notifications.createNotification(tenantId, {
        userId,
        type: 'in_app',
        title: `You reached ${tierName} tier`,
        body: `You unlocked the ${tierName} FlyNGo Rewards tier.`,
      });
    } catch (error: any) {
      this.logger.warn(`Could not create loyalty notification: ${error?.message ?? error}`);
    }
  }
}
