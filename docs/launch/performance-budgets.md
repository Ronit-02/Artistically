# Performance budgets and Core Web Vitals

Audit date: 2026-08-25  
These are launch budgets for a production build, measured on representative public pages with a cold cache and a throttled mobile profile.

## Budgets

| Metric | Budget | Applies to |
|---|---:|---|
| LCP | ≤ 2.5s p75 | Home, search, product, artist, collection, story |
| INP | ≤ 200ms p75 | All interactive public pages |
| CLS | ≤ 0.10 p75 | All public pages |
| TTFB | ≤ 800ms p75 | HTML document and public API reads |
| JavaScript transferred | ≤ 170 kB compressed initial route payload | Public routes |
| Largest image resource | ≤ 250 kB where artwork quality permits | Above-the-fold public imagery |
| Total page weight | ≤ 1.5 MB compressed initial load | Home and product detail |
| Public HTML smoke response | ≤ 200 kB | Public HTML routes, excluding robots and sitemap |

## Measurement protocol

1. Run a production build with the same environment shape used for deployment.
2. Test home, search, product detail, artist detail, cart, login, and artist portal at 390x844 and 1440x900.
3. Use a mobile CPU/network profile approximating mid-tier Android on 4G, then repeat on desktop broadband.
4. Capture three cold and three warm runs per route. Record p75, not the best run.
5. Test with the real image provider and empty, slow, and failed API states.
6. Attach the report to the release record. A failed budget needs an owner and dated exception.

## Current source risks

- Homepage and detail surfaces intentionally load prominent images with `priority`; confirm only the true LCP image keeps priority.
- Artwork is the dominant payload. Confirm `sizes`, responsive formats, stable dimensions, and provider compression in deployment.
- React Query devtools must remain development-only.
- Avoid adding analytics or monitoring scripts until their consent and bundle cost are approved.

The repeatable `npm run launch:smoke` command records HTML response sizes and elapsed request time for public routes and fails if a public HTML response exceeds 200 kB. On the 2026-08-25 production-artifact run, the home response was 64,426 bytes and completed in 72ms. These numbers are smoke evidence only. They are not Core Web Vitals and do not replace a throttled production-browser measurement.

## Release sign-off

Measured by: __________  Date: __________  Device/profile: __________  
LCP: ______  INP: ______  CLS: ______  TTFB: ______  JS: ______  Exception owner: __________
