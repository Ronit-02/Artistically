# Support runbook

## Triage order

1. Capture the user's email, order ID if relevant, route, approximate time, and exact visible error. Never request a password, full card number, token, or identity document by email.
2. Check the public status monitor and the request ID from the error response.
3. Classify the case as access, payment, order/fulfillment, digital delivery, refund/dispute, artwork/report, privacy, or security.
4. Confirm the durable state in the operator tools. Do not promise payment success from a redirect, screenshot, or client message.
5. Give the next safe action and a response target. Escalate if money, identity, safety, copyright, privacy, or account compromise is involved.

## Safe handling rules

- Payment questions: verify the order and payment reconciliation record. Never ask the buyer to retry repeatedly when a webhook may still be processing.
- Cancellation/refund: explain eligibility and consequences, then use the idempotent admin operation. Do not edit the database directly.
- Digital delivery: verify buyer/order-item authorization and expiry. Never send a private storage URL.
- Artist verification: do not disclose internal evidence or moderation notes beyond the approved decision message.
- Reports and appeals: preserve evidence, use the case queue, and record the decision reason.
- Privacy requests: route to the privacy owner. Do not export or delete data from ad hoc SQL.

## Escalation targets

| Severity | Example | Target |
|---|---|---|
| Sev 1 | Payment integrity, broad outage, active account compromise | Page on-call immediately; incident lead takes control |
| Sev 2 | Checkout degraded, shipment callback failure, repeated digital delivery failure | Engineering and operations within 30 minutes |
| Sev 3 | Single order delay, profile issue, non-urgent report | Support queue within one business day |
| Sev 4 | Product question or feedback | Normal support queue |

Record every customer-visible incident, owner, timestamps, decisions, and follow-up.
