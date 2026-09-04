# Accessibility and mobile audit

Audit date: 2026-08-25  
Scope: public marketplace, account, artist portal, admin, checkout return, and support/legal pages.

## Baseline

The repository already has semantic links and buttons, labelled landmarks, visible focus rings, reduced-motion handling for the homepage carousel, and 44px minimum control targets in the shared interaction patterns. The product rules require WCAG 2.2 AA as the launch bar.

This is a source audit and test plan, not a claim that every browser and assistive-technology combination has passed. A release candidate must run the manual matrix below against a deployed build.

## Required release checks

| Area | Check | Current evidence | Release gate |
|---|---|---|---|
| Keyboard | Tab through header, search, filters, product gallery, cart, checkout return, account tabs, artist tabs, dialogs, and admin queues | Shared controls use native links/buttons and `min-h-11` targets | No unreachable action, focus loss, or keyboard trap |
| Screen reader | Page title, landmark names, form labels/errors, live status, carousel state, pagination, and table headers | Accessibility contract tests and ARIA labels exist in source | VoiceOver or NVDA pass on the critical-flow matrix |
| Focus | Visible focus on light, dark, image, sticky, and modal surfaces | Focus tokens and `focus-visible` classes exist | No invisible focus indicator |
| Contrast | Body text, controls, error/success states, disabled states, focus ring | Token values are documented | Automated contrast scan has no WCAG AA error |
| Motion | Pause homepage carousel and verify `prefers-reduced-motion` | Homepage carousel exposes pause/resume | No autoplay or transition blocks comprehension |
| Touch | Header, filter controls, wishlist, quantity, carousel, tabs, forms | Project rule is 44px by 44px | No target below 44px or adjacent accidental activation |
| Reflow | 320px, 390px, 768px, 1024px, 1280px | Responsive rules and mobile nav exist | No required content hidden behind overflow or sticky panels |
| Zoom | 200% browser zoom and text-only zoom where supported | No fixed-height content contract | Reading and checkout remain usable |

## Known review points

- Verify the homepage carousel with a screen reader while changing slides. `aria-live` must not announce the whole page repeatedly.
- Verify the product gallery at 390px and with reduced motion. The room-preview control must remain understandable even when preview support is unavailable.
- Verify the artist portal mobile drawer restores focus to its trigger and closes on the expected escape path.
- Verify every form maps server field errors to the visible field and an error summary.
- Verify horizontal category and tab scrollers expose their first and last item at 390px.

The source audit also found low-contrast `text-gray-300` and `text-gray-400` utilities on light surfaces. Those usages were replaced with the existing `text-gray-500` value, and a regression test now rejects the two failing utilities in application source. This is a source-level guardrail; the deployed release candidate still needs a rendered contrast scan for component states and provider content.

## Manual sign-off

Release owner: __________  Date: __________  Build: __________  
Keyboard: __________  Screen reader: __________  Contrast scan: __________  Mobile: __________
