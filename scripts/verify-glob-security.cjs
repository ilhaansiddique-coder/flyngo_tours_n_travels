// Run from either application directory after npm ci. Every installed copy must
// use the reviewed fork, retain the APIs our tools use, and resist the ReDoS PoC.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

if (process.argv[2] === '--worker') {
  const pm = require(process.argv[3]);
  const cases = [
    ['src/auth/login.spec.ts', '**/*.spec.ts', true],
    ['src/auth/login.ts', '**/*.spec.ts', false],
    ['src/a.ts', '**/*.{js,ts}', true],
    ['src/.private.ts', '**/*.ts', false],
    ['photo.png', '*.@(png|jpg)', true],
    ['photo.gif', '*.@(png|jpg)', false],
    ['file7.ts', 'file[0-9].ts', true],
    ['foo.js', '!*.ts', true],
    ['foo.ts', '!*.ts', false],
    ['baaa', '+(*a)', true],
    ['aaab', '+(*a)', false],
    ['abc', '+(*)', true],
    ['', '*(*)', false],
  ];
  for (const [input, pattern, expected] of cases) {
    assert.equal(pm.isMatch(input, pattern), expected, `${pattern}: ${input}`);
  }
  assert.equal(pm('**/*.ts')('src/index.ts'), true);
  assert.equal(pm('**/*.ts', { ignore: '**/*.spec.ts' })('src/a.spec.ts'), false);
  assert.equal(pm.isMatch('.hidden.ts', '*.ts', { dot: true }), true);
  assert.equal(pm.makeRe('*.ts').test('index.ts'), true);
  assert.equal(typeof pm.parse('**/*.ts').output, 'string');
  assert.equal(pm.scan('src/**/*.ts').isGlob, true);

  // Inputs that cause exponential backtracking in the original package. A
  // separate process with a hard timeout makes a regression fail, not hang CI.
  const patterns = ['+(*)', '*(*)', '+(*a)', '*(*a)', '+(a*)', '*(a*)',
    '+(*[ab])', '*(*[ab])', '+(@(*a))', '+(*(a)|*(b))'];
  for (const options of [{}, { dot: true }, { capture: true }, { fastpaths: false }]) {
    for (const pattern of patterns) {
      const matcher = pm(`${pattern}Z`, options);
      assert.equal(matcher('a'.repeat(80) + '!'), false);
    }
  }
} else {
  const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
  const copies = Object.entries(lock.packages).filter(([name]) => name.endsWith('/picomatch'));
  assert.ok(copies.length > 0, 'No picomatch copies found; review this check before removing it');
  for (const [relativePath, locked] of copies) {
    const directory = path.resolve(relativePath);
    const installed = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
    for (const metadata of [locked, installed]) {
      assert.equal(metadata.name, '@ryotsu/picomatch', `${relativePath}: unreviewed package`);
      assert.equal(metadata.version, '4.0.7-a', `${relativePath}: unreviewed version`);
    }
    assert.equal(locked.integrity,
      'sha512-JroBFEmaejC7szGSfqOhF1QZHLKvX2wTA1+fWyfkpy3BjzdQKNPLKa2FtgeKVUDy5/UPUNkXEeCHJ5ZRBMLTVA==');
    const result = spawnSync(process.execPath, [__filename, '--worker', directory], {
      timeout: 5000, encoding: 'utf8', windowsHide: true,
    });
    assert.equal(result.error, undefined, `${relativePath}: ${result.error?.message}`);
    assert.equal(result.status, 0, `${relativePath}: ${result.stderr}`);
  }
  console.log(`Glob API and bounded ReDoS checks passed for ${copies.length} installed copies.`);
}
