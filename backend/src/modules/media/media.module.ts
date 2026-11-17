import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaAdminController } from './media-admin.controller';
import { MediaDeletionService } from './media-deletion.service';

@Module({
  controllers: [MediaController, MediaAdminController],
  providers: [MediaService, MediaDeletionService],
  exports: [MediaService, MediaDeletionService],
})
export class MediaModule {}
