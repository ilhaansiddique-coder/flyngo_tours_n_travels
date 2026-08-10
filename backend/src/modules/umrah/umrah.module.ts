import { Module } from '@nestjs/common';
import { UmrahPackagesController } from './umrah-packages.controller';
import { UmrahPackagesService } from './umrah-packages.service';

@Module({
  controllers: [UmrahPackagesController],
  providers: [UmrahPackagesService],
  exports: [UmrahPackagesService],
})
export class UmrahModule {}
