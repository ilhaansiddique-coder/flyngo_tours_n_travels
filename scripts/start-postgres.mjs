import EmbeddedPostgres from 'embedded-postgres';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const databaseDir = join(__dirname, '..', '.data', 'postgres');

const pg = new EmbeddedPostgres({
  databaseDir,
  user: 'flyngo',
  password: 'flyngo',
  port: 5432,
  persistent: true,
});

await pg.initialise();
await pg.start();

try {
  await pg.createDatabase('flyngo');
} catch {
  // Database may already exist on subsequent runs.
}

console.log('PostgreSQL running on localhost:5432 (user: flyngo, db: flyngo)');

process.on('SIGINT', async () => {
  await pg.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pg.stop();
  process.exit(0);
});
