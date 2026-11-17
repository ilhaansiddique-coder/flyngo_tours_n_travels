import { config as loadEnvironment } from 'dotenv';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { PRIMARY_ADMIN_EMAIL, PRIMARY_ADMIN_ID } from '../common/constants/primary-admin';
import { PrismaService } from '../database/prisma.service';
import { ConfigService } from '../config/config.service';
import { AccountDeletionService } from '../modules/users/account-deletion.service';
import { MediaService } from '../modules/media/media.service';
import { MediaDeletionService } from '../modules/media/media-deletion.service';

type CleanupDatabase = Pick<PrismaClient, 'user' | 'mediaDeletionJob'>;
type CleanupOptions = { execute?: boolean; expectedCount?: number };

/** Explicit, one-time cleanup. Never runs during application startup or migration. */
export async function purgeNonAdminAccounts(
  db: CleanupDatabase,
  deletion: Pick<AccountDeletionService, 'remove'>,
  options: CleanupOptions = {},
) {
  const keeper = await db.user.findUnique({
    where: { id: PRIMARY_ADMIN_ID }, include: { role: { select: { code: true } } },
  });
  if (!keeper || keeper.email?.toLowerCase() !== PRIMARY_ADMIN_EMAIL || keeper.role.code !== 'super_admin'
    || keeper.deletedAt || !keeper.isActive) {
    throw new Error('Cleanup refused: the exact active primary Super Admin account was not found. No accounts were deleted.');
  }
  const where = { tenantId: keeper.tenantId, id: { not: PRIMARY_ADMIN_ID } };
  const targets = await db.user.findMany({
    where, select: { id: true, fullName: true, deletedAt: true }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
  });
  const plan = {
    kept: { id: keeper.id, email: keeper.email, tenantId: keeper.tenantId },
    targetCount: targets.length,
    targets: targets.map((user) => ({ id: user.id, fullName: user.fullName, state: user.deletedAt ? 'deleted' : 'current' })),
  };
  if (!options.execute) return { mode: 'preview' as const, ...plan };
  if (!Number.isInteger(options.expectedCount) || options.expectedCount !== targets.length) {
    throw new Error(`Cleanup refused: expected count must match the current preview (${targets.length}). No accounts were deleted.`);
  }
  // Refuse a deployment missing the file-cleanup migration before deleting anything.
  await db.mediaDeletionJob.count({ where: { tenantId: keeper.tenantId } });
  const failures: { id: string; code: string }[] = [];
  let deletedCount = 0;
  for (const target of targets) {
    if (target.id === PRIMARY_ADMIN_ID) throw new Error('Cleanup refused: protected administrator appeared in deletion targets.');
    try {
      await deletion.remove(target.id, keeper.tenantId);
      deletedCount++;
    } catch (error) {
      failures.push({ id: target.id, code: (error as { code?: string }).code || (error as Error).name || 'Deletion failed' });
    }
  }
  const remaining = await db.user.count({ where });
  const preserved = await db.user.findUnique({ where: { id: PRIMARY_ADMIN_ID } });
  const protectedFields = ['id', 'tenantId', 'email', 'fullName', 'roleId', 'passwordHash', 'isActive', 'deletedAt', 'createdAt'] as const;
  if (!preserved || protectedFields.some((field) => String(preserved[field]) !== String(keeper[field]))) {
    throw new Error('Primary administrator verification failed. Inspect the database before rerunning cleanup.');
  }
  const pendingFileDeletions = await db.mediaDeletionJob.count({ where: { tenantId: keeper.tenantId } });
  return { mode: 'execute' as const, kept: plan.kept, targetCount: plan.targetCount,
    deletedCount, remaining, pendingFileDeletions, failures };
}

async function main() {
  // Resolve uploads and .env from the backend root even if the terminal starts at /.
  process.chdir(path.resolve(__dirname, '..', '..'));
  loadEnvironment();
  const args = process.argv.slice(2);
  if (args.some((value) => value !== '--execute' && !/^--expected-count=\d+$/.test(value))) {
    throw new Error('Usage: node dist/scripts/purge-non-admin-accounts.js [--execute --expected-count=23]');
  }
  const countArg = args.find((value) => value.startsWith('--expected-count='));
  const db = new PrismaClient();
  try {
    // Construct only the deletion services, without starting the API, seeding,
    // provisioning tenants or running background workers during a preview.
    const config = new ConfigService(new NestConfigService());
    const media = new MediaService(db as PrismaService, config);
    const fileDeletion = new MediaDeletionService(db as PrismaService, media);
    const deletion = new AccountDeletionService(db as PrismaService, media, fileDeletion);
    const result = await purgeNonAdminAccounts(db, deletion, {
      execute: args.includes('--execute'), expectedCount: countArg ? Number(countArg.split('=')[1]) : undefined,
    });
    console.log(JSON.stringify(result, null, 2));
    if (result.mode === 'execute' && (result.failures.length || result.remaining)) process.exitCode = 1;
    else if (result.mode === 'execute' && result.pendingFileDeletions) process.exitCode = 2;
  } finally { await db.$disconnect(); }
}

if (require.main === module) {
  void main().catch((error) => { console.error((error as Error).message); process.exitCode = 1; });
}
