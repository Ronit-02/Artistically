# Release checklist

Use this checklist for each release candidate. A checked repository item is not a substitute for a production owner or counsel sign-off.

| Gate | Repository evidence | Current status | Required release evidence |
|---|---|---|---|
| Accessibility and mobile | `accessibility-mobile-audit.md`, browser evidence, source contrast regression test | Source and local responsive checks passed | Screen-reader, keyboard, contrast, zoom, and touch sign-off on the release candidate |
| Performance budgets and Core Web Vitals | `performance-budgets.md`, `launch:smoke`, public HTML budget | Smoke budget passed | p75 LCP, INP, CLS, TTFB, image, JavaScript, and page-weight report from production-like mobile runs |
| Analytics privacy | `analytics-privacy-review.md`, no vendor markers in smoke output | Analytics disabled | Privacy owner approval before enabling any non-essential collection |
| Monitoring and alerts | health routes, `production-health.yml`, `monitoring-and-alerts.md` | Code and thresholds ready | Set `PRODUCTION_APP_URL`, test failure notification, and page an on-call destination |
| Support operations | `support-runbook.md` | Runbook ready | Name support owner, escalation contacts, response targets, and rehearse common cases |
| Incident rollback | `rollback-plan.md` | Plan ready | Rehearse artifact rollback and database-compatible recovery; record recovery time |
| Legal and policy | public policy pages, `legal-policy-review.md` | Draft content present | Business owner and qualified counsel approve policy version, effective date, geography, tax, privacy, consumer, and seller terms |
| Provider readiness | Prisma, Stripe, email, media, and shipment adapters | Local provider execution unavailable | Run test-mode payment, webhook, storage, email, shipment, and database migrations with production-like credentials |

## Decision

Release status: `NO-GO until all rows have production evidence or an explicitly approved exception.`

Release candidate: __________  Commit: __________  Date: __________  Incident lead: __________
