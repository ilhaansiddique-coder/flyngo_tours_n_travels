# Backend crash confirmed from production logs — 18 November 2026

## Confirmed failure

`flyngo-backend` reaches PostgreSQL, applies all 63 migrations, skips bootstrap
seeding and then exits during Nest provider initialization. The fatal error is
`Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.`
The optional Google strategy was constructed unconditionally. The new provider
factory skips its construction when either credential is absent; the Google guard
returns the existing OAuth error redirect. Email/phone authentication and health
checks can run without Google credentials. No dummy OAuth credentials are needed.
Real Google login still requires the real client ID/secret and registered callback.

The separate `flyngo-meilisearch` exits because `MEILISEARCH_API_KEY` is empty.
Set a fresh random key in the existing server `.env`; do not reuse keys pasted
from logs. The backend and Meilisearch consume the same variable in Compose.
SMTP is also unconfigured in these logs, so email delivery/password-reset receipt
cannot be certified until an authorized transport is configured and tested.

## Actual deployment ownership

Docker inspect identifies project `flyngo_tours_n_travels`, service `backend`,
Compose file `/opt/flyngo_tours_n_travels/docker-compose.yml`, and image
`ghcr.io/ilhaansiddique-coder/flyngo-backend:main`. This is separate from the
timestamped Coolify stack containing postgres/redis/meilisearch. Restore the
existing application's backend first; do not delete either database or move
volumes while diagnosing. A future consolidation needs verified volume/network
ownership and a backup, rather than a fresh stack that may attach empty storage.

## Targeted recovery after CI publishes the fix

In the VPS host terminal, use the existing Compose project directory. Preserve
all database credentials, signing keys, mounts, networks and container names.

1. Generate a fresh random Meilisearch key locally with `openssl rand -hex 32`.
   Save it as `MEILISEARCH_API_KEY` in `/opt/flyngo_tours_n_travels/.env` using a
   trusted editor. Do not paste the value into chat or commit the environment file.
2. From `/opt/flyngo_tours_n_travels`, run:

   ```sh
   docker compose pull backend
   docker compose up -d --no-deps --no-build backend meilisearch
   docker compose ps -a
   docker compose logs --tail 80 backend meilisearch
   ```

   This requests replacement of these two services only. PostgreSQL, Redis and
   the healthy frontend are not selected for recreation. Do not use `down`,
   `down -v`, database reset, system prune or a new Compose project name.
3. Confirm backend remains running and healthy after migrations/boot; a single
   `Started` message is insufficient. Verify `/api/v1/health` through both the
   frontend and intended public API domain. If containers are healthy but the
   public domains still return 503, inspect Coolify proxy routing/network labels
   for the existing stack before switching traffic. Never treat the backend
   startup fix as proof that routing or end-user account sign-in is repaired.

The environment example now uses service names from the repository's own Compose
file instead of unrelated example hostnames. Existing production database DNS and
passwords that already work should remain unchanged.
