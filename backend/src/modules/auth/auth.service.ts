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
    // Users can sign in by either email or phone. The frontend sends both keys
    // with the unused one blank, so only non-empty identifiers become filters:
    // an `undefined` value would be dropped by Prisma and let the OR match an
    // arbitrary user in the tenant.
    const orFilters: any[] = [];
    if (dto.email) orFilters.push({ email: dto.email });
    if (dto.phone) orFilters.push({ phone: dto.phone });

    if (orFilters.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.prisma.user.findFirst({
      where: { tenantId, OR: orFilters, deletedAt: null },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcryptjs.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, tenantId);
  }

  async register(dto: RegisterDto, tenantId: string): Promise<TokenResponseDto> {
    // Uniqueness check — at least one of (email, phone) must be present
    // and neither can already be registered for this tenant.
    const orFilters: any[] = [];
    if (dto.email) orFilters.push({ email: dto.email });
    if (dto.phone) orFilters.push({ phone: dto.phone });

    const existing = await this.prisma.user.findFirst({
      where: { tenantId, OR: orFilters, deletedAt: null },
    });
    if (existing) {
      throw new ConflictException('An account with this email or phone already exists');
    }

    const passwordHash = await bcryptjs.hash(dto.password, 12);

    const customerRole = await this.prisma.role.findFirst({
      where: { code: 'customer', tenantId },
    });

    const user = await this.prisma.user.create({
      data: {
        email: dto.email || null,
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

    if (!user || user.deletedAt || !user.passwordHash) {
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
        expiresIn: '7d' as const,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900,
    };
  }
}
