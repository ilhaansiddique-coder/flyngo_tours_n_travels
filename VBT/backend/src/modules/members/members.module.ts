import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { AdminGuard } from '../admin/admin.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [MembersController],
  providers: [MembersService, AdminGuard],
  exports: [MembersService],
})
export class MembersModule {}