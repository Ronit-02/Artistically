# Analytics and privacy

Any product analytics or diagnostic collection must have an approved purpose, data-minimization review, retention policy, consent decision, and accountable owner before use. Analytics remains disabled until that approval exists.

Events describe durable outcomes, not optimistic button clicks. Do not collect passwords, tokens, cookies, full addresses, protected-file URLs, raw payment data, identity documents, or free-text support content. Prefer aggregate or pseudonymous identifiers, and do not make a third-party profile the authority for authentication.

Non-essential analytics loads only after the required consent state and must not block browsing, checkout, or account access. Error monitoring redacts headers, cookies, bodies, identity documents, payment fields, and vendor secrets.

Vendor choices, event names and properties, deployment state, and approval records are maintained outside version control.
