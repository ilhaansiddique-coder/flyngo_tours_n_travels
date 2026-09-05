import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { PrismaService } from '../../database/prisma.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

// Extra types accepted when a caller opts into document uploads (e.g. a
// customer attaching a passport / ID / ticket to their profile).
const DOCUMENT_MIME = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly uploadDir: string;
  private readonly publicBaseUrl: string;
  private r2ClientCache: S3Client | null = null;

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

  /** The R2 bucket name (only meaningful in r2 mode). */
  private get bucket(): string {
    return this.config.getOrNull('R2_BUCKET_NAME') || '';
  }

  /**
   * Lazily-built, cached S3 client pointed at the Cloudflare R2 endpoint. R2 is
   * S3-compatible: the endpoint is derived from the account id and the region
   * is the literal "auto". Built once and reused across uploads/deletes.
   */
  private r2Client(): S3Client {
    if (this.r2ClientCache) return this.r2ClientCache;
    const accountId = this.config.getOrNull('R2_ACCOUNT_ID') as string;
    this.r2ClientCache = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: this.config.getOrNull('R2_ACCESS_KEY_ID') as string,
        secretAccessKey: this.config.getOrNull('R2_SECRET_ACCESS_KEY') as string,
      },
    });
    return this.r2ClientCache;
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

  validateFile(file: Express.Multer.File, allowDocuments = false): void {
    if (!file) throw new BadRequestException('No file provided');
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File too large. Maximum allowed is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`,
      );
    }
    // Documents (receipts, NID/passport copies) must never be SVG — SVGs can
    // carry active script content and are not a real scanned-document format.
    // SVG stays allowed only for the authenticated admin media library.
    const baseImages = new Set([...ALLOWED_MIME]);
    if (allowDocuments) baseImages.delete('image/svg+xml');
    const allowed = allowDocuments ? new Set([...baseImages, ...DOCUMENT_MIME]) : ALLOWED_MIME;
    // Accept the file if EITHER the reported mimetype is allowed OR the
    // filename extension maps to an allowed type. Some OS/browser combinations
    // report files as application/octet-stream (notably Windows / GNOME file
    // pickers), so rejecting on mimetype alone would block legitimate uploads.
    const mime = file.mimetype || '';
    const extType = this.detectMimeFromName(file.originalname);
    const mimeAllowed = allowed.has(mime);
    const extAllowed = extType !== 'application/octet-stream' && allowed.has(extType);
    if (!mimeAllowed && !extAllowed) {
      throw new BadRequestException(`Unsupported file type: ${mime || file.originalname}`);
    }
    // If the mimetype is unknown but the extension is recognised, use the
    // detected type so downstream storage keys get the right extension.
    if (!mimeAllowed && extAllowed) {
      (file as any).mimetype = extType;
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
    if (ext === '.pdf') return 'application/pdf';
    if (ext === '.doc') return 'application/msword';
    if (ext === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (ext === '.xls') return 'application/vnd.ms-excel';
    if (ext === '.xlsx') return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (ext === '.txt') return 'text/plain';
    if (ext === '.csv') return 'text/csv';
    return 'application/octet-stream';
  }

  async upload(
    file: Express.Multer.File,
    options: { tenantId: string; folder?: string; alt?: string; allowDocuments?: boolean },
  ): Promise<UploadResult> {
    this.validateFile(file, options.allowDocuments);

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

  private async uploadToR2(file: Express.Multer.File, key: string): Promise<string> {
    try {
      await this.r2Client().send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype || this.detectMimeFromName(file.originalname),
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
      // urlBase() returns R2_PUBLIC_URL in r2 mode (a custom domain or the
      // r2.dev bucket URL); the key is appended to form the public URL.
      return `${this.urlBase()}/${key}`;
    } catch (err: any) {
      // Never lose an upload to a transient R2 error: fall back to local disk
      // so the admin still gets a working URL, and surface the reason.
      this.logger.error(`R2 upload failed for ${key}: ${err.message}. Falling back to local.`);
      return this.uploadToLocal(file, key);
    }
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
    await this.deleteStoredObject(existing.url);
    return existing;
  }

  /**
   * Delete the underlying object for a stored media URL. Decided by the URL
   * prefix, not the current mode, so files uploaded under a previous storage
   * config (e.g. local before R2 was turned on) are still cleaned up. Failures
   * are logged, never thrown — the DB row is already gone.
   */
  private async deleteStoredObject(url: string): Promise<void> {
    const r2Base = (this.config.getOrNull('R2_PUBLIC_URL') || '').replace(/\/+$/, '');
    const localBase = this.publicBaseUrl.replace(/\/+$/, '');

    // R2-hosted object.
    if (this.mode === 'r2' && r2Base && url.startsWith(r2Base)) {
      const key = url.slice(r2Base.length).replace(/^\/+/, '');
      try {
        await this.r2Client().send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }));
      } catch (err: any) {
        this.logger.warn(`Failed to delete R2 object: ${key} (${err.message})`);
      }
      return;
    }

    // Local-disk object.
    if (url.startsWith(localBase)) {
      const relativePath = url.slice(localBase.length).replace(/^\/+/, '');
      const filePath = path.join(this.uploadDir, relativePath);
      try {
        await fs.unlink(filePath);
      } catch (err: any) {
        if (err?.code !== 'ENOENT') {
          this.logger.warn(`Failed to delete local file: ${filePath} (${err.message})`);
        }
      }
    }
  }

  async removeManyByUrl(urls: string[], tenantId: string) {
    if (!urls.length) return 0;
    const result = await this.prisma.media.deleteMany({
      where: { tenantId, url: { in: urls } },
    });
    return result.count;
  }
}
