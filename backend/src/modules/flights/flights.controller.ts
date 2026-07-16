import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FlightsService } from './flights.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Search flights' })
  async search(
    @CurrentTenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('origin') origin?: string,
    @Query('destination') destination?: string,
    @Query('date') date?: string,
  ) {
    return this.flightsService.search(tenantId, { origin, destination, date }, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get flight by ID' })
  async findById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.flightsService.findById(id, tenantId);
  }
}
