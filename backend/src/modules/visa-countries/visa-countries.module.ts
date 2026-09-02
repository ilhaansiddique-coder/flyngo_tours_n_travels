import { Module } from '@nestjs/common';
import { VisaCountriesController } from './visa-countries.controller';
import { VisaCountriesService } from './visa-countries.service';

@Module({
  controllers: [VisaCountriesController],
  providers: [VisaCountriesService],
  exports: [VisaCountriesService],
})
export class VisaCountriesModule {}
