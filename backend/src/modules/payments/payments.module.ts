import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { BankAccountsService } from './bank-accounts.service';
import { BankAccountsController } from './bank-accounts.controller';
import { MobileWalletsService } from './mobile-wallets.service';
import { MobileWalletsController } from './mobile-wallets.controller';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { LoyaltyModule } from '../loyalty/loyalty.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { MediaModule } from '../media/media.module';
import { AuthModule } from '../auth/auth.module';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';

@Module({
  imports: [LoyaltyModule, NotificationsModule, MediaModule, AuthModule],
  controllers: [PaymentsController, BankAccountsController, MobileWalletsController, InvoicesController],
  providers: [PaymentsService, BankAccountsService, MobileWalletsService, InvoicesService, OptionalJwtAuthGuard],
  exports: [PaymentsService, BankAccountsService, MobileWalletsService, InvoicesService],
})
export class PaymentsModule {}
