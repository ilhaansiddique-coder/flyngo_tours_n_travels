# Release verification

## Required release graph

`ci.yml` runs on every main push, pull request and manual verification request.
There are no path filters that can omit cross-application checks.

1. Backend audit, read-only lint, typecheck, unit tests, required PostgreSQL/HTTP
   integration tests and production build.
2. Frontend audit, lint, unit tests and production build, then Chromium and Firefox
   against the standalone frontend, the backend build from step 1, and a real
   isolated PostgreSQL database. Browser authentication/API calls are not mocked.
3. **Release verification** fails if either required job fails, cancels or skips.
4. On main only, both reusable image workflows run after the gate. They have no
   independent push/manual deployment trigger. No `lint || true` or
   `--passWithNoTests` fallback remains in these Flyngo release paths.
5. Only after both images publish does a single job call Coolify. HTTP/network
   failure fails that job. Pull requests never publish or trigger deployment.

Failed browser tests retain traces, screenshots and an HTML report as Actions
artifacts. Browser tests use one worker and no retries, so flaky retries cannot
silently make a release green. The separate VBT workflows are outside this scope.

## Database verification

PostgreSQL 16 service containers are created per CI job; no production secrets or
database URLs are used. `backend/scripts/prepare-release-tests.cjs` creates only
fixed test databases on `127.0.0.1`, applies `prisma migrate deploy`, and uses
`prisma migrate diff --exit-code` to reject schema drift. It never substitutes
`db push` for migrations and never resets existing databases automatically.

- `flyngo_sessions_test`: session rotation, revocation and authenticated HTTP.
- `flyngo_private_media_test`: private uploads/downloads, ownership and migration.
- `flyngo_account_deletion_test`: permanent deletion and SQL cleanup.
- `flyngo_browser_test`: default tenant, test admin/customer role, one tour and a
  fake bank destination. Only local browser tests use these fixtures/credentials.

`npm run test:integration` (also `npm run test:e2e`) fails up front if its three
database URLs are absent or select a different host/database. The superseded
AppModule test expected email-only registration and refresh tokens in JSON; the
replacement database/HTTP suites and real browser signup cover the current
phone-based, HttpOnly-cookie session contract.

Fresh migration tests exposed historical differences from the Prisma schema.
`20261117220000_reconcile_release_schema` aligns nullable device-token platform
and payment owner columns, foreign-key actions, redundant indexing and defaults
with the existing schema. It removes no rows. Deployment must apply this new
migration; inspect the startup migration result before client acceptance.

## Running locally

Use Node 22+, installed dependencies and a disposable localhost PostgreSQL server.
Supply the port/password for that test server, never the Coolify database URL.
The CI workflow contains the complete environment setup. For a default port:

```sh
export RELEASE_TEST_DATABASE_BASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/postgres
export SESSION_TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/flyngo_sessions_test
export PRIVATE_MEDIA_TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/flyngo_private_media_test
export ACCOUNT_DELETION_TEST_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/flyngo_account_deletion_test
export E2E_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/flyngo_browser_test
```

From `backend`: run `node scripts/prepare-release-tests.cjs`,
`npm run test:unit`, `npm run test:integration`, `npm run build`, then
`node scripts/prepare-release-tests.cjs --browser-only`.

From `frontend`: run `npm test -- --runInBand`, build with
`BACKEND_URL=http://127.0.0.1:4107 NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3108 npm run build`,
install browsers with `npx playwright install chromium firefox`, then
`npm run test:e2e`. Playwright starts/stops both built servers; ports 3108 and 4107
must be free. It refuses to reuse an existing server or target a production DB.
Local HTTP uses backend `NODE_ENV=test`; production Secure-cookie attributes are
covered by the database/HTTP session suite. External SMTP/SMS/FCM/payments are
unconfigured for browser tests, so these tests issue no real messages or payments.

## Hosting controls

Local verification on 17 November 2026 used Node 22.23.5 and isolated PostgreSQL
18 databases: 268 backend unit cases, 43 required database/HTTP integration cases,
28 frontend unit cases and all 30 Chromium/Firefox cases passed. Both production
builds, lint, typechecks and actionlint 1.7.12 validation passed. Migration-based
databases matched the Prisma schema after all 62 migrations. Hosted CI separately
uses PostgreSQL 16, matching the deployment's database major version. Browser tests
do not certify real OAuth, payment-provider or message-provider delivery.
The homepage now uses an SVG globe when WebGL2 is unavailable. Browser coverage
deliberately disables WebGL to verify that navigation remains usable without
uncaught rendering errors; unsupported graphics is not ignored by the test gate.

Configure branch protection/rulesets to require **Release verification**. In
Coolify, use the GHCR image-based Compose deployment and disable independent Git
auto-deploy, watchtower or registry-triggered redeployment. Otherwise that external
automation can bypass repository checks and pull old/partially published images.
The repository gate does not change or certify these external settings. Manual
redeployment must select images from a successful verified release of one commit.

Workflow design follows [GitHub reusable-workflow requirements](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows)
and [Playwright web-server orchestration](https://playwright.dev/docs/test-webserver).
