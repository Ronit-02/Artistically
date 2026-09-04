# Incident rollback plan

## Trigger

Use rollback for a deploy that causes a broad user-facing regression, payment or authorization risk, data exposure, or sustained error-budget breach. Do not roll back a migration blindly when it may destroy or reinterpret financial data.

## Steps

1. Incident lead declares the incident, records the current release, and freezes unrelated deploys.
2. Stop or constrain risky traffic using the deployment platform, feature flag, or maintenance control. Preserve checkout and webhook processing unless payment integrity is at risk.
3. Compare the current release with the last known-good release. Revert application code through the deployment platform.
4. Treat database migrations as forward-only. If a schema change is incompatible, use a forward compatibility patch or restore from the approved backup procedure. Never run destructive rollback SQL during a live incident without the database owner.
5. Reconcile payments, orders, inventory, refunds, notifications, and fulfillment after traffic stabilizes. Use request IDs and durable provider event IDs.
6. Validate liveness/readiness, auth, catalog reads, cart, checkout quote, webhook receipt, and the affected customer journey.
7. Communicate impact, current state, workaround, and next update through the approved support/status channels.
8. Close only after metrics recover and the incident lead records root cause, timeline, customer impact, and prevention work.

## Pre-launch rehearsal

- Restore a recent database backup into an isolated environment.
- Deploy the previous application artifact against the compatible schema.
- Replay a representative webhook fixture with idempotency protection.
- Verify no duplicate order, charge, refund, stock decrement, or notification is created.
- Record the measured recovery time and the owner for each step.

Release owner: __________  Database owner: __________  Incident lead: __________  Last rehearsal: __________
