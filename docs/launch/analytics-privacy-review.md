# Analytics and privacy review

Review date: 2026-08-25

## Decision

No analytics vendor is enabled in the repository. No tracking script, cookie, device fingerprint, or user-level event stream may be added by deployment configuration without a new review and consent decision.

This keeps the current build honest. The product can launch its operationally necessary logs and durable order notifications without pretending that analytics exists.

## Approved event design for a future opt-in implementation

| Event | Trigger | Allowed properties | Prohibited data |
|---|---|---|---|
| `catalog_search_submitted` | User submits a search | normalized query length bucket, filter names, result-count bucket | raw query if it can contain personal data |
| `artwork_viewed` | Product detail becomes visible | opaque artwork ID, referrer category | address, email, payment data |
| `cart_item_added` | Server confirms cart mutation | opaque artwork ID, quantity bucket | price supplied by browser, user identity |
| `order_payment_confirmed` | Verified payment event completes | opaque order ID hash, currency, amount bucket | card data, address, provider payload |
| `support_contact_started` | User activates support destination | page category, reason category | message body, order address |

Events must fire after the authoritative state change. Button clicks are not purchase or payment events.

## Privacy controls

- Do not send passwords, tokens, cookies, full addresses, protected file URLs, raw payment data, identity documents, or free-text support content.
- Prefer aggregate or pseudonymous identifiers. Do not make a third-party user profile the source of truth for authentication.
- Document retention, deletion, access, vendor subprocessors, international transfer, and opt-out behavior before enabling a vendor.
- Load non-essential analytics only after the required consent state exists. Do not block core browsing, checkout, or account access on consent.
- Error monitoring must redact request headers, cookies, bodies, identity documents, payment fields, and vendor secrets.

## Approval

Privacy owner: __________  Counsel/DPO: __________  Vendor: __________  Date: __________  
Until signed, analytics status is **disabled**.
