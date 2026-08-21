import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { ReferralModule } from '../referral/referral.module';
import { TrackingModule } from '../tracking/tracking.module';

class UnconfiguredFacebookStrategy {
  readonly name = 'facebook';

  authenticate(req: any): void {
    const res = req?.res;
    if (res && typeof res.status === 'function') {
      res.status(503).json({
        statusCode: 503,
        message:
          'Facebook OAuth is not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET.',
      });
      return;
    }
    throw new Error(
      'Facebook OAuth is not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET.',
    );
  }
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: '15m' as const,
        },
      }),
    }),
    ReferralModule,
    TrackingModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    {
      provide: FacebookStrategy,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const hasId = !!config.getOrNull('FACEBOOK_APP_ID');
        const hasSecret = !!config.getOrNull('FACEBOOK_APP_SECRET');
        if (!hasId || !hasSecret) {
          Logger.warn(
            'Facebook OAuth not configured (FACEBOOK_APP_ID / FACEBOOK_APP_SECRET missing) — Facebook login disabled',
            'AuthModule',
          );
          return new UnconfiguredFacebookStrategy() as unknown as FacebookStrategy;
        }
        return new FacebookStrategy(config);
      },
    },
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
