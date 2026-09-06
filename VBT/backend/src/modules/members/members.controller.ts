import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MemberStatus } from '@prisma/client';
import { AdminGuard } from '../admin/admin.guard';
import { UserGuard, UserTokenPayload } from '../auth/user.guard';
import { MemberCreateDto, MemberStatusDto, MemberUpdateDto, RegistrationCreateDto, RegistrationStatusDto } from './members.dto';
import { MembersService } from './members.service';

@ApiTags('members')
@Controller()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get('public/member-categories')
  categories() {
    return this.membersService.getPublicCategories();
  }

  @Post('public/members')
  create(@Body() dto: MemberCreateDto, @Req() req?: { user?: UserTokenPayload }) {
    return this.membersService.createMember(dto, req?.user?.sub);
  }

  @Post('public/registrations')
  register(@Body() dto: RegistrationCreateDto) {
    return this.membersService.createRegistration(dto);
  }

  @Get('public/members/status/:ref')
  status(@Param('ref') ref: string) {
    return this.membersService.getStatusByRef(ref);
  }

  @Get('public/members/my')
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  my(@Req() req: { user: UserTokenPayload }) {
    return this.membersService.getMyMemberships(req.user.sub);
  }

  @Get('admin/members/stats')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  stats() {
    return this.membersService.adminStats();
  }

  @Get('admin/members')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  list(
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 50,
  ) {
    return this.membersService.adminList({ status, category, search, page, pageSize });
  }

  @Get('admin/members/:id')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  detail(@Param('id') id: string) {
    return this.membersService.adminGet(id);
  }

  @Put('admin/members/:id/status')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  setStatus(
    @Param('id') id: string,
    @Body() dto: MemberStatusDto,
    @Req() req: { admin: { sub: string } },
  ) {
    return this.membersService.adminSetStatus(
      id,
      dto.status as MemberStatus,
      dto.note,
      req.admin.sub,
    );
  }

  @Put('admin/members/:id')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: MemberUpdateDto) {
    return this.membersService.adminUpdate(id, dto);
  }

  @Delete('admin/members/:id')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.membersService.adminRemove(id);
  }

  @Get('admin/registrations/stats')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  registrationStats() {
    return this.membersService.adminRegistrationStats();
  }

  @Get('admin/registrations')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  listRegistrations(
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 50,
  ) {
    return this.membersService.adminListRegistrations({ tag, search, page, pageSize });
  }

  @Put('admin/registrations/:id/status')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  setRegistrationStatus(@Param('id') id: string, @Body() dto: RegistrationStatusDto) {
    return this.membersService.adminSetRegistrationStatus(id, dto.status, dto.note);
  }

  @Delete('admin/registrations/:id')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  removeRegistration(@Param('id') id: string) {
    return this.membersService.adminRemoveRegistration(id);
  }
}