# One-time cleanup preserving the primary Super Admin

The customer table hides old soft-deleted users. Permanent deletion applies to
new delete actions; it does not retroactively erase those old rows on deploy.

This tool purges every other current or deleted account in the primary admin's
tenant, using AccountDeletionService for the account and all linked records.
It never runs automatically during deployment, migration, or API startup.

Protected account:

- ID: `00000000-0000-0000-0000-00000000admin`
- Email: `admin@flyngo.com`

After deploying this version, open the backend container's Terminal in Coolify.
Run a preview (no database changes):

```sh
node /app/dist/scripts/purge-non-admin-accounts.js
```

The supplied production list has 23 other accounts. If the preview matches,
execute the explicitly requested cleanup:

```sh
node /app/dist/scripts/purge-non-admin-accounts.js --execute --expected-count=23
```

The tool refuses a wrong/missing administrator or unexpected target count. It
reports per-account failures, remaining users, and pending physical file removal.
Each account deletion is atomic; a failure leaves that account's database data
unchanged. Newly appearing accounts are reported as remaining, not silently
added to the initial deletion list. The primary admin's identity, credentials,
role, active status, and creation timestamp are verified after cleanup.

Expected successful database result: `deletedCount: 23`, `remaining: 0`,
`failures: []`. Pending files retry through the backend cleanup worker.

In psql, verify the remaining records:

```sql
SELECT id, full_name, phone, email, deleted_at FROM users;
```

Only the protected Super Admin should remain in a single-tenant Flyngo database.
Other tenants are outside this tool's scope. Backups and copies already sent to
external services are outside live database and file cleanup.

## SQL alternative for the existing psql terminal

`backend/prisma/maintenance/purge-non-admin-accounts.sql` is a single atomic
cleanup statement plus a verification query, for the supplied 24-row account
list. It checks for the exact active Super Admin and exactly 23 other accounts
before any deletion. The latest backend migrations must already be applied.

Copy the complete file into a fresh `flyngo=#` prompt. It removes dependent
records, verifies the protected admin, and queues registered, unshared files
for the backend cleanup worker. A failure rolls back the database cleanup.
The expected notice reports 23 deleted accounts; the final query returns only
Super Admin for the selected tenant. If targets have already been removed or
the count has changed, it refuses to run and leaves the remaining data intact.

Find the protected account independently with:

```sql
SELECT id, full_name, email, is_active, deleted_at
FROM users
WHERE id = '00000000-0000-0000-0000-00000000admin'
  AND lower(trim(email)) = 'admin@flyngo.com';
```
