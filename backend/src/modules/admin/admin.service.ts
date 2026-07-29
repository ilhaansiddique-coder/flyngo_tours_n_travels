import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(tenantId: string) {
    const [totalBookings, totalUsers, revenueResult, bookingsByStatus, monthlyRevenue, recentBookings] = await Promise.all([
      this.prisma.booking.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.user.count({ where: { tenantId, deletedAt: null } }),
      this.prisma.payment.aggregate({ where: { tenantId, status: 'completed' }, _sum: { amount: true } }),
      this.prisma.booking.groupBy({ by: ['status'], where: { tenantId, deletedAt: null }, _count: { id: true } }),
      this.getMonthlyRevenue(tenantId),
      this.prisma.booking.findMany({
        where: { tenantId, deletedAt: null },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, email: true } } },
      }),
    ]);

    const customerCount = await this.prisma.user.count({
      where: { tenantId, deletedAt: null, role: { code: 'customer' } },
    });

    return {
      totalBookings,
      totalUsers,
      totalCustomers: customerCount,
      totalRevenue: revenueResult._sum.amount || 0,
      conversionRate: totalUsers > 0 ? ((totalBookings / totalUsers) * 100).toFixed(1) : '0',
      bookingsByStatus: bookingsByStatus.reduce(
        (acc: Record<string, number>, b) => ({ ...acc, [b.status]: b._count.id }),
        {},
      ),
      monthlyRevenue,
      recentBookings,
    };
  }

  private async getMonthlyRevenue(tenantId: string) {
    const months: { month: number; year: number; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const result = await this.prisma.payment.aggregate({
        where: { tenantId, status: 'completed', createdAt: { gte: start, lt: end } },
        _sum: { amount: true },
      });

      months.push({
        month: start.getMonth() + 1,
        year: start.getFullYear(),
        revenue: Number(result._sum.amount || 0),
      });
    }
    return months;
  }

  async getAuditLogs(tenantId: string, page = 1, limit = 50) {
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where: { tenantId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, fullName: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where: { tenantId } }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getRoles(tenantId: string) {
    return this.prisma.role.findMany({
      where: { tenantId },
      include: {
        _count: { select: { users: true, permissions: true } },
        permissions: { include: { permission: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getPermissions() {
    return this.prisma.permission.findMany({ orderBy: { group: 'asc' } });
  }
}
