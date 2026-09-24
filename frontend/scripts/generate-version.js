const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getGitInfo() {
  let sha = process.env.NEXT_PUBLIC_BUILD_SHA || process.env.GIT_SHA || '';
  let message = process.env.GIT_COMMIT_MESSAGE || '';
  let date = process.env.GIT_COMMIT_DATE || '';

  if (!sha) {
    try {
      sha = execSync('git rev-parse HEAD', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
    } catch {
      sha = Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 8);
    }
  }

  if (!message) {
    try {
      message = execSync('git log -1 --pretty=%B', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim().split('\n')[0];
    } catch {
      message = 'Update deployed';
    }
  }

  return {
    version: sha,
    shortVersion: sha.length > 7 ? sha.substring(0, 7) : sha,
    message,
    builtAt: date || new Date().toISOString(),
  };
}

const info = getGitInfo();
const targetPath = path.join(__dirname, '..', 'public', 'version.json');

try {
  fs.writeFileSync(targetPath, JSON.stringify(info, null, 2), 'utf-8');
  console.log(`[generate-version] Wrote version info: ${info.shortVersion} (${info.message})`);
} catch (err) {
  console.error('[generate-version] Error writing version.json:', err);
}
