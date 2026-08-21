import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Req, Res, UseGuards, UseFilters, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../database/prisma.service';
import { GoogleOAuthGuard, FacebookOAuthGuard } from './guards/oauth.guards';
import { OAuthRedirectFilter } from './filters/oauth-redirect.filter';

@ApiTags('Authentication')
@UseFilters(OAuthRedirectFilter)
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, type: TokenResponseDto })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const tenantId = this.getTenantId(req);
    return this.authService.login(dto, tenantId);
  }

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new customer account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, type: TokenResponseDto })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const tenantId = this.getTenantId(req);
    const refCode =
      dto.referralCode ||
      ((req.headers['x-referral-code'] as string) || '').trim() ||
      ((req.cookies as any)?.ref_code || '').trim() ||
      null;
    return this.authService.register(dto, tenantId, refCode);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body('refreshToken') refreshToken: string, @Req() req: Request) {
    const tenantId = this.getTenantId(req);
    return this.authService.refreshToken(refreshToken, tenantId);
  }

  @Get('google')
  @Public()
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Start Google OAuth flow' })
  async googleAuth() {
    // Passport redirects to Google — handler never runs.
  }

  @Get('google/callback')
  @Public()
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res, 'google');
  }

  @Get('facebook')
  @Public()
  @UseGuards(FacebookOAuthGuard)
  @ApiOperation({ summary: 'Start Facebook OAuth flow' })
  async facebookAuth() {
    // Passport redirects to Facebook — handler never runs.
  }

  @Get('facebook/callback')
  @Public()
  @UseGuards(FacebookOAuthGuard)
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res, 'facebook');
  }

  @Post('facebook/delete')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Facebook Data Deletion Callback' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: { signed_request: { type: 'string' } },
      required: ['signed_request'],
    },
  })
  async facebookDataDeletion(@Body('signed_request') signedRequest: string) {
    return this.handleFacebookDataDeletion(signedRequest);
  }

  @Get('facebook/delete')
  @Public()
  @ApiOperation({ summary: 'Facebook Data Deletion Callback (GET form)' })
  async facebookDataDeletionGet(@Query('signed_request') signedRequest: string) {
    return this.handleFacebookDataDeletion(signedRequest);
  }

  private async handleFacebookDataDeletion(signedRequest: string | undefined) {
    if (!signedRequest || typeof signedRequest !== 'string') {
      throw new BadRequestException('signed_request is required');
    }

    const appSecret = this.configService.getOrNull('FACEBOOK_APP_SECRET');
    if (!appSecret) {
      throw new InternalServerErrorException('Facebook app secret is not configured');
    }

    const payload = this.verifyFacebookSignedRequest(signedRequest, appSecret);
    if (!payload) {
      throw new BadRequestException('Invalid signed_request signature');
    }

    const fbUserId = (payload as { user_id?: string }).user_id;
    if (!fbUserId) {
      throw new BadRequestException('signed_request payload missing user_id');
    }

    const tenantId = (payload as { tenant_id?: string }).tenant_id
      || '00000000-0000-0000-0000-000000000001';

    const user = await this.prisma.user.findFirst({
      where: { provider: 'facebook', providerId: fbUserId, tenantId, deletedAt: null },
    });

    const confirmationCode = crypto.randomBytes(16).toString('hex');

    if (user) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          deletedAt: new Date(),
          providerId: null,
        },
      });
      this.logger.log(`Facebook data deletion processed for user ${user.id} (fb:${fbUserId})`);
    } else {
      this.logger.warn(`Facebook data deletion: no matching user for fb:${fbUserId}`);
    }

    const frontendUrl = this.configService.get('FRONTEND_URL');
    const statusUrl = `${frontendUrl}/auth/facebook-data-deletion?code=${confirmationCode}`;

    return {
      url: statusUrl,
      confirmation_code: confirmationCode,
    };
  }

  private verifyFacebookSignedRequest(
    signedRequest: string,
    appSecret: string,
  ): Record<string, unknown> | null {
    const parts = signedRequest.split('.');
    if (parts.length !== 2) return null;

    const [encodedSig, encodedPayload] = parts;
    try {
      const sig = this.base64UrlDecode(encodedSig);
      const payload = this.base64UrlDecode(encodedPayload);
      const expectedSig = crypto
        .createHmac('sha256', appSecret)
        .update(encodedPayload)
        .digest();

      if (sig.length !== expectedSig.length) return null;
      if (!crypto.timingSafeEqual(sig, expectedSig)) return null;

      const payloadJson = JSON.parse(payload.toString('utf8'));
      if (payloadJson.algorithm && payloadJson.algorithm !== 'HMAC-SHA256') return null;
      return payloadJson;
    } catch {
      return null;
    }
  }

  private base64UrlDecode(input: string): Buffer {
    const padded = input.replace(/-/g, '+').replace(/_/g, '/');
    const padding = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
    return Buffer.from(padded + padding, 'base64');
  }

  private async handleOAuthCallback(req: Request, res: Response, provider: 'google' | 'facebook') {
    const profile = req.user as
      | { email: string; fullName: string; provider: string; providerId: string }
      | undefined;

    if (!profile || !profile.email) {
      this.logger.error(`${provider} OAuth callback received no profile`);
      return res.redirect(this.errorRedirect('authentication_failed'));
    }

    const tenantId = this.getTenantId(req);
    try {
      const tokens = await this.authService.validateOAuthUser(profile, tenantId);
      const frontendUrl = this.configService.get('FRONTEND_URL');
      const params = new URLSearchParams({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: String(tokens.expiresIn),
        provider,
      });
      return res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
    } catch (err: any) {
      this.logger.error(`${provider} OAuth callback failed: ${err?.message ?? err}`);
      return res.redirect(this.errorRedirect('oauth_signin_failed'));
    }
  }

  private errorRedirect(reason: string): string {
    const frontendUrl = this.configService.get('FRONTEND_URL');
    return `${frontendUrl}/auth/callback?error=${encodeURIComponent(reason)}`;
  }

  private getTenantId(req: Request): string {
    return (req as any).tenantId ||
      (req.headers['x-tenant-id'] as string) ||
      '00000000-0000-0000-0000-000000000001';
  }
}
