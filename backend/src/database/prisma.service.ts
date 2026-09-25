import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '../config/config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    const isDev = configService.isDevelopment;

    super({
      log: isDev
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
      errorFormat: 'pretty',
    });
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    try {
      await this.$connect();
      this.logger.log('Database connection established');
      await this.ensureDefaultTenant();
    } catch (error) {
      this.logger.error(
        `Database connection failed: ${(error as Error).message}`,
      );
      this.logger.warn(
        'PostgreSQL is not running. Start it with:\n' +
        '  sudo docker compose -f ../infrastructure/docker/docker-compose.yml up -d postgres redis\n' +
        'Then restart the server.',
      );
      if (!this.configService.isDevelopment) {
        throw error;
      }
    }
  }

  private async ensureDefaultTenant() {
    const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001';
    try {
      const exists = await (this as any).tenant.findUnique({
        where: { id: DEFAULT_TENANT_ID },
      });
      if (!exists) {
        await (this as any).tenant.create({
          data: {
            id: DEFAULT_TENANT_ID,
            name: 'Flyngo',
            slug: 'flyngo',
            domain: 'flyngo.com',
            isActive: true,
          },
        });
        this.logger.log('Default tenant ensured in database');
      }
    } catch (err: any) {
      this.logger.warn(`Could not verify/create default tenant: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
  }
}
