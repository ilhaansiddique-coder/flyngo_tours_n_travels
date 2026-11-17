import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MediaModule } from '../media/media.module';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { AccountDeletionModule } from './account-deletion.module';

@Module({
  imports: [MediaModule, LoyaltyModule, AccountDeletionModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
