import {
  Controller,
  Get,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'List media uploads (public, for media library)' })
  async list(
    @CurrentTenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('q') q?: string,
  ) {
    return this.mediaService.list(tenantId, pagination.page, pagination.limit, q);
  }

  @Post('upload')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string' },
        alt: { type: 'string' },
      },
      required: ['file'],
    },
  })
  @ApiOperation({ summary: 'Upload a media file (R2 or local fallback)' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentTenantId() tenantId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder?: string,
    @Query('alt') alt?: string,
  ) {
    if (!file) throw new BadRequestException('No file provided in form-data field "file"');
    return this.mediaService.upload(file, { tenantId, folder, alt });
  }

  @Delete(':id')
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Delete a media item' })
  async remove(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    const removed = await this.mediaService.remove(id, tenantId);
    if (!removed) throw new BadRequestException('Media not found');
    return { success: true };
  }
}
