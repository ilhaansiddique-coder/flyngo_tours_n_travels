# Production login and release recovery — 18 November 2026

## Confirmed causes

- `https://flyngo.world/auth/login` redirects to `https://www.flyngo.world/auth/login`.
  Anonymous POST `/api/v1/auth/session` succeeds with Origin `https://flyngo.world`
  but returns 403 `Untrusted session request` with Origin `https://www.flyngo.world`,
  through either public API host. This happens before password validation.
- The app now accepts both of these exact HTTPS origins when either is configured
  as its frontend/admin origin. No other subdomain, scheme, port, wildcard or
  forwarded Host is implicitly trusted. Other deployments can use the explicit
  comma-separated `SESSION_ALLOWED_ORIGINS` setting. CORS includes the same list.
- A 403 on session restoration is a configuration rejection, not proof that a
  session was revoked. The browser now preserves in-memory state on this error.
- The previous update notifier blocked the entire page with no Later action.
  The new notice is dismissible, does not capture focus, and refreshes only when
  the user chooses Refresh. It cannot preserve unsaved input across a deliberate
  page refresh, server outage, or tab closure.
- `coolify.flyngo.world` has no A record. The HTTPS webhook is therefore unreachable.
  Client-owned Namecheap DNS is unavailable; no DNS or nameservers were changed.
- Startup previously seeded on every release, including admin password and
  bootstrap-setting updates. Production now skips seeding unless explicitly
  enabled with `SEED_ON_STARTUP=true`. Existing administrators are preserved even
  during an intentional seed, and passwords are no longer printed by the seed.
  A fresh database requires a one-time explicit seed; disable the flag afterward.

## Release without client DNS access

Set the GitHub Actions repository variable `COOLIFY_DEPLOY_MODE` to `manual`.
CI still requires all tests/builds and publishes both images. Its final job records
a manual handoff rather than sending an unreachable webhook. A green workflow
in this mode certifies image publication only, never a live deployment.

Use the existing authorized Coolify dashboard session. Open the **existing Flyngo
resource**, confirm the intended source commit and both image tags, and deploy.
Use the normal deployment action; do not stop/restart the stack first, recreate
the database, reset migrations or delete volumes. Keep existing JWT signing keys,
database credentials and persistent storage. Check migrations and readiness in
the deployment logs, then verify login through the final www hostname, reload
session restoration, public pages and database health. No schema changes are
required by this recovery patch.

The published images are `ghcr.io/ilhaansiddique-coder/flyngo-backend:main` and
`ghcr.io/ilhaansiddique-coder/flyngo-frontend:main`; SHA tags are also published.
Confirm Coolify pulls the newly verified pair rather than reusing cached images.
If Coolify builds from source instead, ensure it checks out the verified commit.

## Availability limitation

The existing Compose file exposes fixed host ports 3000/4000 and runs one instance
of each service. Its earlier zero-downtime guarantee was incorrect. Coolify's
application rolling replacement does not apply to Compose reconciliation.
Health checks and graceful shutdown help, but they cannot guarantee uninterrupted
requests while a single container is replaced. Do not treat a webhook fix as an
availability fix.

Before promising uninterrupted production updates, inspect the actual Coolify
resource type and proxy configuration. Use separate application resources with
health-gated rolling replacement or a validated blue/green deployment, internal
proxy networking rather than conflicting fixed host ports, durable shared storage,
backward-compatible schema/API changes and a tested rollback. Do this in staging
before changing the production topology. Existing form drafts need their own
save/resume behavior; the update banner does not implement persistent drafts.

## Future automatic deployment

When a valid HTTPS Coolify endpoint is available, set `COOLIFY_DEPLOY_WEBHOOK` to
its real authenticated deploy URL and `COOLIFY_DEPLOY_MODE` to `webhook` (or remove
the variable). Keep the existing HTTPS/credential checks. Do not send the API token
to the current plain-HTTP dashboard or disable certificate verification.

References:
- https://coolify.io/docs/applications/deployments/rolling-updates
- https://coolify.io/docs/core/instance-management/instance-settings
