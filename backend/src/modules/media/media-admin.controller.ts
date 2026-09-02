// Placeholder for now. The Media module is exposed via /media routes —
// this admin controller is here as a hook for future admin-only bulk ops.
import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Media Admin')
@Controller('media/admin')
export class MediaAdminController {}
