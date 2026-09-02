import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { ReferralModule } from '../referral/referral.module';
import { TrackingModule } from '../tracking/tracking.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { PaymentsModule } from '../payments/payments.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuthModule } from '../auth/auth.module';
import { MarketingModule } from '../marketing/marketing.module';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@Module({
  imports: [ReferralModule, TrackingModule, LoyaltyModule, PaymentsModule, NotificationsModule, AuthModule, MarketingModule],
  controllers: [BookingController],
  providers: [BookingService, OptionalJwtAuthGuard],
  exports: [BookingService],
})
export class BookingModule {}
