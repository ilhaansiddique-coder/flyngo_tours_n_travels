import { Module } from '@nestjs/common';
import { CuratedExperiencesController } from './curated-experiences.controller';
import { CuratedExperiencesService } from './curated-experiences.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CuratedExperiencesController],
  providers: [CuratedExperiencesService],
  exports: [CuratedExperiencesService],
})
export class CuratedExperiencesModule {}
