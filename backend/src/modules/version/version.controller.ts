import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Version')
@Controller('version')
export class VersionController {
  @Get()
  @Public()
  @ApiOperation({ summary: 'Deployed version + latest commit info' })
  async getVersion() {
    const sha = process.env.GIT_SHA || process.env.COMMIT_SHA || 'dev';
    const shortSha = sha.length > 7 ? sha.slice(0, 7) : sha;
    return {
      sha,
      shortSha,
      message: process.env.GIT_COMMIT_MESSAGE || 'local development',
      author: process.env.GIT_COMMIT_AUTHOR || 'unknown',
      committedAt: process.env.GIT_COMMIT_DATE || new Date().toISOString(),
      repo: process.env.GIT_REPO || 'ilhaansiddique-coder/flyngo_tours_n_travels',
      branch: process.env.GIT_BRANCH || 'main',
      deployedAt: new Date().toISOString(),
    };
  }
}
