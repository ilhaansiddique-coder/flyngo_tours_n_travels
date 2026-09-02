import { Module } from '@nestjs/common';
import { LoyaltyService } from './loyalty.service';
import { LoyaltyController } from './loyalty.controller';
import { LoyaltyAdminController } from './loyalty-admin.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { LedgerService } from './ledger/ledger.service';
import { TierService } from './tiers/tier.service';
import { LoyaltyReferralService } from './referrals/referral.service';
import { RedemptionService } from './redemption/redemption.service';
import { LoyaltyNotificationService } from './notifications/loyalty-notification.service';

@Module({
  imports: [NotificationsModule],
  controllers: [LoyaltyController, LoyaltyAdminController],
  providers: [
    LoyaltyService,
    LedgerService,
    TierService,
    LoyaltyReferralService,
    RedemptionService,
    LoyaltyNotificationService,
  ],
  exports: [LoyaltyService],
})
export class LoyaltyModule {}
