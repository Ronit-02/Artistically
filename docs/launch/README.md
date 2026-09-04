# Launch readiness pack

This folder is the source of truth for the quality and launch gates that are not represented by a unit test or database migration.

- [Accessibility and mobile audit](./accessibility-mobile-audit.md)
- [Performance budgets](./performance-budgets.md)
- [Analytics privacy review](./analytics-privacy-review.md)
- [Monitoring and alerts](./monitoring-and-alerts.md)
- [Support runbook](./support-runbook.md)
- [Rollback plan](./rollback-plan.md)
- [Legal and policy review](./legal-policy-review.md)
- [Browser and local smoke evidence](./browser-evidence-2026-08-25.md)
- [Release checklist](./release-checklist.md)

The current codebase has no analytics vendor, external monitor, or automated browser audit dependency configured. Those items require deployment/account setup and explicit approval. The documents define the safe contract so launch cannot silently proceed with invented coverage.

Run `npm run launch:smoke` against a deployment. In a local environment without PostgreSQL, use `ALLOW_NOT_READY=true npm run launch:smoke` only to validate liveness and public routes; production readiness must return 200.

The repository includes a scheduled production health workflow. It still needs the deployment owner to set `PRODUCTION_APP_URL` and configure GitHub failure notifications for the on-call channel.
