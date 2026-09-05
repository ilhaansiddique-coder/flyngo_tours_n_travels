import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Capture the raw request body so Stripe / bKash webhook signature
    // verification can hash the exact bytes that were signed. Without this,
    // req.rawBody is undefined and online payment confirmations never settle.
    rawBody: true,
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Refuse to boot with well-known public JWT secrets in production. The
  // signing keys are read from the DB by sub, so anyone who knows a default
  // secret can mint a token that resolves to a super-admin account.
  if (configService.isProduction) {
    const access = configService.getOrNull('JWT_ACCESS_SECRET') || '';
    const refresh = configService.getOrNull('JWT_REFRESH_SECRET') || '';
    const knownDefaults = ['change-me-access', 'change-me-refresh', 'change-me-access-secret', 'change-me-refresh-secret'];
    if (
      access.length < 32 ||
      refresh.length < 32 ||
      knownDefaults.some((d) => access.includes(d) || refresh.includes(d))
    ) {
      throw new Error(
        'Refusing to start in production: JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be ' +
          'strong (>= 32 chars) secrets, not the public defaults.',
      );
    }
  }

  app.use(helmet());
  app.use(cookieParser());

  // Serve uploaded media from the local filesystem at /api/v1/uploads so the
  // Next.js rewrite /api/v1/* -> BACKEND_URL/api/v1/* proxies them seamlessly.
  const uploadsDir = resolve(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }
  app.useStaticAssets(uploadsDir, { prefix: '/api/v1/uploads/' });

  const corsOrigins = [
    configService.get('FRONTEND_URL') || 'http://localhost:3000',
    configService.get('ADMIN_URL') || 'http://localhost:3001',
  ];
  // Allow additional origins via comma-separated CORS_ORIGINS env var.
  const extraOrigins = (configService.getOrNull('CORS_ORIGINS') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const allowedOrigins = [...corsOrigins, ...extraOrigins];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        logger.warn(`CORS rejected origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.setGlobalPrefix('api/v1');

  // Swagger publishes the full route surface, including every admin endpoint.
  // Useful during development and handover, but it should not be a public map
  // of the production API. Set ENABLE_SWAGGER=true to opt back in on a
  // production host (e.g. temporarily, for a client walkthrough).
  const swaggerEnabled =
    !configService.isProduction || configService.getBoolean('ENABLE_SWAGGER', false);

  if (swaggerEnabled) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Flyngo API')
      .setDescription('Flyngo Tours & Travels Platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'X-Tenant-Id', in: 'header' }, 'tenant-id')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get('BACKEND_PORT') || 4000;
  await app.listen(port, configService.get('BACKEND_HOST') || '0.0.0.0');

  app.enableShutdownHooks();

  logger.log(`Server running on http://localhost:${port}`);
  if (swaggerEnabled) {
    logger.log(`Swagger docs at http://localhost:${port}/api/docs`);
  }
}

bootstrap();
