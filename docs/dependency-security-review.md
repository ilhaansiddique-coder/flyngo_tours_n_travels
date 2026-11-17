# Dependency security remediation — 17 November 2026

Scope: the Flyngo `backend` and `frontend` applications and their supplied Docker
builds. Advisory counts describe npm's registry audit results on the checked
lockfiles, not a penetration test or a claim that the whole site has no security
issues. No production data was changed and no live exploit was attempted.

## Audit result

| Application | Before: production dependency audit | After: production audit | After: full audit, including development tools |
| --- | --- | --- | --- |
| Backend | 24 findings: 2 critical, 10 high, 11 moderate, 1 low | 0 | 0 |
| Frontend | 12 findings: 1 critical, 9 high, 2 moderate | 0 | 0 |

Reproduce from each application directory:

```sh
npm ci
npm audit --omit=dev --audit-level=high
npm audit --audit-level=high
```

These are dated results; rerun audits because advisory data changes.

## Changes

| Area | Previous locked version(s) | Remediation |
| --- | --- | --- |
| Next.js / image processing | Next 16.3.4; affected Sharp | Next 16.4.6, Sharp 0.35.5; Next ESLint configuration aligned to 16.4.6 |
| Upload parsing | Direct Multer 1.4.5-lts.2 and Nest's Multer 2.2.0 | Multer 2.5.0, deduplicated; Multer types updated to version 2 |
| Nest/Express HTTP stack | Nest core/platform 11.1.28; body-parser 2.3.0; proxy-addr 2.0.7 | Nest runtime/testing packages aligned to 11.2.10; body-parser 2.4.0; proxy-addr 2.0.8 |
| Mail | Nodemailer 6.10.1 | Nodemailer 10.6.0 and current available transport types; real localhost SMTP regression test |
| Push SDK | Firebase Admin 13.10.0; affected Google/gRPC/multipart dependencies | Firebase Admin 14.5.1, @grpc/grpc-js 1.14.7, @fastify/busboy 3.2.6; application migrated to modular app/messaging imports |
| Socket transport | engine.io 6.6.9 | engine.io 6.6.11 through the compatible Socket.IO dependency chain |
| Unused dependencies | backend Handlebars, Google APIs and direct Zod; frontend next-pwa and direct Zod | Removed after checking source/build references. The unused next-pwa Workbox/Terser chain is removed too. Existing manifests remain. |
| Other transitive dependencies | Affected YAML, URI, brace expansion, XML and source-map packages | Patched through compatible lockfile updates; complete audits are clean |
| Prisma tooling consistency | CLI 6.12.0 with client 6.19.3 after a clean install | CLI and client aligned on 6.19.3; no Prisma 7/8 migration |
| Build-tool leaves | Nest CLI's affected glob/minimatch; Prisma config's affected deepmerge-ts | Scoped overrides resolve glob 14.0.6 and deepmerge-ts 8.0.2 without replacing Nest 11 or Prisma 6 |

The Firebase upgrade requires Node 22+, matching Docker and CI. Both application
lockfiles are committed. Docker builds now use `npm ci` and reject production
high/critical audit findings. CI audits the full dependency trees with a high
severity threshold. No advisory is ignored or suppressed.

The scoped overrides are deliberate compatibility decisions: Nest's build tool
uses glob's supported API for workspace assets; Prisma's configuration helper uses
the patched merge implementation. They are covered by the production build and
Prisma CLI checks. Reassess/remove them when the maintained parent release adopts
the patched leaves. Avoid `npm audit fix --force` as a substitute for this review.

## Deployed exposure assessment

The following conclusions come from source, lockfiles and deployment files.
Installed versions inside the live containers were not available for inspection.

| Advisory group | Exposure supported by this project |
| --- | --- |
| Next.js / Sharp | Public image optimization and self-hosted static rendering are present. These are relevant runtime surfaces. The Sharp RCE advisory specifically describes glibc-based Linux; the supplied Dockerfile uses Alpine/musl, so that condition is not established for the intended image. Other hosting or an older image cannot be excluded. Patching remains necessary. [Maintainer advisory](https://github.com/advisories/GHSA-2464-fhr4-w9xw). |
| next/og ImageResponse | No `ImageResponse`/`next/og` use was found. The custom `/api/og` handler returns XML-escaped SVG text directly. The affected ImageResponse path was not demonstrated here. No `use cache`/`unstable_cache` call sites were found either. [Maintainer advisory](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j). |
| Multer / body-parser | Public guest receipt and visa-document uploads reach Nest's multipart parser; other requests reach body-parser. These are active input boundaries. The newest async-fileFilter issue has an additional condition not configured in the inspected code, but other upload advisories and the old installed parser still justified patching. [Multer advisory](https://github.com/advisories/GHSA-q7qp-rjg7-q26m). |
| proxy-addr | Express installs this dependency. No application `trust proxy` subnet configuration was found, so the reported trusted-subnet spoofing prerequisite was not demonstrated. The affected leaf was patched regardless. [Advisory](https://github.com/advisories/GHSA-jqcg-44mw-7w3h). |
| Nodemailer | SMTP is an active optional notification path. User recipient addresses and external SMTP replies reach this library. Arbitrary raw messages/List-* headers are not exposed by the inspected send methods, so not every listed advisory has a demonstrated route. The transport was upgraded and tested against a localhost sink. [SMTP reply-parser advisory](https://github.com/advisories/GHSA-4g23-2xm8-66gc). |
| Firebase/gRPC/Busboy | Firebase is used for FCM push. No Firestore service or gRPC server exposure was found in application code. These were SDK dependency findings, not proof of a public gRPC endpoint. The SDK and leaves were patched. [Firebase release notes](https://firebase.google.com/support/release-notes/admin/node). |
| Engine.IO | Socket.IO/Nest websocket packages are installed, but no application WebSocketGateway was found. A listening Engine.IO endpoint was not demonstrated. The library is patched in the lockfile. |
| Handlebars/Zod | No application imports were found; mail templates are rendered by application code. These findings were installed-package exposure without a demonstrated template/schema execution path. Unused direct packages were removed. [Handlebars advisory](https://github.com/advisories/GHSA-p8wg-vrv2-v86f), [Zod advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5). |
| next-pwa/Workbox/Terser | next-pwa was neither imported nor configured. Its obsolete build chain was removed. It was not evidence of a vulnerable deployed service worker. |
| glob/deepmerge-ts | Build/configuration tooling, with no identified HTTP path supplying attacker-controlled patterns or cyclic objects. Both leaves are patched. [Glob release](https://github.com/isaacs/node-glob/releases/tag/v14.0.2), [Deepmerge advisory](https://github.com/advisories/GHSA-ggr8-5vv4-36mx). |

Read-only live checks returned HTTP 200 for the homepage and backend health during
the review. The backend version endpoint returned an empty SHA, and the frontend
returned a generated deployment identifier rather than a Git commit. These do not
establish which dependency versions are running. The changes become deployed
remediation only after fresh images are built and rolled out.

## Validation

- Clean lockfile installs for both applications, including normal Prisma generation.
- Node 22.23.5 typechecks and regression checks, matching the Docker/CI Node major.
- 273 backend tests passed, including real PostgreSQL sessions, account deletion,
  private downloads, normal multipart uploads and oversized-upload rejection.
- A real Nodemailer SMTP transport authenticated and delivered to a disposable
  localhost sink using `.invalid` addresses. No external email was sent.
- Firebase's modular initialization/multicast contract is tested with provider
  mocks; no production push notification was sent.
- All 24 frontend unit tests passed.
- Backend and frontend production builds and lint passed. Prisma 6.19.3 validated
  the schema and reported all 61 migrations applied in the disposable test database.
- The built frontend returned HTTP 200 for the homepage, login page and an optimized
  public PNG. A private-document image optimization request returned HTTP 404 with
  `Cache-Control: no-store, private`.
- Linux Docker images and live SMTP/FCM services require deployment verification;
  Docker is not installed in the local test environment.

## Rollout and verification

1. Rebuild and deploy **both images** from this commit using the committed
   lockfiles. Restarting an old image does not apply package patches. Keep Node
   22 or newer; use the existing deployment guides for earlier session/private
   storage changes if they have not yet been deployed.
2. This dependency change adds no database schema migration. Preserve existing
   database/upload volumes and environment settings.
3. Inspect actual container versions after rollout. In the backend container,
   run `node --version` and `npm ls --omit=dev --depth=0`. In the frontend runner,
   run `node -p "require('next/package.json').version"` and check it reports
   16.4.6 or a later patched compatible release.
4. Verify login/refresh/logout, admin customer creation, NID/passport/receipt
   upload and authorized downloads, booking/invoice rendering and public images.
5. Verify one client-authorized real notification through configured SMTP/FCM.
   The local transport/provider tests do not establish production delivery.
6. Run a container/OS vulnerability scan for the resulting Alpine/Node images.
   npm audit does not scan operating-system packages or prove that application
   authorization and business logic are correct.
