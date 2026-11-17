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
