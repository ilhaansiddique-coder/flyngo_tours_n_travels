// Keep deployment credentials out of URLs, redirects, response logs and HTTP.
async function triggerVerifiedDeploy({ webhookUrl, apiToken, fetchImpl = fetch }) {
  let url;
  try {
    url = new URL(webhookUrl);
  } catch {
    throw new Error('Set COOLIFY_DEPLOY_WEBHOOK to the HTTPS Deploy Webhook (auth required) URL from the Flyngo resource.');
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.hash) {
    throw new Error('COOLIFY_DEPLOY_WEBHOOK must use HTTPS without embedded credentials or a fragment. No deployment credentials were sent.');
  }
  const uuid = url.searchParams.get('uuid')?.trim();
  const tag = url.searchParams.get('tag')?.trim();
  if (!/^\/api\/v1\/deploy\/?$/.test(url.pathname) || Boolean(uuid) === Boolean(tag)) {
    throw new Error('Copy the authenticated Coolify /api/v1/deploy webhook with exactly one resource selector: uuid or tag.');
  }
  if (!apiToken || apiToken.trim() !== apiToken || /[\r\n]/.test(apiToken)) {
    throw new Error('Set GitHub Actions secret COOLIFY_API_TOKEN to the complete Coolify API token without quotes or surrounding whitespace.');
  }
  let response;
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}`, Accept: 'application/json' },
      redirect: 'error',
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    // Transport errors may contain the URL. Do not print them or retry a POST:
    // Coolify may have queued the deployment before a connection was lost.
    throw new Error('Could not confirm the Coolify deployment request. Check HTTPS/TLS, reachability and the Coolify deployment queue before retrying.');
  }
  if (response.status === 401) {
    throw new Error('Coolify returned 401 Unauthorized. Replace COOLIFY_API_TOKEN with a valid, active token for the correct team; copy its complete value including the ID and | separator.');
  }
  if (response.status === 403) {
    throw new Error('Coolify returned 403 Forbidden. Check the token deploy permission, team/resource access, API access and source-IP restrictions.');
  }
  if (!response.ok) {
    throw new Error(`Coolify rejected deployment (HTTP ${response.status}). Check the webhook URL and Coolify logs; no automatic retry was made.`);
  }
  return response.status;
}

module.exports = { triggerVerifiedDeploy };

if (require.main === module) {
  triggerVerifiedDeploy({
    webhookUrl: process.env.WEBHOOK_URL,
    apiToken: process.env.API_TOKEN,
  }).then((status) => {
    console.log(`Coolify accepted the deployment request (HTTP ${status}). Verify the rollout in Coolify.`);
  }).catch((error) => {
    console.error(`::error::${error.message}`);
    process.exitCode = 1;
  });
}
