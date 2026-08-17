import { Controller, Get, Post, Body, HttpCode, HttpStatus, Req, Res, UseGuards, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { ConfigService } from '../../config/config.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
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
    return this.authService.register(dto, tenantId);
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
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Start Google OAuth flow' })
  async googleAuth() {
    // Passport redirects to Google — handler never runs.
  }

  @Get('google/callback')
  @Public()
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res, 'google');
  }

  @Get('facebook')
  @Public()
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Start Facebook OAuth flow' })
  async facebookAuth() {
    // Passport redirects to Facebook — handler never runs.
  }

  @Get('facebook/callback')
  @Public()
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  async facebookAuthCallback(@Req() req: Request, @Res() res: Response) {
    return this.handleOAuthCallback(req, res, 'facebook');
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
