# Newsletter, SEO and client content approval

Status: technical implementation prepared; **client content approval pending**.
The user's acknowledgement to proceed is not evidence that the client approved
customer counts, service promises, affiliations or performance claims. No client
was contacted and no approval has been recorded on their behalf.

## Changes ready for review

- The homepage newsletter submits to a real tenant-scoped subscription database.
  It requires explicit consent, sends a confirmation through the configured email
  transport, and adds the address to the confirmed list only after the recipient
  explicitly confirms. Confirmation links expire after 24 hours. Repeated requests
  have an email cooldown and public request throttling.
- Confirmation/unsubscribe tokens are hashed in the database. Links use URL
  fragments, action pages clear the fragment, suppress tracking scripts/events,
  declare noindex/no-follow and use no-referrer. GET requests do not change state,
  so email link previews cannot confirm a subscription or unsubscribe it.
- Missing/rejected email delivery is an explicit failure, not UI-only success.
  SMTP/Resend must be configured and an authorized real recipient must verify
  receipt after deployment. Test providers/sinks do not certify inbox delivery.
- Admin/super-admin can read confirmed members through
  `GET /api/v1/newsletter/admin/subscriptions?page=1&limit=20`. Pending and
  unsubscribed addresses are excluded. There is no public list or token export.
  No campaign or bulk-mail sender is advertised by this change. Before exporting
  to a mailing platform, establish its unsubscribe/suppression synchronization and
  ensure every campaign includes a working unsubscribe link; this endpoint alone
  is not a campaign delivery integration.
- Account deletion also deletes its related newsletter address, while preserving
  newer/recycled-owner contact records using the existing deletion safeguards.
- The sitemap omits the nonexistent `/visa-countries` listing. `/visa` remains the
  public listing; `/visa/{country-slug}` remains a valid detail pattern. Collection
  requests use supported page sizes, support nested response envelopes, enumerate
  pages, omit inactive/deleted/unsafe slugs and retain static routes on API failure.
  Sitemap generation is request-time, so an offline build does not permanently
  freeze out the live catalogue. Each source is bounded to 50 pages of 100 items;
  a larger catalogue needs sitemap partitioning before that limit is reached.
- Unsupported newsletter perks, invented membership/review figures, hardcoded
  homepage service counts and numeric fallback hero claims are removed. Default
  copy avoids approval rates, blanket cancellation/price/timing guarantees,
  instant ticket/booking claims and unsupported card-payment advertising.
- The combined six sources stay below the 50,000-URL sitemap limit at this bound.
- The migration creates the subscription table and replaces only the exact known
  application-generated hero badge/stats defaults. Custom CMS content is retained
  for review; preserving it does not certify its accuracy or client approval.

## Client sign-off register

| Claim/content | Evidence and policy the client must supply | Default treatment | Approval |
| --- | --- | --- | --- |
| 50,000 travelers, 500 destinations, 1,000/1,200 tours, 8,500 hotels, 400 airlines, 5,000 pilgrims, 200 cities | Dated source, counting definition, scope, exclusions and owner | Removed from hardcoded defaults | Pending |
| 2,418 weekly members, 50K newsletter members, 4.9-star rating | Subscriber analytics and genuine review source with permission | Removed | Pending |
| 98% visa approval or express turnaround | Verified outcomes/time period, denominator, jurisdiction, exclusions and authority disclaimers | Replaced with document guidance and authority-dependent decisions | Pending |
| 24/7 support/concierge | Staff coverage, channels, response commitments and escalation procedure | Replaced with contact/support language | Pending |
| Free cancellation, best-price/no-hidden-fee or on-time guarantees | Written policy, eligibility, exclusions, fees, remedy and operational owner | Replaced with package-specific terms/review wording | Pending |
| Instant flights/tickets/payment confirmation; Visa/MasterCard/Amex availability | Working provider contracts and end-to-end settlement/ticketing evidence | Replaced with available-method and staff-review wording | Pending |
| Licensed pilgrimage services, certified guides, lounge/VIP/charter benefits and affiliations | Current licenses/contracts, applicable packages and permission to use badges | Removed from revised default copy; inspect custom CMS and package descriptions | Pending |
| CMS hero stats, About text, trust badges, customer counts/years, testimonials, existing package inclusions and SEO metadata | Client-approved final EN/BN copy, evidence, testimonial consent and brand/legal review where applicable | Existing custom content requires client review | Pending |
| Newsletter sender, privacy notice, consent wording, campaign cadence and mailing platform | Business owner approval, verified sender/domain, privacy/retention policy and opt-out process | Neutral consent copy; no campaign promises | Pending |

Record before handover:

- Client approver name and role: **pending**
- Approved EN/BN text or document revision: **pending**
- Supporting evidence/policy references: **pending**
- Approval date and written approval reference: **pending**
- Content owner and next review date: **pending**

Do not restore a quantitative claim, guarantee, badge or member benefit merely
because it was present in the previous design. Publish client-approved wording
with its evidence, applicable conditions and review owner.

## Deployment acceptance

Local validation: 268 backend unit tests plus 48 database/HTTP integration cases,
31 frontend unit tests, all 36 Chromium/Firefox checks, both production builds
and lint passed on Node 22. The browser suite opens every generated sitemap URL,
including seeded inventory; the former live `/visa-countries` listing returned
404 and is excluded. Newsletter tests cover explicit consent, tenant isolation,
pending/confirmed/unsubscribed states, expiration, duplicate requests, provider
failure/retry, real localhost SMTP HTML transmission and account/SQL cleanup.
External inbox delivery and client approval are not certified by these tests.

Apply `20261117230000_newsletter_subscriptions`. Confirm pending signup, email
receipt, single-use confirmation, admin confirmed-list access, unsubscribe,
provider-failure UI and account deletion. Review pending/unconfirmed retention
with the client; this patch does not schedule automatic retention cleanup.
Fetch the deployed sitemap and open its listed URLs, including a published
detail page. Complete the sign-off register above before final client delivery.
