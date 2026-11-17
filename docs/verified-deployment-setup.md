# Verified deployment configuration

The release workflow requires backend tests, PostgreSQL integration, frontend
tests, Chromium/Firefox checks and production builds before either image is
published. The final job then requests a deployment through Coolify's API.
An accepted API request does not prove that the application's rollout is healthy.

## Current unresolved configuration (18 November 2026)

Commit `6a0a236` passed all five verification/image-publishing jobs. The final
deployment request returned HTTP 401, as did the earlier run before that commit.
The repository has a `COOLIFY_API_TOKEN` secret and a `COOLIFY_DEPLOY_WEBHOOK`
variable. The webhook currently uses HTTP. No Coolify configuration or secret
value has been changed by the agent; GitHub's API does not reveal secret values.

Before deployment can succeed:

1. In the correct Coolify team, create a replacement API token with `deploy`
   permission and access to the Flyngo resource. Copy the complete value,
   including its ID and `|` separator. Rotate the old token: the earlier webhook
   configuration sent its Authorization header over HTTP.
2. In GitHub repository **Settings → Secrets and variables → Actions → Secrets**,
   update `COOLIFY_API_TOKEN`. This is a Coolify API token, not a GitHub token.
   Do not paste it into a chat, commit, workflow or repository variable.
3. In Coolify, open the Flyngo resource's **Webhooks** page and copy **Deploy
   Webhook (auth required)** using the instance's valid HTTPS origin. The URL is
   `/api/v1/deploy?uuid=…` (or a deliberately configured `tag` target). If the
   instance has no HTTPS endpoint, configure its domain/TLS before sending a new
   token. Simply changing `http` to `https` does not install TLS on an HTTP port.
4. In the GitHub **Variables** tab, update `COOLIFY_DEPLOY_WEBHOOK` to that URL.
   It is a repository variable, separate from the Secrets tab. Preserve the
   intended Flyngo resource selector. No token belongs in this URL.
5. Run the workflow from the commit containing the hardened deployment script.
   Once the release gate and image jobs pass, inspect the deployment job and
   verify the actual rollout in Coolify and the website. Rerunning an older
   workflow uses the older version of its deployment code.

## Repository safeguards

`scripts/trigger-verified-deploy.cjs` rejects HTTP, embedded URL credentials,
fragments, unexpected endpoints, missing/ambiguous resource selectors and
missing/malformed token whitespace before sending credentials. It uses the
documented authenticated POST, rejects redirects, times out requests, and reports
401/403 separately without logging tokens, webhook values or response bodies.
It does not retry deployment POSTs automatically because a lost response can
occur after Coolify has queued a deployment. Failures remain failures in CI.

Fifteen Node tests verify request construction, preflight rejection, status
diagnostics, redaction and the absence of retries. They run in the required
backend verification job. Configuration still needs correction; these safeguards
do not manufacture a valid token or make the current 401 a successful deployment.

Official references:

- [Deploy webhooks](https://coolify.io/docs/core/automation/deploy-webhooks)
- [Authentication and authorization errors](https://coolify.io/docs/api/errors)
