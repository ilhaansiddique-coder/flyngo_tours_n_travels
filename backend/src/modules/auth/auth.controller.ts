import { Controller, Post, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, type: TokenResponseDto })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const tenantId = (req as any).tenantId;
    return this.authService.login(dto, tenantId);
  }

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new customer account' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, type: TokenResponseDto })
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const tenantId = (req as any).tenantId;
    return this.authService.register(dto, tenantId);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body('refreshToken') refreshToken: string, @Req() req: Request) {
    const tenantId = (req as any).tenantId;
    return this.authService.refreshToken(refreshToken, tenantId);
  }
}
