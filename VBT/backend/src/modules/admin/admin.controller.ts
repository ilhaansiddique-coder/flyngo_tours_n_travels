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
import { Prisma } from '@prisma/client';
import { AdminGuard, AdminTokenPayload } from './admin.guard';
import { AdminService } from './admin.service';
import { LoginDto } from './admin.dto';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('auth/login')
  login(@Body() dto: LoginDto) {
    return this.adminService.login(dto.email, dto.password);
  }

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  me(@Req() req: { admin: AdminTokenPayload }) {
    return this.adminService.me(req.admin);
  }

  @Get(':model')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  list(
    @Param('model') model: string,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 50,
  ) {
    return this.adminService.list(model as Prisma.ModelName, page, pageSize);
  }

  @Post(':model')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  create(@Param('model') model: string, @Body() data: unknown) {
    return this.adminService.create(model as Prisma.ModelName, data);
  }

  @Put(':model/:id')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  update(@Param('model') model: string, @Param('id') id: string, @Body() data: unknown) {
    return this.adminService.update(model as Prisma.ModelName, id, data);
  }

  @Delete(':model/:id')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  remove(@Param('model') model: string, @Param('id') id: string) {
    return this.adminService.remove(model as Prisma.ModelName, id);
  }
}