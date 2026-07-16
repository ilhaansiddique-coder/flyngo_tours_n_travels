import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(tenantId: string) {
    const [
      totalBookings,
      totalUsers,
      totalRevenue,
      recentBookings,
    ] = await Promise.all([
      this.prisma.booking.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.user.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.payment.aggregate({
        where: { tenantId, status: 'completed' },
        _sum: { amount: true },
      }),
      this.prisma.booking.findMany({
        where: { tenantId, deletedAt: null },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, email: true } } },
      }),
    ]);

    return {
      totalBookings,
      totalUsers,
      totalRevenue: totalRevenue._sum.amount || 0,
      recentBookings,
    };
  }

  async getAuditLogs(tenantId: string, page = 1, limit = 50) {
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, fullName: true, email: true } },
        },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);

    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}
