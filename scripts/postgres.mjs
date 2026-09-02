#!/usr/bin/env node
// Cross-platform embedded PostgreSQL for local dev.
// Works on macOS / Linux / Windows — no Docker, no system install required.
//
// Usage:
//   node scripts/postgres.mjs start   # foreground; Ctrl-C to stop
//   node scripts/postgres.mjs stop    # stops a running instance

import EmbeddedPostgres from 'embedded-postgres';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { platform, arch } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..');
const databaseDir = join(repoRoot, '.data', 'postgres');
const lockFile = join(databaseDir, 'postmaster.pid');

const USER = 'flyngo';
const PASSWORD = 'flyngo';
const PORT = 5432;
const DB_NAME = 'flyngo';

const cmd = process.argv[2] || 'start';

function isRunning() {
  return existsSync(lockFile);
}

async function getPgCtl() {
  const plat = platform();
  const a = arch();
  const map = {
    darwin: { arm64: '@embedded-postgres/darwin-arm64', x64: '@embedded-postgres/darwin-x64' },
    linux: {
      arm: '@embedded-postgres/linux-arm',
      arm64: '@embedded-postgres/linux-arm64',
      ia32: '@embedded-postgres/linux-ia32',
      ppc64: '@embedded-postgres/linux-ppc64',
      x64: '@embedded-postgres/linux-x64',
    },
    win32: { x64: '@embedded-postgres/windows-x64' },
  };
  const pkg = map[plat]?.[a];
  if (!pkg) throw new Error(`Unsupported platform ${plat}/${a} for embedded-postgres`);
  const mod = await import(pkg);
  return mod.pg_ctl;
}

async function start() {
  if (isRunning()) {
    console.error(`PostgreSQL is already running (lock file at ${lockFile}).`);
    console.error(`Run \`npm run db:down\` to stop it first.`);
    process.exit(1);
  }

  const pg = new EmbeddedPostgres({
    databaseDir,
    user: USER,
    password: PASSWORD,
    port: PORT,
    persistent: true,
    onLog: () => {},
    onError: (e) => console.error('[pg]', e),
  });

  if (!existsSync(databaseDir)) {
    console.log('Initialising PostgreSQL data directory...');
    await pg.initialise();
  }

  console.log(`Starting PostgreSQL on localhost:${PORT}...`);
  await pg.start();

  try {
    await pg.createDatabase(DB_NAME);
  } catch {
    // Database already exists on subsequent runs.
  }

  console.log('');
  console.log('✅ PostgreSQL is running');
  console.log(`   host:     localhost:${PORT}`);
  console.log(`   user:     ${USER}`);
  console.log(`   password: ${PASSWORD}`);
  console.log(`   database: ${DB_NAME}`);
  console.log(`   data dir: ${databaseDir}`);
  console.log('');
  console.log('Next steps (in another terminal):');
  console.log('   npm run db:migrate');
  console.log('   npm run db:seed');
  console.log('');
  console.log('Press Ctrl-C to stop.');

  let stopping = false;
  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    console.log('\nStopping PostgreSQL...');
    try {
      await pg.stop();
    } catch (e) {
      console.error('Error stopping postgres:', e);
    }
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep the event loop alive until SIGINT/SIGTERM.
  await new Promise(() => {});
}

async function stop() {
  if (!isRunning()) {
    console.log('PostgreSQL is not running.');
    return;
  }
  const pgCtl = await getPgCtl();
  const child = spawn(pgCtl, ['stop', '-D', databaseDir, '-m', 'fast'], {
    stdio: 'inherit',
  });
  child.on('exit', (code) => process.exit(code ?? 0));
}

function help() {
  console.log('Usage: node scripts/postgres.mjs <command>');
  console.log('');
  console.log('Commands:');
  console.log('  start   Start PostgreSQL in the foreground');
  console.log('  stop    Stop a running PostgreSQL');
}

if (cmd === 'start') {
  start().catch((err) => {
    console.error('Failed to start PostgreSQL:', err);
    process.exit(1);
  });
} else if (cmd === 'stop') {
  stop().catch((err) => {
    console.error('Failed to stop PostgreSQL:', err);
    process.exit(1);
  });
} else {
  help();
  process.exit(1);
}