import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Equals, IsEmail, IsString, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentTenantId } from '../../common/decorators/current-tenant.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { NewsletterService } from './newsletter.service';

class SubscribeDto {
  @IsEmail() @MaxLength(254) email: string;
  @Transform(({ obj }) => obj.consent === true)
  @Equals(true, { message: 'Consent to newsletter emails is required' }) consent: boolean;
}
class TokenDto {
  @IsString() @Matches(/^[a-f0-9]{64}$/) token: string;
}

@Controller('newsletter')
export class NewsletterController {
  constructor(private readonly newsletter: NewsletterService) {}
  @Post('subscribe') @Public() @Throttle({ default: { limit: 3, ttl: 60_000 } })
  subscribe(@CurrentTenantId() tenantId: string, @Body() body: SubscribeDto) { return this.newsletter.subscribe(tenantId, body.email); }
  @Post('confirm') @Public() @Throttle({ default: { limit: 20, ttl: 60_000 } })
  confirm(@CurrentTenantId() tenantId: string, @Body() body: TokenDto) { return this.newsletter.confirm(tenantId, body.token); }
  @Post('unsubscribe') @Public() @Throttle({ default: { limit: 20, ttl: 60_000 } })
  unsubscribe(@CurrentTenantId() tenantId: string, @Body() body: TokenDto) { return this.newsletter.unsubscribe(tenantId, body.token); }
  @Get('admin/subscriptions') @Roles('admin', 'super_admin')
  list(@CurrentTenantId() tenantId: string, @Query() page: PaginationDto) { return this.newsletter.listConfirmed(tenantId, page.page, page.limit); }
}
