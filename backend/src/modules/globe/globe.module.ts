import { Module } from '@nestjs/common';
import { GlobeService } from './globe.service';
import { GlobeController } from './globe.controller';
import { GlobeAdminController } from './globe-admin.controller';

@Module({
  controllers: [GlobeController, GlobeAdminController],
  providers: [GlobeService],
  exports: [GlobeService],
})
export class GlobeModule {}
