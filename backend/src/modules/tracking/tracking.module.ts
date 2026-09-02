import { Module } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingController, LandingPagePublicController } from './tracking.controller';

@Module({
  controllers: [TrackingController, LandingPagePublicController],
  providers: [TrackingService],
  exports: [TrackingService],
})
export class TrackingModule {}
