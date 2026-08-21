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
import { ReferralModule } from './modules/referral/referral.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { AiModule } from './modules/ai/ai.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { VersionModule } from './modules/version/version.module';
import { TransportModule } from './modules/transport/transport.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { HajjModule } from './modules/hajj/hajj.module';
import { UmrahModule } from './modules/umrah/umrah.module';
import { VisaCountriesModule } from './modules/visa-countries/visa-countries.module';
import { MediaModule } from './modules/media/media.module';
import { HeroModule } from './modules/hero/hero.module';
import { GlobeModule } from './modules/globe/globe.module';
import { AboutModule } from './modules/about/about.module';
import { SiteModule } from './modules/site/site.module';
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
    ReferralModule,
    TrackingModule,
    AiModule,
    NotificationsModule,
    AdminModule,
    HealthModule,
    VersionModule,
    TransportModule,
    ReviewsModule,
    HajjModule,
    UmrahModule,
    VisaCountriesModule,
    MediaModule,
    HeroModule,
    GlobeModule,
    AboutModule,
    SiteModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
