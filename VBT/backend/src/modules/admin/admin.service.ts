import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Prisma, PrismaClient } from '@prisma/client';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../database/prisma.service';
import type { AdminTokenPayload } from './admin.guard';

type ModelName = Prisma.ModelName;

const CONTENT_MODELS: ModelName[] = [
  'Hero',
  'AboutSection',
  'Institution',
  'Activity',
  'Fund',
  'HomeVideo',
  'GalleryImage',
  'BlogPost',
  'Notice',
  'Faq',
  'Product',
];

const SUBMISSION_MODELS: ModelName[] = [
  'Subscriber',
  'ContactMessage',
  'Donation',
  'Application',
];

// These route segments are handled by dedicated controllers (Auth members
// landing-pages for admin/*, etc.) and must NOT fall through to the generic
// `admin/:model` delegate.
const RESERVED_ADMIN_ROUTES = new Set(['user', 'users', 'member', 'members', 'landing-page', 'landing-pages']);

// Prisma runtime delegates are accessed via `prisma.<modelLowercase>`.
type Delegate = {
  create(args: { data: unknown }): Promise<unknown>;
  update(args: { where: { id: string }; data: unknown }): Promise<unknown>;
  delete(args: { where: { id: string } }): Promise<unknown>;
  findMany(args?: unknown): Promise<unknown[]>;
  count(args?: unknown): Promise<number>;
};

function delegate(prisma: PrismaClient, model: ModelName): Delegate {
  const db = prisma as unknown as Record<string, Delegate | undefined>;
  const d = db[model.charAt(0).toLowerCase() + model.slice(1)];
  if (!d) throw new BadRequestException(`Unknown model: ${model}`);
  return d;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async signToken(admin: { id: string; email: string }) {
    const payload: AdminTokenPayload = { sub: admin.id, email: admin.email };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: this.configService.get('JWT_ACCESS_EXPIRY', '24h') as `${number}h`,
    });
  }

  async login(email: string, password: string) {
    const admin = await this.prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      throw new BadRequestException('Invalid credentials');
    }
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });
    const token = await this.signToken(admin);
    return {
      success: true,
      token,
      admin: { id: admin.id, email: admin.email, name: admin.name },
    };
  }

  async me(payload: AdminTokenPayload) {
    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.sub },
    });
    if (!admin) throw new NotFoundException('Admin not found');
    return { id: admin.id, email: admin.email, name: admin.name };
  }

  isContentModel(model: ModelName) {
    return CONTENT_MODELS.includes(model);
  }

  isSubmissionModel(model: ModelName) {
    return SUBMISSION_MODELS.includes(model);
  }

  async list(model: ModelName, page = 1, pageSize = 50) {
    if (!this.isContentModel(model) && !this.isSubmissionModel(model)) {
      throw new BadRequestException(`Model not manageable: ${model}`);
    }
    if (RESERVED_ADMIN_ROUTES.has(model.toLowerCase())) {
      throw new BadRequestException(`Model not manageable via generic admin: ${model}`);
    }
    const d = delegate(this.prisma, model);
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      d.findMany({
        take: pageSize,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      d.count(),
    ]);
    return { items: items as object[], total, page, pageSize };
  }

  async create(model: ModelName, data: unknown) {
    if (!this.isContentModel(model)) {
      throw new BadRequestException(`Model not manageable: ${model}`);
    }
    const row = await delegate(this.prisma, model).create({ data: data as object });
    return { success: true, data: row as object };
  }

  async update(model: ModelName, id: string, data: unknown) {
    if (!this.isContentModel(model)) {
      throw new BadRequestException(`Model not manageable: ${model}`);
    }
    if (!id || id.length < 4) throw new BadRequestException('Invalid id');
    const row = await delegate(this.prisma, model).update({
      where: { id },
      data: data as object,
    });
    return { success: true, data: row as object };
  }

  async remove(model: ModelName, id: string) {
    if (!this.isContentModel(model)) {
      throw new BadRequestException(`Model not manageable: ${model}`);
    }
    if (!id || id.length < 4) throw new BadRequestException('Invalid id');
    await delegate(this.prisma, model).delete({ where: { id } });
    return { success: true };
  }
}