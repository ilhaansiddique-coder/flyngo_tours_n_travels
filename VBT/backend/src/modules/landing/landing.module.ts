import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { LandingController } from './landing.controller';
import { LandingService } from './landing.service';
import { AdminGuard } from '../admin/admin.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [LandingController],
  providers: [LandingService, AdminGuard],
})
export class LandingModule {}