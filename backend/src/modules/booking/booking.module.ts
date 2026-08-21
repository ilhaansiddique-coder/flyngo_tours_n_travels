import { Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { ReferralModule } from '../referral/referral.module';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [ReferralModule, TrackingModule],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
