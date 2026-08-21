import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '../../../config/config.service';
import { OAuthRedirectException } from '../oauth-redirect.exception';

@Catch(OAuthRedirectException)
export class OAuthRedirectFilter implements ExceptionFilter {
  private readonly logger = new Logger(OAuthRedirectFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: OAuthRedirectException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const frontendUrl =
      String(this.configService.get('FRONTEND_URL') || 'http://localhost:3000').replace(
        /\/$/,
        '',
      ) || 'http://localhost:3000';

    this.logger.warn(`OAuth flow ended with reason "${exception.reason}" — redirecting user back`);

    return res.redirect(302, `${frontendUrl}/auth/callback?error=${encodeURIComponent(exception.reason)}`);
  }
}
