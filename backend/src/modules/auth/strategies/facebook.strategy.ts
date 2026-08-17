import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '../../../config/config.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(config: ConfigService) {
    const clientID = config.getOrNull('FACEBOOK_APP_ID');
    const clientSecret = config.getOrNull('FACEBOOK_APP_SECRET');

    const apiBase = config.getOrNull('API_PUBLIC_URL')
      || config.getOrNull('BACKEND_PUBLIC_URL')
      || config.get('FRONTEND_URL');

    if (!clientID || !clientSecret) {
      throw new UnauthorizedException(
        'Facebook OAuth is not configured. Set FACEBOOK_APP_ID and FACEBOOK_APP_SECRET.',
      );
    }

    super({
      clientID,
      clientSecret,
      callbackURL: `${apiBase}/api/v1/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'displayName', 'name'],
      scope: ['email'],
      enableProof: true,
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: (err: any, user: any) => void,
  ) {
    const { emails, displayName, name } = profile;
    const email = emails?.[0]?.value;
    if (!email) {
      done(new Error('Facebook account did not return an email address. Make sure your email is verified and the "email" permission is granted.'), undefined);
      return;
    }
    const fallbackName =
      displayName ||
      [name?.givenName, name?.familyName].filter(Boolean).join(' ') ||
      email.split('@')[0];
    done(null, {
      email,
      fullName: fallbackName,
      provider: 'facebook',
      providerId: profile.id,
    });
  }
}
