# FlowDesk — Next.js Landing Page

Converted from a single HTML file into a full Next.js 14 project with Tailwind CSS v3 and Framer Motion.

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS v3**
- **Framer Motion** (animations)
- **React Three Fiber** (installed, ready to use for 3D)
- **TypeScript**

## Project Structure

```
flowdesk/
├── app/
│   ├── globals.css          ← All design tokens, custom CSS, keyframe animations
│   ├── layout.tsx           ← Root layout with metadata + font import
│   └── page.tsx             ← Main page — assembles all section components
├── components/
│   └── sections/
│       ├── AnnouncementBanner.tsx   ← Dismissible top banner (Framer Motion)
│       ├── Navbar.tsx               ← Sticky nav with scroll effect + mobile menu
│       ├── Hero.tsx                 ← Full-viewport hero: aurora bg, particles, mockup, stats ticker
│       ├── LogoStrip.tsx            ← Infinite marquee logo strip
│       ├── ProblemSolution.tsx      ← Two-column problem/solution with scroll animations
│       ├── Features.tsx             ← 3-column feature cards grid with intersection observer
│       ├── ProductShowcase.tsx      ← Tabbed product demo with auto-rotate
│       ├── Pricing.tsx              ← 3-tier pricing with monthly/annual toggle
│       ├── Testimonials.tsx         ← Draggable testimonial carousel
│       ├── FinalCTA.tsx             ← Glowing CTA section with social proof
│       └── Footer.tsx               ← 4-column footer with newsletter form
├── package.json
├── next.config.js
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

## Setup Instructions

### 1. Copy files into your Next.js project

Copy all files maintaining the directory structure above into your blank Next.js project root.

### 2. Install dependencies

```bash
npm install
```

This installs:
- `next@14.2.3`
- `react` + `react-dom`
- `framer-motion`
- `@react-three/fiber` + `@react-three/drei` + `three`
- TypeScript + type definitions
- `tailwindcss`, `postcss`, `autoprefixer`

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Key Design Decisions

### Why `'use client'` on every component?
All section components use browser APIs (IntersectionObserver, scroll events, refs) or React hooks, so they must be client components in Next.js 14's App Router.

### CSS Strategy
- **`globals.css`** holds all design tokens (CSS custom properties like `--color-accent`), keyframe animations, and complex CSS classes that would be awkward in Tailwind (e.g., `.feature-card`, `.pain-item`, `.testimonial-card`).
- **Inline styles** are used for component-level one-off values.
- **Tailwind** is available for utility classes but most styles use CSS variables for theme consistency.

### Animations
- **Framer Motion**: Used for mount/unmount transitions (banner, hero content, mockup).
- **CSS Keyframes**: Used for continuous/looping animations (aurora, float, marquee, particles, barGrow).
- **IntersectionObserver**: Used for scroll-triggered class additions (`.visible`) on feature cards, pricing cards, and pain/solution items.

### Fonts
Google Fonts are loaded via `@import` in `globals.css`:
- **Syne** — display/headings
- **DM Sans** — body text
- **DM Mono** — numbers/code

## Using React Three Fiber

The package is installed. To add a 3D canvas, create a new component:

```tsx
'use client'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

export default function ThreeScene() {
  return (
    <Canvas>
      <ambientLight />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="hotpink" />
      </mesh>
      <OrbitControls />
    </Canvas>
  )
}
```

Then import it anywhere in your page or hero section.

## Customization

- **Colors**: Edit CSS variables in `globals.css` `:root` block
- **Content**: All text/data lives in the component files as typed arrays — easy to find and swap
- **Sections**: Each section is a standalone component — add, remove, or reorder in `app/page.tsx`
