# Monitoring and alerts

Audit date: 2026-08-25

## Monitored endpoints

- `GET /api/health/live` checks that the application process can serve requests.
- `GET /api/health/ready` checks configured production dependencies and returns a non-200 response when readiness is not met.

Configure an external monitor from a deployment region. Do not put credentials or vendor-specific secrets in this repository.

The repository also includes a five-minute GitHub Actions health monitor at `.github/workflows/production-health.yml`. Set the repository variable `PRODUCTION_APP_URL` to the production origin and enable failure notifications for the repository's on-call destination. The workflow fails closed when the variable is absent and treats readiness failure as an outage.

## Alerts

| Alert | Initial threshold | Owner/action |
|---|---|---|
| Liveness failure | 2 failures in 5 minutes | Page on-call; compare deploy and platform status |
| Readiness failure | 3 failures in 5 minutes | Check database/provider dependency and pause risky mutations |
| 5xx rate | >2% for 5 minutes or >5% for 1 minute | Open incident; inspect request IDs and recent deploy |
| Checkout/session failures | >3% of attempts for 10 minutes | Disable campaign traffic, inspect Stripe and quote logs |
| Payment webhook failures | Any sustained failure or unprocessed event older than 5 minutes | Reconcile before retrying financial actions |
| Authentication failures | 5x seven-day baseline for 15 minutes | Check abuse/rate limits and provider health |
| Fulfillment late rate | >10% of due seller orders | Support outreach and seller operations queue |
| Database saturation | Provider-defined warning threshold for 10 minutes | Stop nonessential jobs and scale/check slow queries |

## Log policy

Use request IDs to join a public error with structured server logs. Logs may include operation, actor ID when appropriate, resource ID, outcome, and latency. Never log secrets, cookies, authorization headers, raw payment data, identity documents, or full addresses.

## External configuration record

Monitor vendor: __________  Workspace: __________  Pager destination: __________  
Status page: __________  Database alert source: __________  Last test: __________
