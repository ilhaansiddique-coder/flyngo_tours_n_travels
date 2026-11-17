# Private identity documents and payment receipts

## Behavior

NID front/back copies, passports, profile documents, visa attachments and payment
receipts use `/api/v1/media/private/:id`. This is a protected download reference,
not a public asset URL. The API checks the current account status, tenant and
ownership/role before returning bytes. Guessing or copying a file URL is not
authorization.

- Account owners can read their own documents and payment receipts.
- Same-tenant administrators and Super Admins can read identity documents.
- Managers/moderators can read booking visa attachments and receipts, consistent
  with existing booking/payment administration roles; they cannot read unrelated
  customer-profile NID/passport copies.
- Anonymous receipt/visa uploads receive a random one-hour upload capability.
  Only its hash and expiry are stored in PostgreSQL. The frontend keeps the
  capability in memory and sends it in an `X-Upload-Token` header for preview,
  or in the submission body when attaching the upload. It never enters a URL.
  A refresh/new tab loses an anonymous upload capability: upload again if needed.
- New private uploads always use local protected storage, even when public media
  uses R2. Marketing images and avatars retain their existing public behavior.
- Private responses use no-store headers, download disposition and byte-derived
  MIME types. SVG/HTML/spoofed images are not rendered as active content. Office
  documents download as binary; image/PDF previews use authenticated blobs.
- The public media library excludes private files. Its generic upload endpoint
  refuses sensitive folder names. Private upload endpoints enforce 10 MB limits.
- The frontend proxy blocks private document paths from Next.js image optimization,
  preventing private downloads from becoming publicly cached optimized images.

## Storage and deployment

1. Back up PostgreSQL and the upload volume before deployment. Keep a durable
   `/app/uploads` volume attached to the backend. The supplied compose file already
   mounts `backend_uploads` there. This is now required even if marketing media
   uses R2. Do not run multiple backend replicas with separate upload volumes;
   they must share this storage. Include it in backups and restore drills.
2. For the first rollout, pause document/receipt uploads and retire old backend
   replicas before migration. An old version must not keep writing public files
   during cutover. Deploy backend and frontend together. The new database migration adds private
   metadata to `media`. The entrypoint's `prisma migrate deploy` must succeed;
   do not bypass migration failures.
3. On backend startup, before HTTP listening, existing linked documents and media
   in `user-documents`, `receipts`, and `visa-documents` are copied to
   `/app/uploads/.private/<media-id>`. A database transaction updates identity,
   UserDocument, Payment receipt and booking visa metadata references. Public
   originals are then removed. A transaction lock prevents concurrent backfills.
   Repeated startup is safe, and removal retries after a crash. The backend
   refuses to finish startup if copying/removing a public original fails.
4. R2 migrations need the existing R2 credentials and public URL settings. Source
   files are read through the S3 API, never by fetching arbitrary URLs from the
   database. Old R2 uploads that fell back to local storage are supported.
   Unknown/historical storage URL prefixes require operator correction; do not
   bypass the failure by exposing private storage publicly. A missing source file
   is reported in logs and its old reference retired; this does not restore a file
   that was already lost.
5. Allow up to ten minutes for first-start migration, depending on file count.
   Compose has a 600-second backend health start period. If Coolify defines its
   own startup health grace, configure the same allowance there. Check for the
   `Private documents ready; legacy public originals removed` log message.
6. Purge old document URLs from any Cloudflare/CDN/reverse-proxy and Next.js image cache. The old
   public uploader used long-lived cache headers. Origin deletion cannot revoke
   bytes already cached or downloaded by someone. Any separate web server that
   directly serves the upload volume must deny `.private` and sensitive folders;
   do not expose this directory through R2/public static hosting.

The existing uploads volume is reused to avoid introducing an unmounted path
that loses documents on a Coolify redeploy. Express blocks `.private` and the
legacy sensitive folders before static handling; dotfiles are also denied. New
private directories/files use restrictive filesystem modes. Public URLs outside
these folders that are referenced as identity documents are moved and removed as
part of the same startup conversion.

Rolling back only the application image after migration is unsupported: the old
UI cannot open protected references and the old static configuration must not be
reintroduced. Prefer a forward fix; coordinate database and volume recovery if
restoring backups, and keep private folders blocked throughout recovery.

## Acceptance checks

- Upload/view a NID, passport, profile PDF and receipt as authorized users.
- Open their private URLs in a signed-out browser and as another customer: 404.
- Disable the owner and retry their existing access token: no document access.
- Verify owner/admin downloads, and restricted manager/moderator access.
- Complete a guest receipt and visa upload/submission without signing in;
  verify another guest without the capability cannot download or attach it.
- Confirm old local and R2 origin URLs no longer return the migrated bytes;
  repeat after purging any CDN caches.
- Confirm tour/marketing images still load and private files do not appear in the
  marketing media picker.
- Delete a disposable customer and verify linked and unattached private uploads
  are removed through the account cleanup worker.

## Validation

The PostgreSQL/HTTP integration suite is explicitly opt-in through
`PRIVATE_MEDIA_TEST_DATABASE_URL`. It accepts only a disposable localhost database
named `flyngo_private_media_test`. It tests migration, restart safety, failure
recovery, authorization, account status, cache headers, raw downloads, static URL
blocking, public images and private file cleanup. R2 copy/delete paths also have
mocked storage tests; live production R2 and CDN configuration require deployment
verification.
