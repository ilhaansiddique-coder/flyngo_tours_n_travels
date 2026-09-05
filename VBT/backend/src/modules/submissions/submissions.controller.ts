import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  SubscribeDto,
  ContactDto,
  DonationDto,
  ApplicationDto,
} from './submissions.dto';
import { SubmissionsService } from './submissions.service';

@ApiTags('submissions')
@Controller('public')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('subscribers')
  createSubscriber(@Body() dto: SubscribeDto) {
    return this.submissionsService.createSubscriber(dto);
  }

  @Post('contact')
  createContact(@Body() dto: ContactDto) {
    return this.submissionsService.createContact(dto);
  }

  @Post('donations')
  createDonation(@Body() dto: DonationDto) {
    return this.submissionsService.createDonation(dto);
  }

  @Post('applications')
  createApplication(@Body() dto: ApplicationDto) {
    return this.submissionsService.createApplication(dto);
  }
}