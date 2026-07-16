import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '../../../config/config.service';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(config: ConfigService) {
    super({
      clientID: config.getOrNull('FACEBOOK_APP_ID') || '',
      clientSecret: config.getOrNull('FACEBOOK_APP_SECRET') || '',
      callbackURL: `${config.get('FRONTEND_URL')}/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'displayName'],
      scope: ['email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    done: (err: any, user: any) => void,
  ) {
    const { emails, displayName } = profile;
    const user = {
      email: emails?.[0]?.value,
      fullName: displayName,
      provider: 'facebook',
      providerId: profile.id,
    };
    done(null, user);
  }
}
