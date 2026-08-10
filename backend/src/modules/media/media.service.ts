import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../database/prisma.service';
import { promises as fs } from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
}

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly uploadDir: string;
  private readonly publicBaseUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    this.publicBaseUrl = this.config.getOrNull('PUBLIC_UPLOAD_BASE_URL') || '/api/v1/uploads';
  }

  get mode(): 'r2' | 'local' {
    const accountId = this.config.getOrNull('R2_ACCOUNT_ID');
    const accessKey = this.config.getOrNull('R2_ACCESS_KEY_ID');
    const secretKey = this.config.getOrNull('R2_SECRET_ACCESS_KEY');
    const bucket = this.config.getOrNull('R2_BUCKET_NAME');
    return accountId && accessKey && secretKey && bucket ? 'r2' : 'local';
  }

  /**
   * Public URL prefix the stored URL is given. The backend serves static
   * uploads at `/api/v1/uploads/...` so the Next.js rewrite can proxy them
   * transparently. For R2, this becomes the configured public bucket URL.
   */
  private urlBase(): string {
    const r2public = this.config.getOrNull('R2_PUBLIC_URL');
    if (r2public) return r2public.replace(/\/+$/, '');
    return this.publicBaseUrl.replace(/\/+$/, '');
  }

  validateFile(file: Express.Multer.File): void {
    if (!file) throw new BadRequestException('No file provided');
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum allowed is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`,
      );
    }
    const mime = file.mimetype || this.detectMimeFromName(file.originalname);
    if (!ALLOWED_MIME.has(mime)) {
      throw new BadRequestException(
        `Unsupported file type: ${mime}. Allowed: ${Array.from(ALLOWED_MIME).join(', ')}`,
      );
    }
  }

  private detectMimeFromName(name: string): string {
    const ext = path.extname(name).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
    if (ext === '.png') return 'image/png';
    if (ext === '.webp') return 'image/webp';
    if (ext === '.gif') return 'image/gif';
    if (ext === '.svg') return 'image/svg+xml';
    if (ext === '.avif') return 'image/avif';
    return 'application/octet-stream';
  }

  async upload(
    file: Express.Multer.File,
    options: { tenantId: string; folder?: string; alt?: string },
  ): Promise<UploadResult> {
    this.validateFile(file);

    const ext = path.extname(file.originalname) || this.extFromMime(file.mimetype);
    const safeName = `${randomUUID()}${ext}`;
    const folder = (options.folder || 'general').replace(/[^a-z0-9_-]/gi, '').toLowerCase() || 'general';
    const key = `${folder}/${safeName}`;

    let url: string;
    if (this.mode === 'r2') {
      url = await this.uploadToR2(file, key);
    } else {
      url = await this.uploadToLocal(file, key);
    }

    const record = await this.prisma.media.create({
      data: {
        tenantId: options.tenantId,
        url,
        alt: options.alt || null,
        filename: file.originalname,
        folder,
        mimeType: file.mimetype || this.detectMimeFromName(file.originalname),
        size: file.size,
      },
    });

    return {
      url: record.url,
      filename: record.filename ?? file.originalname,
      size: record.size ?? file.size,
      mimeType: record.mimeType ?? file.mimetype,
    };
  }

  private extFromMime(mime: string): string {
    if (mime === 'image/jpeg') return '.jpg';
    if (mime === 'image/png') return '.png';
    if (mime === 'image/webp') return '.webp';
    if (mime === 'image/gif') return '.gif';
    if (mime === 'image/svg+xml') return '.svg';
    if (mime === 'image/avif') return '.avif';
    return '';
  }

  private async uploadToLocal(file: Express.Multer.File, key: string): Promise<string> {
    const targetPath = path.join(this.uploadDir, key);
    await fs.mkdir(path.dirname(targetPath), { recursive: true });
    await fs.writeFile(targetPath, file.buffer);
    return `${this.urlBase()}/${key}`;
  }

  private async uploadToR2(_file: Express.Multer.File, _key: string): Promise<string> {
    this.logger.warn('R2 mode requested but no SDK is wired. Falling back to local storage.');
    return this.uploadToLocal(_file, _key);
  }

  async list(tenantId: string, page = 1, limit = 50, q?: string) {
    const where: any = { tenantId };
    if (q && q.trim()) {
      const term = q.trim();
      where.OR = [
        { filename: { contains: term, mode: 'insensitive' } },
        { alt: { contains: term, mode: 'insensitive' } },
        { url: { contains: term, mode: 'insensitive' } },
      ];
    }
    const [items, total] = await Promise.all([
      this.prisma.media.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.media.count({ where }),
    ]);
    return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async remove(id: string, tenantId: string) {
    const existing = await this.prisma.media.findFirst({ where: { id, tenantId } });
    if (!existing) return null;
    await this.prisma.media.delete({ where: { id } });
    if (this.mode === 'local' && existing.url.startsWith(this.urlBase())) {
      const relativePath = existing.url.replace(this.urlBase(), '').replace(/^\/+/, '');
      const filePath = path.join(this.uploadDir, relativePath);
      try {
        await fs.unlink(filePath);
      } catch (err: any) {
        if (err?.code !== 'ENOENT') {
          this.logger.warn(`Failed to delete local file: ${filePath} (${err.message})`);
        }
      }
    }
    return existing;
  }

  async removeManyByUrl(urls: string[], tenantId: string) {
    if (!urls.length) return 0;
    const result = await this.prisma.media.deleteMany({
      where: { tenantId, url: { in: urls } },
    });
    return result.count;
  }
}
