import { Module } from '@nestjs/common';
import { HajjPackagesController } from './hajj-packages.controller';
import { HajjPackagesService } from './hajj-packages.service';
import { HajjPreRegistrationController } from './hajj-pre-registration.controller';
import { HajjPreRegistrationService } from './hajj-pre-registration.service';

@Module({
  controllers: [HajjPackagesController, HajjPreRegistrationController],
  providers: [HajjPackagesService, HajjPreRegistrationService],
  exports: [HajjPackagesService],
})
export class HajjModule {}
