import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../database/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;

  const mockPrisma = {
    role: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    rolePermission: {
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    permission: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    booking: {
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    payment: {
      aggregate: jest.fn(),
    },
    auditLog: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return booking counts, revenue, and conversion rate', async () => {
      mockPrisma.booking.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(30);
      mockPrisma.user.count
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(150);
      mockPrisma.payment.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 15000 } })
        .mockResolvedValue({ _sum: { amount: 1000 } });
      mockPrisma.booking.groupBy.mockResolvedValue([
        { status: 'confirmed', _count: { id: 30 } },
        { status: 'pending', _count: { id: 20 } },
      ]);
      mockPrisma.booking.findMany.mockResolvedValue([
        { id: 'b-1', bookingCode: 'FLY-001' },
      ]);

      const result = await service.getDashboardStats('tenant-1');

      expect(result.totalBookings).toBe(50);
      expect(result.totalUsers).toBe(200);
      expect(result.totalCustomers).toBe(150);
      expect(result.totalRevenue).toBe(15000);
      expect(result.conversionRate).toBe('25.0');
      expect(result.bookingsByStatus).toEqual({ confirmed: 30, pending: 20 });
      expect(result.recentBookings).toHaveLength(1);
      expect(result.monthlyRevenue).toHaveLength(12);
    });

    it('should return zero conversion rate when no users', async () => {
      mockPrisma.booking.count.mockResolvedValue(0);
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.payment.aggregate.mockResolvedValue({ _sum: { amount: null } });
      mockPrisma.booking.groupBy.mockResolvedValue([]);
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const result = await service.getDashboardStats('tenant-1');

      expect(result.conversionRate).toBe('0');
      expect(result.totalRevenue).toBe(0);
    });
  });

  describe('getRoles', () => {
    it('should return roles list', async () => {
      const roles = [
        { id: 'role-1', name: 'Admin', code: 'admin', tenantId: 'tenant-1' },
        { id: 'role-2', name: 'Staff', code: 'staff', tenantId: 'tenant-1' },
      ];
      mockPrisma.role.findMany.mockResolvedValue(roles);

      const result = await service.getRoles('tenant-1');

      expect(result).toHaveLength(2);
      expect(mockPrisma.role.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { tenantId: 'tenant-1' } }),
      );
    });
  });

  describe('createRole', () => {
    it('should create a new role', async () => {
      mockPrisma.role.findFirst.mockResolvedValue(null);
      mockPrisma.role.create.mockResolvedValue({
        id: 'role-1',
        name: 'Manager',
        code: 'manager',
        tenantId: 'tenant-1',
        isSystem: false,
        permissions: [],
      });

      const result = await service.createRole('tenant-1', {
        name: 'Manager',
        code: 'manager',
      });

      expect(result.id).toBe('role-1');
      expect(result.name).toBe('Manager');
      expect(mockPrisma.role.create).toHaveBeenCalled();
    });

    it('should throw ConflictException when role code already exists', async () => {
      mockPrisma.role.findFirst.mockResolvedValue({
        id: 'existing-role',
        name: 'Manager',
        code: 'manager',
      });

      await expect(
        service.createRole('tenant-1', { name: 'Manager', code: 'manager' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateRole', () => {
    it('should update role name', async () => {
      mockPrisma.role.findFirst.mockResolvedValue({
        id: 'role-1',
        name: 'Manager',
        code: 'manager',
        tenantId: 'tenant-1',
      });
      mockPrisma.role.update.mockResolvedValue({
        id: 'role-1',
        name: 'Senior Manager',
        code: 'manager',
      });

      const result = await service.updateRole('role-1', 'tenant-1', {
        name: 'Senior Manager',
      });

      expect(result.name).toBe('Senior Manager');
      expect(mockPrisma.role.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when role not found', async () => {
      mockPrisma.role.findFirst.mockResolvedValue(null);

      await expect(
        service.updateRole('fake-id', 'tenant-1', { name: 'New Name' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeRole', () => {
    it('should delete a non-system role', async () => {
      mockPrisma.role.findFirst.mockResolvedValue({
        id: 'role-1',
        name: 'Staff',
        code: 'staff',
        tenantId: 'tenant-1',
        isSystem: false,
      });
      mockPrisma.user.count.mockResolvedValue(0);
      mockPrisma.rolePermission.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.role.delete.mockResolvedValue({
        id: 'role-1',
        name: 'Staff',
        code: 'staff',
      });

      const result = await service.removeRole('role-1', 'tenant-1');

      expect(result.id).toBe('role-1');
      expect(mockPrisma.role.delete).toHaveBeenCalled();
    });

    it('should throw ConflictException when trying to delete system role', async () => {
      mockPrisma.role.findFirst.mockResolvedValue({
        id: 'role-sys',
        name: 'Super Admin',
        code: 'super_admin',
        tenantId: 'tenant-1',
        isSystem: true,
      });

      await expect(
        service.removeRole('role-sys', 'tenant-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when role has assigned users', async () => {
      mockPrisma.role.findFirst.mockResolvedValue({
        id: 'role-1',
        name: 'Staff',
        code: 'staff',
        tenantId: 'tenant-1',
        isSystem: false,
      });
      mockPrisma.user.count.mockResolvedValue(5);

      await expect(
        service.removeRole('role-1', 'tenant-1'),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when role not found', async () => {
      mockPrisma.role.findFirst.mockResolvedValue(null);

      await expect(
        service.removeRole('fake-id', 'tenant-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getPermissions', () => {
    it('should return permissions list', async () => {
      const permissions = [
        { id: 'perm-1', name: 'View Bookings', code: 'bookings.view', group: 'Bookings' },
        { id: 'perm-2', name: 'Manage Users', code: 'users.manage', group: 'Users' },
      ];
      mockPrisma.permission.findMany.mockResolvedValue(permissions);

      const result = await service.getPermissions();

      expect(result).toHaveLength(2);
      expect(mockPrisma.permission.findMany).toHaveBeenCalled();
    });
  });

  describe('createPermission', () => {
    it('should create a new permission', async () => {
      mockPrisma.permission.findFirst.mockResolvedValue(null);
      mockPrisma.permission.create.mockResolvedValue({
        id: 'perm-1',
        name: 'View Reports',
        code: 'reports.view',
        description: 'View analytics reports',
        group: 'Reports',
      });

      const result = await service.createPermission({
        name: 'View Reports',
        code: 'reports.view',
        description: 'View analytics reports',
        group: 'Reports',
      });

      expect(result.id).toBe('perm-1');
      expect(result.name).toBe('View Reports');
      expect(mockPrisma.permission.create).toHaveBeenCalled();
    });
  });

  describe('removePermission', () => {
    it('should delete a permission not in use', async () => {
      mockPrisma.permission.findUnique.mockResolvedValue({
        id: 'perm-1',
        name: 'View Reports',
        code: 'reports.view',
      });
      mockPrisma.rolePermission.count.mockResolvedValue(0);
      mockPrisma.permission.delete.mockResolvedValue({
        id: 'perm-1',
        name: 'View Reports',
        code: 'reports.view',
      });

      const result = await service.removePermission('perm-1');

      expect(result.id).toBe('perm-1');
      expect(mockPrisma.permission.delete).toHaveBeenCalled();
    });

    it('should throw ConflictException when permission is in use', async () => {
      mockPrisma.permission.findUnique.mockResolvedValue({
        id: 'perm-1',
        name: 'View Reports',
        code: 'reports.view',
      });
      mockPrisma.rolePermission.count.mockResolvedValue(3);

      await expect(service.removePermission('perm-1')).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException when permission not found', async () => {
      mockPrisma.permission.findUnique.mockResolvedValue(null);

      await expect(service.removePermission('fake-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAuditLogs', () => {
    it('should return paginated audit logs', async () => {
      const logs = [
        { id: 'log-1', action: 'CREATE', entity: 'booking', userId: 'user-1' },
        { id: 'log-2', action: 'UPDATE', entity: 'role', userId: 'user-2' },
      ];
      mockPrisma.auditLog.findMany.mockResolvedValue(logs);
      mockPrisma.auditLog.count.mockResolvedValue(25);

      const result = await service.getAuditLogs('tenant-1', 1, 10);

      expect(result.items).toHaveLength(2);
      expect(result.meta.total).toBe(25);
      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-1' },
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should apply action filter', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await service.getAuditLogs('tenant-1', 1, 50, { action: 'DELETE' });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            action: { contains: 'DELETE', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should apply date range filter', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.count.mockResolvedValue(0);

      await service.getAuditLogs('tenant-1', 1, 50, {
        startDate: '2026-01-01',
        endDate: '2026-06-30',
      });

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });
});
