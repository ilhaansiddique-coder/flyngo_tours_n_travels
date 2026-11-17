# Inactive account access

Setting a user's `is_active` database field to `false` prevents password login,
refresh-token exchange, and OAuth sign-in for that account. Existing access
tokens are checked against the current database record on every protected
request; a token that has not expired still receives HTTP 401 while its account
is inactive. The Passport JWT strategy follows the same rule.

Temporary-password completion and its scoped token also require an active
account. Password-reset options/link issuance exclude inactive accounts, and
reset links issued before deactivation cannot update them while inactive.
These checks do not change the existing temporary-password generation flow.

Public routes remain public. Optional JWT authentication treats an inactive
account's token as anonymous and does not attach that user's identity or
permissions to the request. This is consistent with its handling of expired
tokens; it is not a ban on anonymous browsing or guest submissions.

Deactivation does not delete customer data or change their password. It now revokes
server-managed sessions. Reactivation requires a new sign-in; old access and
refresh credentials remain invalid. Requests already executing when an
administrator disables an account are not cancelled.

The is_active field already exists. Server-managed session enforcement requires
the session database migration and coordinated frontend/backend deployment;
see [session deployment instructions](server-managed-sessions.md).

## Staging acceptance checks

1. Sign in using a disposable active customer. Save the access/refresh tokens
   only in the test client's private session.
2. Confirm a protected endpoint succeeds, then disable that customer using an
   authorized administrator.
3. Retry the same protected request and refresh exchange: both must return 401.
4. Confirm password login and linked Google/Facebook login cannot open a session.
5. A previously issued password-change token/reset link must not update the
   disabled account. No new session should be issued.
6. An anonymous visitor must still be able to use public pages. An inactive
   bearer token on an optional-auth route must not attach account permissions.
7. Confirm a separate active customer and the administrator can still sign in
   and use their permitted endpoints. Reactivate the test customer if needed.
