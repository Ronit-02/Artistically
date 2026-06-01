# Artistically — Next.js

A production-grade e-commerce app for discovering and purchasing original artwork, converted from React (CRA) to **Next.js 14** with full TypeScript, Zustand state management, and Tailwind CSS.

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict mode) |
| State Management | Zustand |
| Styling | Tailwind CSS v3 |
| Images | `next/image` (optimised) |
| Dev server | `next dev --turbopack` |

---

## Project Structure

```
src/
├── app/
│   ├── _components/        # App-level client wrappers
│   │   └── AppShell.tsx    # SPA navigation shell
│   ├── _pages/             # Page components (client)
│   │   ├── HomePage.tsx
│   │   ├── ProductPage.tsx
│   │   ├── CartPage.tsx
│   │   ├── SearchPage.tsx
│   │   ├── ProfilePage.tsx
│   │   └── TrackingPage.tsx
│   ├── globals.css
│   ├── layout.tsx          # Root layout + metadata
│   └── page.tsx            # Entry point → AppShell
├── components/             # Reusable UI components
│   ├── AccordionItem.tsx
│   ├── ArtistCard.tsx
│   ├── Button.tsx
│   ├── CartItem.tsx
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   ├── RatingStars.tsx
│   ├── SectionHeader.tsx
│   ├── SpecRow.tsx
│   └── index.ts            # Barrel exports
├── data/
│   └── index.ts            # All static data (fully typed)
├── store/
│   └── useAppStore.ts      # Zustand global store
└── types/
    └── index.ts            # Shared TypeScript interfaces
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server (Turbopack)
npm run dev

# Type-check
npm run type-check

# Production build
npm run build
npm run start
```

Open [http://localhost:3000](http://localhost:3000).

---

## Key Decisions

- **SPA-style navigation** — The app uses client-side page switching via Zustand (`page` state) to preserve the original UX flow without breaking changes.
- **`"use client"` boundaries** — Only components that use hooks or browser APIs are marked as client components; layout and metadata remain server-side.
- **Zustand over Context** — Replaces the original React Context with a Zustand store for better DevTools support, simpler selectors, and no provider boilerplate.
- **`next/image`** — All `<img>` tags replaced with `<Image>` for automatic optimisation (lazy loading, WebP conversion, responsive sizing).
- **Strict TypeScript** — All props, data shapes, and store slices are fully typed via shared interfaces in `src/types/index.ts`.
