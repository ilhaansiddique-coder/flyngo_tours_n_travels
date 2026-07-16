import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ToursService } from './tours.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Tours')
@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all tours' })
  async findAll(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.toursService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get tour by ID' })
  async findById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.toursService.findById(id, tenantId);
  }
}
