import { Test, TestingModule } from '@nestjs/testing';
import { HajjPackagesService } from './hajj-packages.service';
import { PrismaService } from '../../database/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('HajjPackagesService', () => {
  let service: HajjPackagesService;

  const mockPkg = {
    id: 'pkg-1',
    tenantId: 'tenant-1',
    title: 'Test Hajj Package',
    slug: 'test-hajj-package',
    tier: 'non_shifting',
    durationDays: 40,
    price: 600000,
    currency: 'BDT',
    makkahNights: 20,
    madinahNights: 7,
    inclusions: [],
    highlights: [],
    isActive: true,
    isFeatured: false,
    order: 1,
    deletedAt: null,
  };

  const mockPrisma = {
    hajjPackage: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HajjPackagesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<HajjPackagesService>(HajjPackagesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('findAll returns paginated items', async () => {
    mockPrisma.hajjPackage.findMany.mockResolvedValue([mockPkg]);
    mockPrisma.hajjPackage.count.mockResolvedValue(1);
    const result = await service.findAll('tenant-1', 1, 20);
    expect(result.items).toHaveLength(1);
    expect(result.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
  });

  it('findAll applies q filter when provided', async () => {
    mockPrisma.hajjPackage.findMany.mockResolvedValue([]);
    mockPrisma.hajjPackage.count.mockResolvedValue(0);
    await service.findAll('tenant-1', 1, 20, 'non-shifting');
    expect(mockPrisma.hajjPackage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ title: expect.any(Object) }),
            expect.objectContaining({ tier: expect.any(Object) }),
          ]),
        }),
      }),
    );
  });

  it('findActive returns only active packages', async () => {
    mockPrisma.hajjPackage.findMany.mockResolvedValue([mockPkg]);
    const result = await service.findActive('tenant-1');
    expect(mockPrisma.hajjPackage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) }),
    );
    expect(result).toEqual([mockPkg]);
  });

  it('findById throws when package not found', async () => {
    mockPrisma.hajjPackage.findFirst.mockResolvedValue(null);
    await expect(service.findById('missing', 'tenant-1')).rejects.toThrow(NotFoundException);
  });

  it('create rejects duplicate slugs', async () => {
    mockPrisma.hajjPackage.findFirst.mockResolvedValue(mockPkg);
    await expect(
      service.create('tenant-1', { title: 'Test Hajj Package', tier: 'non_shifting', durationDays: 40, price: 600000 }),
    ).rejects.toThrow(ConflictException);
  });

  it('create succeeds for new slug', async () => {
    mockPrisma.hajjPackage.findFirst.mockResolvedValue(null);
    mockPrisma.hajjPackage.create.mockResolvedValue(mockPkg);
    const result = await service.create('tenant-1', {
      title: 'Brand New Package',
      tier: 'cheap',
      durationDays: 30,
      price: 500000,
    });
    expect(result).toEqual(mockPkg);
  });

  it('remove soft-deletes by setting deletedAt', async () => {
    mockPrisma.hajjPackage.findFirst.mockResolvedValue(mockPkg);
    mockPrisma.hajjPackage.update.mockResolvedValue({ ...mockPkg, deletedAt: new Date() });
    await service.remove('pkg-1', 'tenant-1');
    expect(mockPrisma.hajjPackage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      }),
    );
  });
});