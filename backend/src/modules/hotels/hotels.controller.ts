import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Hotels')
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List all hotels' })
  async findAll(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.hotelsService.findAll(tenantId, pagination.page, pagination.limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get hotel by ID' })
  async findById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.hotelsService.findById(id, tenantId);
  }
}
