import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(tenantId: string, data: any) {
    const existing = await this.prisma.user.findFirst({ where: { tenantId, email: data.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    const passwordHash = data.password
      ? await bcrypt.hash(data.password, 12)
      : null;

    const user = await this.prisma.user.create({
      data: {
        tenantId,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        passwordHash,
        roleId: data.roleId,
        isActive: data.isActive ?? true,
      },
      include: { role: true },
    });
    const { passwordHash: _ph, ...rest } = user;
    return rest;
  }

  async findById(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      include: { role: { include: { permissions: { include: { permission: true } } } } },
    });
    if (!user || user.deletedAt) throw new NotFoundException('User not found');
    const { passwordHash, ...rest } = user;
    return rest;
  }

  async findByEmail(email: string, tenantId: string) {
    return this.prisma.user.findFirst({ where: { email, tenantId } });
  }

  async updateProfile(id: string, tenantId: string, data: { fullName?: string; phone?: string; avatarUrl?: string }) {
    const user = await this.prisma.user.updateMany({ where: { id, tenantId }, data });
    if (user.count === 0) throw new NotFoundException('User not found');
    return this.findById(id, tenantId);
  }

  async listUsers(tenantId: string, page = 1, limit = 20) {
    const where = { tenantId, deletedAt: null };
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { role: true, _count: { select: { bookings: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      items: items.map(({ passwordHash, ...rest }) => rest),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateUser(id: string, tenantId: string, data: any) {
    const existing = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('User not found');

    return this.prisma.user.update({
      where: { id },
      data: {
        fullName: data.fullName,
        phone: data.phone,
        roleId: data.roleId,
        isActive: data.isActive,
      },
      include: { role: true },
    });
  }

  async removeUser(id: string, tenantId: string) {
    const existing = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
