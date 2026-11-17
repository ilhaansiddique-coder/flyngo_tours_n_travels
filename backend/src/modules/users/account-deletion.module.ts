import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { AccountDeletionService } from './account-deletion.service';

@Module({ imports: [MediaModule], providers: [AccountDeletionService], exports: [AccountDeletionService] })
export class AccountDeletionModule {}
