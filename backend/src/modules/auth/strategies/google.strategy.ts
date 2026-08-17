import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '../../../config/config.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    const clientID = config.getOrNull('GOOGLE_CLIENT_ID');
    const clientSecret = config.getOrNull('GOOGLE_CLIENT_SECRET');

    const apiBase = config.getOrNull('API_PUBLIC_URL')
      || config.getOrNull('BACKEND_PUBLIC_URL')
      || config.get('FRONTEND_URL');

    super({
      clientID: clientID || 'placeholder-client-id',
      clientSecret: clientSecret || 'placeholder-client-secret',
      callbackURL: `${apiBase}/api/v1/auth/google/callback`,
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
    const email = emails?.[0]?.value;
    if (!email) {
      done(new Error('Google account did not return an email address'), undefined);
      return;
    }
    done(null, {
      email,
      fullName: displayName || email.split('@')[0],
      provider: 'google',
      providerId: profile.id,
    });
  }
}
