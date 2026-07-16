import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async findByEmail(email: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: { email, tenantId },
    });
  }

  async updateProfile(id: string, tenantId: string, data: { fullName?: string; phone?: string; avatarUrl?: string }) {
    const user = await this.prisma.user.updateMany({
      where: { id, tenantId },
      data,
    });

    if (user.count === 0) {
      throw new NotFoundException('User not found');
    }

    return this.findById(id, tenantId);
  }

  async list(tenantId: string, page: number, limit: number) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { tenantId, deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        include: { role: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: { tenantId, deletedAt: null } }),
    ]);

    return {
      items: users.map(({ passwordHash, ...rest }) => rest),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
