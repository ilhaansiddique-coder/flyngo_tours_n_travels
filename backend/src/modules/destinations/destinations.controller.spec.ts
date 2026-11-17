import { ValidationPipe } from '@nestjs/common';
import { DestinationsController } from './destinations.controller';
import { DestinationsService } from './destinations.service';
import { DestinationQueryDto } from './dto/destination-query.dto';

describe('public destination filters', () => {
  const pipe = new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
    transformOptions: { enableImplicitConversion: true },
  });
  const parse = (query: object): Promise<DestinationQueryDto> => pipe.transform(query, {
    type: 'query', metatype: DestinationQueryDto,
  });

  it('accepts featured and toursOnly under production validation and forwards them', async () => {
    const findAll = jest.fn().mockResolvedValue([]);
    const controller = new DestinationsController({ findAll } as unknown as DestinationsService);
    await controller.findAll('tenant-1', await parse({ featured: 'true', toursOnly: 'true', page: '2', limit: '6' }));
    expect(findAll).toHaveBeenCalledWith('tenant-1', 2, 6, undefined, true, true);
  });

  it('preserves false and pagination defaults', async () => {
    expect(await parse({ featured: 'false' })).toMatchObject({ featured: 'false', page: 1, limit: 20 });
  });

  it('rejects invalid filters and unknown query parameters', async () => {
    await expect(parse({ featured: 'yes' })).rejects.toThrow();
    await expect(parse({ unexpected: 'true' })).rejects.toThrow();
  });
});
