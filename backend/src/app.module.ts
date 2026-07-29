import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { ToursModule } from './modules/tours/tours.module';
import { HotelsModule } from './modules/hotels/hotels.module';
import { FlightsModule } from './modules/flights/flights.module';
import { VisaModule } from './modules/visa/visa.module';
import { DestinationsModule } from './modules/destinations/destinations.module';
import { BookingModule } from './modules/booking/booking.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CmsModule } from './modules/cms/cms.module';
import { MarketingModule } from './modules/marketing/marketing.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { TenantMiddleware } from './common/middleware/tenant.middleware';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    CommonModule,
    AuthModule,
    UsersModule,
    TenantModule,
    ToursModule,
    HotelsModule,
    FlightsModule,
    VisaModule,
    DestinationsModule,
    BookingModule,
    PaymentsModule,
    CmsModule,
    MarketingModule,
    AiModule,
    NotificationsModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
