import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

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
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, ...buildOAuthProviders()],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}

function buildOAuthProviders(): any[] {
  const providers: any[] = [];

  if (process.env.GOOGLE_CLIENT_ID) {
    const { GoogleStrategy } = require('./strategies/google.strategy');
    providers.push(GoogleStrategy);
  }

  if (process.env.FACEBOOK_APP_ID) {
    const { FacebookStrategy } = require('./strategies/facebook.strategy');
    providers.push(FacebookStrategy);
  }

  return providers;
}
