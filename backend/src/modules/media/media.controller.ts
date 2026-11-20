import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Headers, Res, UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { StaffPermissions } from '../../common/decorators/staff-permissions.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { Response } from 'express';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('private/:id')
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  async downloadPrivate(@Param('id') id: string, @CurrentTenantId() tenantId: string,
    @CurrentUser() actor: { id: string; roleCode: string; tenantId: string } | undefined,
    @Headers('x-upload-token') uploadToken: string | undefined, @Res() response: Response) {
    const file = await this.mediaService.readPrivate(id, tenantId, actor, uploadToken);
    response.set({ 'Cache-Control': 'private, no-store, max-age=0', 'Pragma': 'no-cache',
      'Content-Type': file.mimeType, 'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(file.filename).replace(/'/g, '%27')}`,
    });
    response.send(file.buffer);
  }

  @Post('documents')
  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024, files: 1 } }))
  async uploadVisaDocument(@CurrentTenantId() tenantId: string, @CurrentUser('id') ownerId: string | undefined,
    @UploadedFile() file: Express.Multer.File, @Query('folder') folder?: string) {
    if (folder !== 'visa-documents') throw new BadRequestException('Invalid document folder');
    return this.mediaService.uploadPrivate(file, { tenantId, folder, ownerId, guestUpload: true });
  }

  @StaffPermissions('cms.read')
  @Get()
  @ApiBearerAuth()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List media uploads (admin, for media library)' })
  async list(
    @CurrentTenantId() tenantId: string,
    @Query() pagination: PaginationDto,
    @Query('q') q?: string,
  ) {
    return this.mediaService.list(tenantId, pagination.page, pagination.limit, q);
  }

  @StaffPermissions('cms.create')
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

  @StaffPermissions('cms.delete')
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
