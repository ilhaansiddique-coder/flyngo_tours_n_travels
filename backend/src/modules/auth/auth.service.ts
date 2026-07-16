import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: LoginDto, tenantId: string): Promise<TokenResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcryptjs.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, tenantId);
  }

  async register(dto: RegisterDto, tenantId: string): Promise<TokenResponseDto> {
    const existing = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcryptjs.hash(dto.password, 12);

    const customerRole = await this.prisma.role.findFirst({
      where: { code: 'customer', tenantId },
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        tenantId,
        roleId: customerRole!.id,
      },
    });

    return this.generateTokens(user.id, tenantId);
  }

  async refreshToken(refreshToken: string, tenantId: string): Promise<TokenResponseDto> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findFirst({
        where: { id: payload.sub, tenantId },
      });

      if (!user || user.deletedAt) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user.id, tenantId);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateOAuthUser(profile: { email: string; fullName: string; provider: string; providerId: string }, tenantId: string) {
    let user = await this.prisma.user.findFirst({
      where: { email: profile.email, tenantId },
    });

    if (!user) {
      const customerRole = await this.prisma.role.findFirst({
        where: { code: 'customer', tenantId },
      });

      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          fullName: profile.fullName,
          tenantId,
          roleId: customerRole!.id,
        },
      });
    }

    return this.generateTokens(user.id, tenantId);
  }

  private async generateTokens(userId: string, tenantId: string): Promise<TokenResponseDto> {
    const payload = { sub: userId, tenantId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRY') || '7d',
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }
}
