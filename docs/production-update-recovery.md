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

Repository push webhook `658382886` was confirmed to call Coolify's source
webhook on every push, independently of Actions. It received the recovery pushes
before CI finished. It is now inactive (configuration retained), preventing new
pushes from requesting unverified production rollouts. This does not cancel any
deployment already queued in Coolify; inspect that queue in the dashboard.

The browser CI job uses Ubuntu 24.04 explicitly. The floating runner moved to
Ubuntu 26 and spent several minutes fetching browser OS packages; the installation
step is now bounded to ten minutes. Verification requirements are unchanged.

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

## Host-port collision recovery — 19 November 2026

Deployment of `bced300` built successfully, but Docker could not start its backend:
`Bind for 0.0.0.0:4000 failed: port is already allocated`. The deployment log also
shows that Coolify removed its previous containers before the new backend failed.
This is a container-networking failure, not a failed frontend build or database
health check. The existing owner of port 4000 must be identified before stopping
anything; a separately managed Flyngo stack was observed earlier.

Production Compose now exposes container ports 4000/3000 internally without
publishing them on the host. Existing proxy network membership, service port
labels, backend URL, database settings and all persistent volumes are unchanged.
The development override retains localhost-accessible host ports for local work.
Docker documents `expose` as internal ports rather than host-published ports:
https://docs.docker.com/reference/compose-file/services/#expose

Before another rollout, confirm the existing Coolify frontend/backend domain
routes target container ports 3000/4000 and the proxy can reach their network.
Also confirm Coolify's generated Compose has no host mappings for those two
services; remove any resource-level port mapping override if one is present.
Use the existing resource and storage, not a new stack or database. Do not run
`docker compose down -v`, delete volumes, or stop the port-owning containers as a
shortcut. A redeploy can still interrupt traffic; internal ports resolve the bind
collision, not the single-instance Compose availability limitation above.

After deployment, inspect backend and frontend runtime health and check the
public site, API health and authenticated customer Role column. A successful
image build or container creation alone does not establish a working rollout.

## Future automatic deployment

When a valid HTTPS Coolify endpoint is available, set `COOLIFY_DEPLOY_WEBHOOK` to
its real authenticated deploy URL and `COOLIFY_DEPLOY_MODE` to `webhook` (or remove
the variable). Keep the existing HTTPS/credential checks. Do not send the API token
to the current plain-HTTP dashboard or disable certificate verification.

References:
- https://coolify.io/docs/applications/deployments/rolling-updates
- https://coolify.io/docs/core/instance-management/instance-settings
