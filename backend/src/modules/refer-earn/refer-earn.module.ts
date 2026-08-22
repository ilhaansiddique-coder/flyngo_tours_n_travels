import { Module } from '@nestjs/common';
import { ReferEarnService } from './refer-earn.service';
import { ReferEarnController } from './refer-earn.controller';

@Module({
  controllers: [ReferEarnController],
  providers: [ReferEarnService],
  exports: [ReferEarnService],
})
export class ReferEarnModule {}
