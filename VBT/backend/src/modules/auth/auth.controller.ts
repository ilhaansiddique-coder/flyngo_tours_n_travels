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
import { AdminGuard } from '../admin/admin.guard';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SigninDto,
  SignupDto,
  UserUpsertDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import { UserGuard, UserTokenPayload } from './user.guard';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth/signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('auth/signin')
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }

  @Post('auth/forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post('auth/reset-password')
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('auth/me')
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  me(@Req() req: { user: UserTokenPayload }) {
    return this.authService.me(req.user);
  }

  @Get('admin/users')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  listUsers(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('pageSize', new ParseIntPipe({ optional: true })) pageSize = 50,
  ) {
    return this.authService.adminListUsers(page, pageSize);
  }

  @Post('admin/users')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  createUser(@Body() dto: UserUpsertDto) {
    return this.authService.adminCreateUser({
      name: dto.name,
      email: dto.email,
      role: dto.role,
      phone: dto.phone,
      password: dto.password ?? '',
    });
  }

  @Put('admin/users/:id')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  updateUser(@Param('id') id: string, @Body() dto: UserUpsertDto) {
    return this.authService.adminUpdateUser(id, dto);
  }

  @Delete('admin/users/:id')
  @ApiBearerAuth()
  @UseGuards(AdminGuard)
  removeUser(@Param('id') id: string) {
    return this.authService.adminRemoveUser(id);
  }
}