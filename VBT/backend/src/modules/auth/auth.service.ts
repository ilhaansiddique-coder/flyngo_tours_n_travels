import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../database/prisma.service';
import type { UserTokenPayload } from './user.guard';

export interface AuthResult {
  success: boolean;
  token?: string;
  user: { id: string; email?: string | null; name: string; phone?: string | null; role: string };
}

export interface ResetResult {
  success: boolean;
  resetToken?: string;
  expiresAt?: string;
  delivery?: 'dev' | 'email';
  message?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async signToken(user: { id: string; email?: string | null; role: string }) {
    const payload: UserTokenPayload = { sub: user.id, email: user.email ?? null, role: user.role };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('USER_JWT_EXPIRY', '30d') as `${number}d`,
    });
  }

  private toResult(user: {
    id: string;
    email?: string | null;
    name: string;
    phone?: string | null;
    role: string;
  }): AuthResult {
    return {
      success: true,
      user: { id: user.id, email: user.email ?? undefined, name: user.name, phone: user.phone, role: user.role },
    };
  }

  async signup(input: { name: string; email?: string; password: string; phone: string }) {
    const phone = input.phone.trim();
    const email = input.email?.trim().toLowerCase() || null;
    const byPhone = await this.prisma.user.findUnique({ where: { phone } });
    if (byPhone) throw new ConflictException('An account with this phone number already exists');
    if (email) {
      const byEmail = await this.prisma.user.findUnique({ where: { email } });
      if (byEmail) throw new ConflictException('An account with this email already exists');
    }
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        email,
        phone,
        passwordHash,
        role: 'USER',
      },
    });
    const token = await this.signToken(user);
    return { ...this.toResult(user), token };
  }

  async signin(input: { identifier: string; password: string }) {
    const identifier = input.identifier.trim();
    const user = identifier.includes('@')
      ? await this.prisma.user.findUnique({ where: { email: identifier.toLowerCase() } })
      : await this.prisma.user.findUnique({ where: { phone: identifier } });
    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new BadRequestException('Invalid credentials');
    }
    const token = await this.signToken(user);
    return { ...this.toResult(user), token };
  }

  async forgotPassword(emailAddress: string): Promise<ResetResult> {
    const email = emailAddress.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    const result: ResetResult = { success: true };
    if (!user) {
      result.message =
        'If an account exists for that email, a reset link has been generated.';
      return result;
    }
    const resetToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(resetToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await this.prisma.passwordResetToken.create({
      data: { email, tokenHash, expiresAt },
    });
    const smtpConfigured = Boolean(
      this.configService.getOrNull('SMTP_HOST') && this.configService.getOrNull('SMTP_USER'),
    );
    if (smtpConfigured) {
      // TODO: send the reset link via the configured SMTP transport.
      result.delivery = 'email';
      result.message = 'Password reset link sent to your email.';
    } else {
      // No mail transport configured — return the token so the flow stays testable.
      result.delivery = 'dev';
      result.resetToken = resetToken;
      result.expiresAt = expiresAt.toISOString();
      result.message =
        'No SMTP configured — returning the reset token directly (dev mode).';
    }
    return result;
  }

  async resetPassword(input: { email: string; token: string; newPassword: string }) {
    const email = input.email.toLowerCase();
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('No account found for that email');
    const tokenHash = createHash('sha256').update(input.token).digest('hex');
    const record = await this.prisma.passwordResetToken.findFirst({
      where: { email, tokenHash, usedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw new BadRequestException('Invalid or already used reset token');
    if (record.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await bcrypt.hash(input.newPassword, 10) },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);
    return { success: true, message: 'Password updated. You can now sign in.' };
  }

  async me(payload: UserTokenPayload) {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new NotFoundException('Account not found');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async adminListUsers(page = 1, pageSize = 50) {
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        take: pageSize,
        skip: (page - 1) * pageSize,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, name: true, phone: true, role: true, createdAt: true },
      }),
      this.prisma.user.count(),
    ]);
    return { items, total, page, pageSize };
  }

  async adminCreateUser(input: {
    name: string;
    email?: string;
    role?: string;
    phone: string;
    password: string;
  }) {
    const phone = input.phone.trim();
    const email = input.email?.trim().toLowerCase() || null;
    const byPhone = await this.prisma.user.findUnique({ where: { phone } });
    if (byPhone) throw new ConflictException('A user with this phone number already exists');
    if (email) {
      const byEmail = await this.prisma.user.findUnique({ where: { email } });
      if (byEmail) throw new ConflictException('A user with this email already exists');
    }
    const user = await this.prisma.user.create({
      data: {
        name: input.name,
        email,
        phone,
        role: input.role ?? 'USER',
        passwordHash: await bcrypt.hash(input.password, 10),
      },
    });
    return { success: true, id: user.id };
  }

  async adminUpdateUser(id: string, input: { name?: string; phone?: string; role?: string; password?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: input.name,
        phone: input.phone,
        role: input.role,
        ...(input.password ? { passwordHash: await bcrypt.hash(input.password, 10) } : {}),
      },
    });
    return {
      success: true,
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
    };
  }

  async adminRemoveUser(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }
}