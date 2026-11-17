import { Module } from '@nestjs/common';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [MarketingController, NewsletterController],
  providers: [MarketingService, NewsletterService],
  exports: [MarketingService],
})
export class MarketingModule {}
