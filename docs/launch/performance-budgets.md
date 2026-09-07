# Performance quality

Public pages should load responsively, remain visually stable, and avoid unnecessary script or media weight.

## Launch budgets

| Metric | Budget |
|---|---:|
| LCP | ≤ 2.5s p75 |
| INP | ≤ 200ms p75 |
| CLS | ≤ 0.10 p75 |
| TTFB | ≤ 800ms p75 |
| Initial JavaScript | ≤ 170 kB compressed per public route |
| Largest above-the-fold image | ≤ 250 kB where artwork quality permits |
| Initial home or product page weight | ≤ 1.5 MB compressed |
| Public HTML smoke response | ≤ 200 kB |

Measure representative routes on cold and warm mobile and desktop profiles, including empty, slow, and failed data states. Record p75 results rather than best runs. The smoke check is not a Core Web Vitals substitute.

Observed results, provider-specific risks, exceptions, and release sign-off are maintained in the approved internal performance record.
