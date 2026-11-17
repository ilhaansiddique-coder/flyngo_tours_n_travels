# Customer creation attribution

The admin Customers table shows Created at and Created By to admin and
super_admin accounts. The customer-list API requires those same roles.

New accounts record their source on creation:

- Self-registered: public name/phone/password registration.
- Self-registered (social login): a new account created by OAuth.
- Staff-created: the authenticated staff user's ID, with their name shown in
  the table. Creator fields submitted in the form are ignored.
- System (guest booking): automatically provisioned by a guest booking.
- System: a new account created by the database seed.

Accounts predating this feature show Unknown (older account). Their creator
was not recorded, so creation dates or current roles are not used to guess.
Linking social login or changing a password does not replace attribution.

Deploy the backend and frontend together. The backend entrypoint applies
`20261117140000_user_creation_attribution` using `prisma migrate deploy` before
starting. Confirm that migration succeeded before serving the new backend;
the code requires its new columns. No database reset or historical backfill
is needed. Existing creation timestamps are preserved.

## Account deletion

Account deletion now permanently removes the account and its owned records,
including bookings, travelers, payments, invoices, credentials, documents,
notifications, reviews, posts, rewards, referral entries, and attributable
leads/tracking records. It is used by the admin account delete action,
self-service account deletion, Facebook's verified deletion callback, and the
user purge action in Trash. New account deletions do not go to Trash.

All database changes run in a transaction. Other accounts, shared content,
tenant settings and catalog items are preserved. Creator/processor references
to the removed account are detached; affected rewards/payment totals are
reconciled. A new registration using the same phone/email receives a new ID.

Managed uploaded objects are queued in `media_deletion_jobs` inside that same
transaction. Physical deletion runs immediately and retries every minute on
storage failure. Shared files still referenced by surviving data are preserved.
The API reports `pendingFileDeletions` until storage cleanup succeeds.

The `20261117160000_account_file_deletion_queue` migration must succeed before
the new backend serves deletion requests. Compose defaults to refusing startup
if migrations fail. Existing backups and copies already sent to third parties
are outside this live application deletion process.

Previously soft-deleted accounts are not automatically purged by deployment.
They can still be explicitly purged through Trash. Legacy restoration is
blocked if another current account uses the phone or email. The earlier
`20261117150000_release_deleted_customer_identifiers` migration releases keys
held by those historical deletions.
