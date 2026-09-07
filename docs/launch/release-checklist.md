# Release checklist

A release requires current evidence for accessibility, performance, privacy, operations, support, recovery, legal review, and external dependencies.

| Gate | Required release evidence |
|---|---|
| Accessibility and mobile | Keyboard, screen-reader, contrast, zoom, and touch verification on the release candidate. |
| Performance | Production-like p75 loading, interaction, stability, image, script, and page-weight evidence. |
| Privacy | Approved purpose, consent, retention, and data-minimization decision for non-essential collection. |
| Monitoring, support, and recovery | Tested availability and failure notification, named support escalation, and rehearsed compatible recovery. |
| Legal and policy | Business and qualified legal-owner approval of the applicable consumer, seller, privacy, content, payment, and support policies. |
| External dependencies | Production-like migration and integration verification for every required external capability. |

Gate status, environment checks, provider readiness, exceptions, owners, and the final release decision are maintained outside version control. Repository documentation alone is not a release approval.
