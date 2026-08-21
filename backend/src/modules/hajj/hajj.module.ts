import { Module } from '@nestjs/common';
import { HajjPackagesService } from './hajj-packages.service';
import { HajjPackagesController } from './hajj-packages.controller';
import { HajjPreRegistrationService } from './hajj-pre-registration.service';
import { HajjPreRegistrationController } from './hajj-pre-registration.controller';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [TrackingModule],
  controllers: [HajjPackagesController, HajjPreRegistrationController],
  providers: [HajjPackagesService, HajjPreRegistrationService],
  exports: [HajjPackagesService, HajjPreRegistrationService],
})
export class HajjModule {}
