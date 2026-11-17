# Payment and notification verification

Reviewed 17 November 2026. This change applies to the Flyngo backend/frontend,
not the separate VBT application. It does not move money, send messages to real
customers, alter historical payments or require a database migration.

## Payment method inventory and enabled behavior

| Method/path | Implementation | Behavior after this change |
| --- | --- | --- |
| bKash, Nagad, Rocket, Upay, Tap, SureCash, mCash | Manual transfer to a configured tenant wallet; customer supplies transaction ID | Only configured methods are offered/accepted. Submission stays pending. Staff must check the merchant statement before marking completed. These are not gateway integrations. |
| Bank transfer | Active tenant bank account, sender details and private receipt attachment | Offered only when an account is configured. Receipt submission stays pending until staff verify the statement. |
| Cash | Request for office payment/collection | Request stays pending. Staff record receipt only after physically receiving the money. |
| `POST /payments/intent` | Previously created only a local pending row, with no provider checkout | Disabled with HTTP 503 for every method; creates no payment row. Adding credentials does not enable it. |
| Stripe / SSLCommerz online checkout | No complete checkout-to-provider flow in the reviewed customer UI/API | Unavailable. Historical admin filter labels do not enable checkout. |
| Automatic bKash callback | Previously used an unverified, application-invented HMAC callback contract | Disabled with HTTP 503. It cannot complete a manual wallet receipt. |
| bKash automatic refund | Previously returned a fabricated manual refund ID and success | Disabled. Reconcile the real refund outside the application before recording it as refunded. |
| Existing Stripe webhook/refunds | Signature-verified callback and actual Stripe refund API | Retained for historical gateway records. Refund requests use an idempotency key and acknowledge success only for provider status `succeeded`. Pending/failed refunds must not be presented as completed. This does not enable new Stripe checkout. |

Customer submissions no longer credit booking balances, generate a paid invoice,
award payment-related loyalty points, or send a payment-received receipt. Those
actions belong to the authorized staff completion path after reconciliation.
Checkout now says payment details await verification. A failed submission cannot
show the payment-submitted success message. Existing historical records are not
automatically reversed: review any previously auto-completed customer payments
against bank/wallet statements before client handover.

A read-only check of the deployed public methods endpoint returned HTTP 200 and
advertised bKash plus four bank accounts during this review. Account numbers were
not copied into this report. This confirms advertisement, not account ownership
or settlement; those five destinations need the owner-approved checks below.

## Notification channel inventory

| Channel | Requirements | Success/failure behavior |
| --- | --- | --- |
| Resend email | `RESEND_API_KEY`, verified sender in `EMAIL_FROM`/`SMTP_FROM` | Requires successful HTTP response and nonempty provider ID. Failure may fall back to configured SMTP; otherwise throws an unavailable error. |
| SMTP email, including invoices/PDF attachments | SMTP host/user/password (or Gmail host detection), correct port/TLS and authorized sender | Requires SMTP recipient acceptance, rejects partial/nonacceptance, propagates transport failures. No log-only success. |
| BulkSMSBD | Both `SMS_API_KEY` and an approved `SMS_SENDER_ID` | Requires successful HTTP response and provider code 202 (number or string). Missing configuration, rejected/malformed replies and network errors fail explicitly. The hardcoded fallback sender is removed. |
| FCM push | Valid Firebase credentials and user device tokens | Missing configuration/tokens returns `sent: false`; provider responses determine success. No log-only success. |
| Email queue | Configured Redis when enabled | Returns `queued` with job ID, not sent/delivered. Worker failure remains a failed job for configured retries. Inline sends return `accepted` only after the provider acknowledges. |
| Admin notifications | In-app database notification | UI/API explicitly describes an in-app notification. It does not promise email, SMS or push delivery. |

`GET /api/v1/notifications/admin/delivery-status` is restricted to admin and
super-admin roles. It exposes configuration booleans, not credentials or a
delivery certification. Public password-reset responses deliberately remain
neutral to prevent account enumeration; transport errors are logged internally.

Provider acceptance is not proof of inbox or handset delivery. Resend returns an
ID for the accepted request ([API contract](https://resend.com/docs/api-reference/emails/send-email));
FCM message IDs acknowledge handoff to FCM
([Firebase reference](https://firebase.google.com/docs/reference/admin/node/firebase-admin.messaging.messaging)).
Check provider delivery events and the recipient separately. Stripe refunds have
separate pending/failure/success states
([refund reference](https://docs.stripe.com/api/refunds/object)).

## Verification and release checklist

Automated coverage includes all seven wallet providers, bank and cash pending
submissions; unconfigured wallet rejection; disabled gateway intent/callbacks;
refund acknowledgement/idempotency; missing-provider and failed-provider cases;
valid Resend acknowledgements/attachments; SMTP acceptance and a real localhost
SMTP delivery; SMS reply parsing; unavailable push; and queue failure propagation.
HTTP provider tests use mocks; the SMTP integration uses a disposable local sink.
Neither establishes live merchant credentials or real inbox/phone delivery.
All 311 backend tests passed across 27 suites with the PostgreSQL integration
suites enabled against disposable localhost databases on Node 22.23.5.
Backend/frontend lint and production builds passed. All 24 frontend tests passed;
Windows test discovery used `--roots ./src --testMatch '**/*.test.ts'` to avoid
the existing platform-specific root glob and generated standalone package scan.

Before client delivery:

1. Rebuild/deploy both applications. Confirm gateway intent and automatic bKash
   callback endpoints return 503; confirm no new online checkout is advertised.
2. For **each wallet actually advertised**, confirm the account name/number with
   the business owner. Test a small authorized transfer with a unique reference,
   submit it, confirm the booking remains unpaid/pending, then reconcile the
   merchant statement and complete it through the admin panel. Verify the amount,
   currency, booking balance and invoice. Repeat for each configured bank account
   and an actual cash collection. Deactivate destinations the owner cannot verify.
3. Try a false reference, an inactive/wrong-tenant destination and a duplicate
   reference. They must never automatically mark a booking paid. Review previously
   auto-completed customer submissions separately; this patch preserves history.
4. Inspect admin delivery configuration status. Keep unused providers unconfigured.
   For each enabled channel, use an explicitly authorized test recipient/device,
   confirm the provider acknowledgement and actual receipt, including sender,
   booking code, amount/currency, links and invoice attachment where applicable.
   No production recipients or provider credentials were available to certify
   this step during the code change. Do not label a channel verified until done.
5. Use a controlled invalid recipient/provider failure to confirm an invoice send
   reports failure, queued mail retries instead of completing silently, and a
   legitimate booking/payment remains recorded even if its optional notification
   fails. Check spam/bounce reports and device permissions when acceptance occurs
   without recipient delivery. Remove credentials/disable a channel that fails.
6. For historical Stripe transactions only, verify signatures against the actual
   configured endpoint and reconcile refunds in Stripe. Do not enable new gateway
   checkout until creation, confirmation, verified callbacks, retries and refunds
   have passed provider sandbox and approved live tests end to end.

Production Coolify credentials, provider dashboards and recipient confirmation
were not accessible in this review. No real charge, refund, SMS, email or push
notification was issued. Live verification remains a deployment acceptance step.
