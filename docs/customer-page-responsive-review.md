# Customer page responsive improvements

The customer list now displays each account's saved role, provided by the existing users API. Missing role names fall back to a readable role code or “Not assigned”; permissions and role assignments are unchanged.

## Changes

- Desktop: Role column after Name, with a keyboard-focusable horizontal table region when all columns cannot fit.
- Phone and tablet: labeled account cards, wrapping names, emails, document identifiers, roles and creation timestamps.
- Search: explicit submit button and autocomplete that stays closed after focus leaves the search input.
- Controls: 44px customer action targets, accessible action names, wrapping pagination and smaller-screen modal spacing.
- Shared admin shell: content can shrink around wide tables and topbar controls fit smaller screens.
- Public WhatsApp support widget is hidden on admin routes so it cannot cover account actions or dialogs.

## Verification scope

Browser regression coverage uses an isolated localhost PostgreSQL database and production frontend build, with a deliberately long account name, email, document identifiers and role. It checks widths 320, 375, 390, 640, 768, 1024, 1280, 1440 and 1920px, light/dark presentation, phone/tablet edit dialogs, touch target dimensions, empty-state column alignment and absence of page overflow. The existing customer-creation scenario also verifies the saved Customer role appears.

Responsive assertions run within the existing authenticated customer-management scenario. This keeps the complete Chromium/Firefox suite to four password-login requests rather than six, so it respects the unchanged API limit of five login attempts per minute. Run the full browser suite to check interactions between scenarios; running only the customer scenarios would miss this shared limit.

The production URL requires sign-in. This review does not claim authenticated production verification, physical-device testing or a complete audit of every public/admin page. Shared shell changes benefit other admin pages; their individual page layouts still require separate review.

GitHub pushes follow the repository's existing release controls. Manual deployment mode remains in place.
