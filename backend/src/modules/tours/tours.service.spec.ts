import { Test, TestingModule } from '@nestjs/testing';
import { ToursService } from './tours.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ToursService', () => {
  let service: ToursService;

  const mockPrisma = {
    tour: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToursService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ToursService>(ToursService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated tours', async () => {
      mockPrisma.tour.findMany.mockResolvedValue([
        { id: '1', title: 'Bali Explorer', price: 1299 },
        { id: '2', title: 'Dubai Luxury', price: 2499 },
      ]);
      mockPrisma.tour.count.mockResolvedValue(2);

      const result = await service.findAll('tenant-1', 1, 20);

      expect(result.items).toHaveLength(2);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });

    it('should filter by tenantId', async () => {
      mockPrisma.tour.findMany.mockResolvedValue([]);
      mockPrisma.tour.count.mockResolvedValue(0);

      await service.findAll('tenant-1');

      expect(mockPrisma.tour.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 'tenant-1',
            deletedAt: null,
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return tour with relations', async () => {
      mockPrisma.tour.findFirst.mockResolvedValue({
        id: 'tour-1',
        title: 'Bali Explorer',
        destination: { id: 'dest-1', name: 'Bali' },
        images: [],
        itinerary: [{ day: 1, title: 'Arrival' }],
      });

      const result = await service.findById('tour-1', 'tenant-1');

      expect(result.title).toBe('Bali Explorer');
      expect(result.destination.name).toBe('Bali');
      expect(result.itinerary).toHaveLength(1);
      expect(mockPrisma.tour.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'tour-1', tenantId: 'tenant-1' },
          include: expect.objectContaining({
            destination: true,
            images: true,
            itinerary: expect.any(Object),
          }),
        }),
      );
    });

    it('should throw NotFoundException for non-existent tour', async () => {
      mockPrisma.tour.findFirst.mockResolvedValue(null);

      await expect(service.findById('fake-id', 'tenant-1')).rejects.toThrow(NotFoundException);
    });
  });
});
