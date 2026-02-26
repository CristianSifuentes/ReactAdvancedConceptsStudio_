# Da Vinci Minimal Gallery

A responsive, minimalist photo gallery built with **CSS Grid**, **advanced CSS effects**, and **vanilla JavaScript interactions**, refined with a **masonry-inspired** dynamic layout engine.

## Reliability fix (all images render)

This version explicitly fixes broken image rendering:

- migrated image set to stable `picsum.photos` sources,
- added robust JS fallback (`onerror`) to swap failed images with an embedded SVG placeholder,
- added loading skeleton shimmer and fade-in to prevent broken-icon flashes,
- recalculates masonry spans after each image load/fallback so layout stays correct.

## Features

- **Three switchable gallery compositions**:
  - `masonry` (Pinterest-like flow with variable row spans),
  - `cinematic` (hero-first narrative composition),
  - `editorial` (clean magazine-like arrangement).
- **24 curated image cards** for richer, expert-level visual density.
- **Responsive behavior** for desktop, tablet, and mobile.
- **Advanced CSS styling**:
  - layered gradients,
  - subtle grain texture,
  - hover zoom,
  - visual filter presets,
  - reveal-on-scroll motion,
  - loading shimmer placeholders.
- **Runtime effect controls**:
  - classic,
  - noir,
  - sepia,
  - glow,
  - etched,
  - dream.
- **JS-powered masonry sizing** using image aspect ratio + CSS Grid row math.

## Tech Stack

- HTML5
- CSS3 (Grid, media queries, filters, transitions, keyframes)
- JavaScript (layout/effect toggles, IntersectionObserver, dynamic masonry row-span calculation, image fallback handling)

## Run locally

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173`

## Project Files

- `index.html` — gallery structure and controls.
- `styles.css` — responsive layouts, design system, effects, and loading states.
- `script.js` — layout/effect switching, masonry row-span engine, and image fallback logic.
