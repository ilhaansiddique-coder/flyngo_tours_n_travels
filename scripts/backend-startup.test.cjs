const assert = require('node:assert/strict');
const { test } = require('node:test');
const { mkdtempSync, writeFileSync, readFileSync, chmodSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const shellPath = (value) => value.replaceAll('\\', '/').replace(/^([A-Za-z]):/, (_, drive) => `/${drive.toLowerCase()}`);

// Exercise the actual entrypoint with fake binaries: no database or API starts.
for (const [name, environment, seeds] of [
  ['production updates skip bootstrap data by default', { NODE_ENV: 'production' }, 0],
  ['fresh installations can explicitly opt into seeding', { NODE_ENV: 'production', SEED_ON_STARTUP: 'true' }, 1],
  ['development keeps its initial seed behavior', { NODE_ENV: 'development' }, 1],
  ['an explicit false also disables development seeding', { NODE_ENV: 'development', SEED_ON_STARTUP: 'false' }, 0],
]) {
  test(name, () => {
    const directory = mkdtempSync(path.join(tmpdir(), 'flyngo-startup-'));
    try {
      const callsPath = path.join(directory, 'calls');
      const entrypoint = path.join(directory, 'entrypoint.sh');
      writeFileSync(entrypoint, readFileSync(path.join(__dirname, '../backend/docker-entrypoint.sh'), 'utf8').replaceAll('\r\n', '\n'));
      for (const binary of ['node', 'npx']) {
        const target = path.join(directory, binary);
        writeFileSync(target, `#!/bin/sh\nprintf '%s\\n' '${binary}'\nprintf '%s\\n' "${binary} $*" >> "$TEST_CALLS"\n`);
        chmodSync(target, 0o755);
      }
      const env = { ...process.env, SEED_ON_STARTUP: '', ...environment, TEST_CALLS: shellPath(callsPath) };
      const shell = process.platform === 'win32' ? 'C:/Program Files/Git/bin/bash.exe' : '/bin/sh';
      // Export PATH in the shell to avoid Git Bash rewriting the supplied PATH.
      const script = `PATH="${shellPath(directory)}:$PATH"; export PATH; exec sh "${shellPath(entrypoint)}"`;
      const result = spawnSync(shell, ['-c', script], { env, encoding: 'utf8', timeout: 10_000 });
      assert.equal(result.status, 0, result.stderr || result.error?.message);
      const calls = readFileSync(callsPath, 'utf8').trim().split('\n');
      assert.equal(calls.filter((line) => line === 'node prisma/seed.js').length, seeds);
      assert.equal(calls.filter((line) => line === 'npx prisma migrate deploy').length, 1);
      assert.equal(calls.at(-1), 'node dist/main');
    } finally {
      assert.equal(path.dirname(path.resolve(directory)), path.resolve(tmpdir()));
      rmSync(directory, { recursive: true, force: true });
    }
  });
}
