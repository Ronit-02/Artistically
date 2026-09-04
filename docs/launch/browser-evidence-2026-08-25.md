# Browser and local smoke evidence

Run date: 2026-08-25  
App: local Next.js development server at `http://localhost:3001`

## Observed results

- Homepage rendered with a named header/banner/main/footer structure at the default browser viewport.
- At 390px by 844px, the homepage had no document-level horizontal overflow (`scrollWidth === clientWidth`), 0 unlabeled interactive controls, and 0 images missing `alt`.
- At 768px by 900px, the homepage had no document-level horizontal overflow, 0 unlabeled interactive controls, and 0 images missing `alt`.
- The homepage emitted no browser console errors or warnings in either responsive check.
- The homepage carousel exposed previous, next, and pause/resume controls in the accessibility tree.
- `GET /api/health/live` returned 200 with `status: "ok"`.
- `GET /api/health/ready` returned 503 with `status: "not_ready"` because no local PostgreSQL service was configured. This is the expected fail-closed readiness result, not a passing dependency check.
- The production artifact served on port 3002 passed `npm run launch:smoke`: liveness 200, all eight public smoke routes 200, and no analytics vendor markers in the homepage HTML. Readiness remained 503 because the verification environment intentionally had no PostgreSQL server.

## Limits of this evidence

The local environment had no PostgreSQL service. Catalog API requests and the dynamic story route therefore logged dependency failures, so product, artist, collection, story, checkout, account, and artist-portal data states were not treated as passed. This run also does not prove screen-reader behavior, contrast ratios, Core Web Vitals, real-provider image performance, payment flows, or production monitoring. Those require a deployed release candidate and the sign-off fields in the other launch documents.
