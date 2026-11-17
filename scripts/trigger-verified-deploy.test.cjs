const assert = require('node:assert/strict');
const { test } = require('node:test');
const { triggerVerifiedDeploy } = require('./trigger-verified-deploy.cjs');

const webhookUrl = 'https://coolify.example.invalid/api/v1/deploy?uuid=test-only&force=false';
const apiToken = '123|test-only-not-a-real-token';

test('uses the documented authenticated POST and rejects redirects', async () => {
  const status = await triggerVerifiedDeploy({ webhookUrl, apiToken,
    fetchImpl: async (url, options) => {
      assert.equal(url.toString(), webhookUrl);
      assert.equal(url.toString().includes(apiToken), false);
      assert.equal(options.method, 'POST');
      assert.equal(options.headers.Authorization, `Bearer ${apiToken}`);
      assert.equal(options.redirect, 'error');
      assert.ok(options.signal instanceof AbortSignal);
      return new Response('{}', { status: 200 });
    },
  });
  assert.equal(status, 200);
});

for (const [name, changes] of [
  ['HTTP', { webhookUrl: webhookUrl.replace('https:', 'http:') }],
  ['embedded credentials', { webhookUrl: webhookUrl.replace('https://', 'https://user:password@') }],
  ['fragment', { webhookUrl: `${webhookUrl}#token` }],
  ['invalid URL', { webhookUrl: 'not-a-url' }],
  ['missing selector', { webhookUrl: 'https://coolify.example.invalid/api/v1/deploy' }],
  ['two selectors', { webhookUrl: `${webhookUrl}&tag=another-resource` }],
  ['wrong endpoint', { webhookUrl: webhookUrl.replace('/api/v1/deploy', '/dashboard') }],
  ['missing token', { apiToken: '' }],
  ['surrounding whitespace', { apiToken: ` ${apiToken}` }],
  ['header injection', { apiToken: `${apiToken}\r\nAnother: header` }],
]) {
  test(`rejects ${name} before sending credentials`, async () => {
    let called = false;
    await assert.rejects(triggerVerifiedDeploy({ webhookUrl, apiToken, ...changes,
      fetchImpl: async () => { called = true; throw new Error('Should not send'); },
    }));
    assert.equal(called, false);
  });
}

for (const [status, hint] of [[401, /complete value including the ID/], [403, /deploy permission/], [500, /HTTP 500/]]) {
  test(`HTTP ${status} fails with actionable diagnostics and no secrets`, async () => {
    let calls = 0;
    await assert.rejects(triggerVerifiedDeploy({ webhookUrl, apiToken,
      fetchImpl: async () => {
        calls++;
        return new Response(apiToken, { status });
      },
    }), (error) => {
      assert.match(error.message, hint);
      assert.equal(error.message.includes(apiToken), false);
      assert.equal(error.message.includes(webhookUrl), false);
      return true;
    });
    assert.equal(calls, 1);
  });
}

test('transport failures do not expose URLs or credentials, or retry deployment', async () => {
  let calls = 0;
  await assert.rejects(triggerVerifiedDeploy({ webhookUrl, apiToken,
    fetchImpl: async () => { calls++; throw new Error(`${webhookUrl} ${apiToken}`); },
  }), (error) => {
    assert.equal(error.message.includes(apiToken), false);
    assert.equal(error.message.includes(webhookUrl), false);
    assert.match(error.message, /deployment queue before retrying/);
    return true;
  });
  assert.equal(calls, 1);
});
