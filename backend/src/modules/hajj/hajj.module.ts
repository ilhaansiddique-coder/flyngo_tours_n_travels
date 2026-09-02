import { Module } from '@nestjs/common';
import { HajjPackagesService } from './hajj-packages.service';
import { HajjPackagesController } from './hajj-packages.controller';
import { HajjPreRegistrationService } from './hajj-pre-registration.service';
import { HajjPreRegistrationController } from './hajj-pre-registration.controller';
import { HajjUmrahBookingService } from './hajj-umrah-booking.service';
import { HajjUmrahBookingController } from './hajj-umrah-booking.controller';
import { TrackingModule } from '../tracking/tracking.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReferralModule } from '../referral/referral.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { AuthModule } from '../auth/auth.module';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@Module({
  // AuthModule supplies the JwtService that OptionalJwtAuthGuard needs to link
  // a signed-in pilgrim to their booking (guests still get through).
  imports: [TrackingModule, NotificationsModule, ReferralModule, LoyaltyModule, AuthModule],
  controllers: [HajjPackagesController, HajjPreRegistrationController, HajjUmrahBookingController],
  providers: [HajjPackagesService, HajjPreRegistrationService, HajjUmrahBookingService, OptionalJwtAuthGuard],
  exports: [HajjPackagesService, HajjPreRegistrationService, HajjUmrahBookingService],
})
export class HajjModule {}
