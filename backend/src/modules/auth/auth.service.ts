import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '../../config/config.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';
import { ReferralService } from '../referral/referral.service';
import { TrackingService } from '../tracking/tracking.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly referralService: ReferralService,
    private readonly trackingService: TrackingService,
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

  async register(dto: RegisterDto, tenantId: string, refCode?: string | null): Promise<TokenResponseDto> {
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

    // Pre-compute a referral code so we can store it on the user in one shot
    const prep = await this.referralService.prepareRegistration(tenantId, refCode || null);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email || null,
        passwordHash,
        fullName: dto.fullName,
        phone: dto.phone,
        tenantId,
        roleId: customerRole!.id,
        referralCode: prep.referralCode,
        referredByCode: refCode ? refCode.trim().toUpperCase() : null,
      },
    });

    // Fire-and-forget: bootstrap affiliate row + create pending referral entry
    try {
      await this.referralService.finalizeRegistration(
        tenantId,
        { id: user.id, fullName: user.fullName, referralCode: prep.referralCode },
        refCode || null,
      );
    } catch (err: any) {
      this.logger.warn(`Referral bootstrap failed (non-blocking): ${err.message}`);
    }

    // Emit server CompleteRegistration so Meta CAPI can dedupe against Pixel
    void this.trackingService.emitServerEvent(tenantId, 'complete_registration', {
      userId: user.id,
      value: 0,
      contentName: 'signup',
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

    if (user) {
      // Link the OAuth identity to the existing account so future logins can
      // find it directly. Do not clobber a different provider on the same row.
      if (!user.provider || !user.providerId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            provider: profile.provider,
            providerId: profile.providerId,
            lastLoginAt: new Date(),
          },
        });
      } else {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
      }
    } else {
      const customerRole = await this.prisma.role.findFirst({
        where: { code: 'customer', tenantId },
      });

      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          fullName: profile.fullName,
          tenantId,
          roleId: customerRole!.id,
          provider: profile.provider,
          providerId: profile.providerId,
          emailVerifiedAt: new Date(),
          lastLoginAt: new Date(),
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
