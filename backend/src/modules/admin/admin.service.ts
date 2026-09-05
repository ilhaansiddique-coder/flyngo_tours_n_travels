import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Registry of content entities that are soft-deleted (deletedAt) and can be
   * restored from the admin Trash. Keyed by the slug used in the trash API.
   */
  private readonly TRASH_ENTITIES: Array<{
    key: string;
    label: string;
    model: string;
    title: string;
    subtitle?: string;
    isActive?: boolean;
  }> = [
    { key: 'destination', label: 'Destination', model: 'destination', title: 'name', subtitle: 'country', isActive: true },
    { key: 'tour', label: 'Tour', model: 'tour', title: 'title', isActive: true },
    { key: 'hotel', label: 'Hotel', model: 'hotel', title: 'name', isActive: true },
    { key: 'flight', label: 'Flight', model: 'flight', title: 'airline', subtitle: 'destinationCode', isActive: true },
    { key: 'visa', label: 'Visa Service', model: 'visaService', title: 'title', isActive: true },
    { key: 'transport', label: 'Transport', model: 'transport', title: 'title', isActive: true },
    { key: 'hajj', label: 'Hajj Package', model: 'hajjPackage', title: 'title', isActive: true },
    { key: 'umrah', label: 'Umrah Package', model: 'umrahPackage', title: 'title', isActive: true },
    { key: 'visa-country', label: 'Visa Country', model: 'visaCountry', title: 'name', isActive: true },
    { key: 'blog', label: 'Blog Post', model: 'blogPost', title: 'title' },
    { key: 'cms-page', label: 'CMS Page', model: 'cmsPage', title: 'title' },
    { key: 'testimonial', label: 'Testimonial', model: 'testimonial', title: 'content' },
    { key: 'faq', label: 'FAQ', model: 'faq', title: 'question' },
    { key: 'coupon', label: 'Coupon', model: 'coupon', title: 'code', isActive: true },
    { key: 'bank-account', label: 'Bank Account', model: 'bankAccount', title: 'bankName', subtitle: 'accountName', isActive: true },
    { key: 'mobile-wallet', label: 'Mobile Wallet', model: 'mobileWallet', title: 'accountName', isActive: true },
    { key: 'user', label: 'User', model: 'user', title: 'fullName', subtitle: 'email', isActive: true },
    { key: 'review', label: 'Review', model: 'review', title: 'title' },
  ];

  private findTrashEntity(key: string) {
    const def = this.TRASH_ENTITIES.find((e) => e.key === key);
    if (!def) throw new NotFoundException(`Unknown trash entity: ${key}`);
    return def;
  }

  /**
   * List soft-deleted items across the registered entities. Can be filtered to
   * a single entity. Returns a merged, newest-first feed with per-entity counts.
   */
  async getTrash(tenantId: string, page = 1, limit = 20, entity?: string, q?: string) {
    const targets = entity ? [this.findTrashEntity(entity)] : this.TRASH_ENTITIES;
    const perEntity: Record<string, number> = {};
    const rows: Array<{
      entity: string;
      entityLabel: string;
      id: string;
      title: string;
      subtitle: string;
      deletedAt: Date;
    }> = [];

    for (const def of targets) {
      const where: any = { tenantId, deletedAt: { not: null } };
      if (q && q.trim()) {
        where.OR = [{ [def.title]: { contains: q.trim(), mode: 'insensitive' } }];
        if (def.subtitle) where.OR.push({ [def.subtitle]: { contains: q.trim(), mode: 'insensitive' } });
      }
      const select: any = { id: true, deletedAt: true, [def.title]: true };
      if (def.subtitle) select[def.subtitle] = true;

      const model = (this.prisma as any)[def.model];
      const [count, items] = await Promise.all([
        model.count({ where }),
        model.findMany({ where, orderBy: { deletedAt: 'desc' }, take: 300, select }),
      ]);
      perEntity[def.key] = count;
      for (const item of items || []) {
        rows.push({
          entity: def.key,
          entityLabel: def.label,
          id: item.id,
          title: String(item[def.title] ?? '').trim() || `(${def.label} #${item.id.slice(0, 8)})`,
          subtitle: def.subtitle ? String(item[def.subtitle] ?? '').trim() : '',
          deletedAt: item.deletedAt,
        });
      }
    }

    rows.sort((a, b) => (b.deletedAt?.getTime() ?? 0) - (a.deletedAt?.getTime() ?? 0));
    const total = rows.length;
    const start = (page - 1) * limit;
    return {
      items: rows.slice(start, start + limit),
      meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      perEntity,
    };
  }

  /** Restore a soft-deleted item back into the active list. */
  async restoreTrashItem(tenantId: string, entity: string, id: string) {
    const def = this.findTrashEntity(entity);
    const model = (this.prisma as any)[def.model];
    const row = await model.findFirst({ where: { id, tenantId, deletedAt: { not: null } } });
    if (!row) throw new NotFoundException(`${def.label} not found in trash`);
    try {
      await model.update({
        where: { id },
        data: { deletedAt: null, ...(def.isActive ? { isActive: true } : {}) },
      });
    } catch (err: any) {
      if (err?.code === 'P2002') {
        throw new ConflictException(`${def.label} conflicts with an existing active record (unique field) — try editing that one first`);
      }
      throw err;
    }
    return { restored: true, entity, id };
  }

  /** Permanently remove a trashed item. Irreversible. */
  async purgeTrashItem(tenantId: string, entity: string, id: string) {
    const def = this.findTrashEntity(entity);
    const model = (this.prisma as any)[def.model];
    const row = await model.findFirst({ where: { id, tenantId, deletedAt: { not: null } } });
    if (!row) throw new NotFoundException(`${def.label} not found in trash`);
    await model.delete({ where: { id } });
    return { purged: true, entity, id };
  }

  async createRole(tenantId: string, data: { name: string; code: string; isSystem?: boolean; permissionIds?: string[] }) {
    const existing = await this.prisma.role.findFirst({ where: { tenantId, code: data.code } });
    if (existing) throw new ConflictException('A role with this code already exists');
    return this.prisma.role.create({
      data: {
        tenantId,
        name: data.name,
        code: data.code,
        isSystem: data.isSystem ?? false,
        permissions: data.permissionIds?.length
          ? { create: data.permissionIds.map((pid) => ({ permissionId: pid })) }
          : undefined,
      },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async updateRole(id: string, tenantId: string, data: { name?: string; permissionIds?: string[]; isSystem?: boolean }) {
    const existing = await this.prisma.role.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Role not found');
    if (data.permissionIds) {
      await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    }
    return this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        isSystem: data.isSystem,
        permissions: data.permissionIds?.length
          ? { create: data.permissionIds.map((pid) => ({ permissionId: pid })) }
          : undefined,
      },
      include: { permissions: { include: { permission: true } } },
    });
  }

  async removeRole(id: string, tenantId: string) {
    const existing = await this.prisma.role.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Role not found');
    if (existing.isSystem) throw new ConflictException('Cannot delete a system role');
    const userCount = await this.prisma.user.count({ where: { roleId: id, deletedAt: null } });
    if (userCount > 0) throw new ConflictException('Cannot delete a role with assigned users');
    await this.prisma.rolePermission.deleteMany({ where: { roleId: id } });
    return this.prisma.role.delete({ where: { id } });
  }

  async createPermission(data: { name: string; code: string; description?: string; group?: string }) {
    const existing = await this.prisma.permission.findFirst({ where: { code: data.code } });
    if (existing) throw new ConflictException('A permission with this code already exists');
    return this.prisma.permission.create({ data });
  }

  async updatePermission(id: string, data: { name?: string; description?: string; group?: string }) {
    const existing = await this.prisma.permission.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Permission not found');
    return this.prisma.permission.update({ where: { id }, data });
  }

  async removePermission(id: string) {
    const existing = await this.prisma.permission.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Permission not found');
    const usage = await this.prisma.rolePermission.count({ where: { permissionId: id } });
    if (usage > 0) throw new ConflictException('Permission is assigned to one or more roles');
    return this.prisma.permission.delete({ where: { id } });
  }

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

  async getAuditLogs(tenantId: string, page = 1, limit = 50, filters?: { action?: string; entity?: string; userId?: string; startDate?: string; endDate?: string }) {
    const where: any = { tenantId };
    if (filters?.action) where.action = { contains: filters.action, mode: 'insensitive' };
    if (filters?.entity) where.entity = { contains: filters.entity, mode: 'insensitive' };
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = new Date(filters.startDate);
      if (filters.endDate) where.createdAt.lte = new Date(filters.endDate);
    }
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, fullName: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
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
