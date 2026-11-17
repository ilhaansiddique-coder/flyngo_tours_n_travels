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

## Deleted contact details

Deleted accounts do not reserve phone numbers or email addresses. Their raw
contact details remain in historical rows, but deletion clears the canonical
phone key and creation checks only current accounts. A new registration creates
a new ID, with its own creator and creation timestamp; old history is not
transferred. The `20261117150000_release_deleted_customer_identifiers` migration
also releases keys held by earlier deletions.

Restoration reclaims the phone key only if the phone and email are not currently
used by another account. Otherwise it returns a conflict and leaves both records
unchanged. Editing a deleted record does not reserve its phone key again.
