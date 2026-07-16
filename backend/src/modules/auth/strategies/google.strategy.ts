import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '../../../config/config.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrNull('GOOGLE_CLIENT_ID') || '',
      clientSecret: config.getOrNull('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: `${config.get('FRONTEND_URL')}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const { emails, displayName } = profile;
    const user = {
      email: emails[0].value,
      fullName: displayName,
      provider: 'google',
      providerId: profile.id,
    };
    done(null, user);
  }
}
