import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { MediaAdminController } from './media-admin.controller';
import { MediaDeletionService } from './media-deletion.service';
import { PrivateMediaMigrationService } from './private-media-migration.service';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({})],
  controllers: [MediaController, MediaAdminController],
  providers: [MediaService, MediaDeletionService, PrivateMediaMigrationService, OptionalJwtAuthGuard],
  exports: [MediaService, MediaDeletionService],
})
export class MediaModule {}
