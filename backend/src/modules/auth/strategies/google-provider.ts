import { Logger } from '@nestjs/common';
import { ConfigService } from '../../../config/config.service';
import { GoogleStrategy } from './google.strategy';

export const googleStrategyProvider = {
  provide: GoogleStrategy,
  inject: [ConfigService],
  useFactory: (config: ConfigService): GoogleStrategy | null => {
    if (!config.getOrNull('GOOGLE_CLIENT_ID')?.trim() || !config.getOrNull('GOOGLE_CLIENT_SECRET')?.trim()) {
      Logger.warn('Google OAuth not configured — Google login disabled; password login remains available', 'AuthModule');
      return null;
    }
    return new GoogleStrategy(config);
  },
};
