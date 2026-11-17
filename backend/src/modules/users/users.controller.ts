import {
  Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id, user.tenantId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() body: { fullName?: string; phone?: string; email?: string; address?: string; avatarUrl?: string },
  ) {
    return this.usersService.updateProfile(user.id, user.tenantId, body);
  }

  @Post('me/avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] } })
  @ApiOperation({ summary: 'Upload / change my profile picture' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024, files: 1 } }))
  async uploadAvatar(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided in form-data field "file"');
    return this.usersService.setMyAvatar(user.id, user.tenantId, file);
  }

  @Get('me/documents')
  @ApiOperation({ summary: 'List my uploaded documents/images' })
  async myDocuments(@CurrentUser() user: any) {
    return this.usersService.listMyDocuments(user.id, user.tenantId);
  }

  @Post('me/documents')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] } })
  @ApiOperation({ summary: 'Upload a document/image to my profile' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024, files: 1 } }))
  async uploadDocument(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided in form-data field "file"');
    return this.usersService.addMyDocument(user.id, user.tenantId, file);
  }

  @Delete('me/documents/:id')
  @ApiOperation({ summary: 'Delete one of my documents' })
  async deleteMyDocument(@CurrentUser() user: any, @Param('id') id: string) {
    return this.usersService.deleteMyDocument(id, user.id, user.tenantId);
  }

  /**
   * GDPR Article 15 / 20 — Right of access + data portability.
   * Returns a JSON dump of every personal data record we hold on the
   * authenticated user.
   */
  @Get('me/export')
  @ApiOperation({ summary: 'GDPR: export all my personal data as JSON' })
  async exportMyData(@CurrentUser() user: any) {
    const data = await this.usersService.exportMyData(user.id, user.tenantId);
    return {
      success: true,
      data,
    };
  }

  /**
   * GDPR Article 17 — Right to erasure ("right to be forgotten").
   * Permanently deletes the account and its linked application records.
   *
   * Pass `confirmation: "DELETE MY ACCOUNT"` in the body to confirm.
   */
  @Delete('me')
  @HttpCode(200)
  @ApiOperation({ summary: 'Permanently delete my account and linked records' })
  async deleteMyAccount(
    @CurrentUser() user: any,
    @Body() body: { confirmation?: string } = {},
  ) {
    const result = await this.usersService.permanentlyDeleteOwnAccount(
      user.id,
      user.tenantId,
      body?.confirmation || '',
    );
    return {
      success: true,
      message: result.pendingFileDeletions
        ? 'Your account and linked database records have been permanently deleted. Uploaded files are queued for removal.'
        : 'Your account and linked records have been permanently deleted.',
      data: result,
    };
  }

  @Get()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'List all users (admin)' })
  async listUsers(@CurrentTenantId() tenantId: string, @Query() pagination: PaginationDto) {
    return this.usersService.listUsers(tenantId, pagination.page, pagination.limit, pagination.q);
  }

  @Post()
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Create a user (admin)' })
  async createUser(@CurrentTenantId() tenantId: string, @Body() body: any, @CurrentUser() actor: { id: string }) {
    return this.usersService.createUser(tenantId, body, actor.id);
  }

  @Get(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Get user by ID (admin)' })
  async getUserById(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.usersService.findById(id, tenantId);
  }

  @Patch(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Update a user (admin)' })
  async updateUser(@Param('id') id: string, @CurrentTenantId() tenantId: string, @Body() body: any) {
    return this.usersService.updateUser(id, tenantId, body);
  }

  @Post(':id/nid-front')
  @Roles('admin', 'super_admin')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] } })
  @ApiOperation({ summary: 'Upload the customer NID (front side)' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024, files: 1 } }))
  async uploadNationalIdFront(@Param('id') id: string, @CurrentTenantId() tenantId: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided in form-data field "file"');
    return this.usersService.uploadNationalIdFront(id, tenantId, file);
  }

  @Post(':id/nid-back')
  @Roles('admin', 'super_admin')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] } })
  @ApiOperation({ summary: 'Upload the customer NID (back side)' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024, files: 1 } }))
  async uploadNationalIdBack(@Param('id') id: string, @CurrentTenantId() tenantId: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided in form-data field "file"');
    return this.usersService.uploadNationalIdBack(id, tenantId, file);
  }

  @Post(':id/passport')
  @Roles('admin', 'super_admin')
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } }, required: ['file'] } })
  @ApiOperation({ summary: 'Upload the customer passport copy' })
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024, files: 1 } }))
  async uploadPassport(@Param('id') id: string, @CurrentTenantId() tenantId: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided in form-data field "file"');
    return this.usersService.uploadPassport(id, tenantId, file);
  }

  @Delete(':id')
  @Roles('admin', 'super_admin')
  @ApiOperation({ summary: 'Permanently delete a user and linked records (admin)' })
  async removeUser(@Param('id') id: string, @CurrentTenantId() tenantId: string) {
    return this.usersService.removeUser(id, tenantId);
  }
}
