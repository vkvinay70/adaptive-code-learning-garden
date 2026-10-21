# NaomiLearn — Final Premium Redesign & Functionality Implementation Plan

## 1. Visual Identity & Design System
- **Python-Inspired Palette**:
  - **Primary Python Blue**: `#306998` (hover `#234E73`, subtle surface tint `#EEF5FB`).
  - **Secondary Golden Accent**: `#FFD43B` / `#D97706` used selectively for key highlights and focus indicators.
  - **Clean Canvas & Surfaces**: `#F8FAFC` page canvas, `#FFFFFF` elevated cards, `#E2E8F0` hairline borders, `#0F172A` primary typography, and `#475569` supporting body copy.
- **Typography & Hierarchy**:
  - Display headings in `Plus Jakarta Sans` (`clamp(2.25rem, 4vw, 3.5rem)` with balanced wrapping), body prose in `DM Sans`, and Python code snippets/metrics in `JetBrains Mono` with `tabular-nums`.
  - Clean unboxed metadata using typographic separators (`·`) rather than cluttered pill badges.

## 2. Unified Geometric SVG Logo (`NaomiLearnLogo`)
- Create a dedicated, resolution-independent logo component featuring a crisp geometric Python/code emblem in `#306998` with a restrained `#FFD43B` accent node, paired with a balanced `"NaomiLearn"` wordmark.
- Replace raster logo instances across the public navigation bar, homepage footer, unified Google Sign-In screen (`/login`), and authenticated application shell (`AppShell`) so the brand mark renders sharply at every viewport width.

## 3. Responsive Hero Section & Artwork Integration
- **Exact Hero Copy**:
  - Headline: *“Learn Python. Build your future.”*
  - Supporting copy: *“Learn Python with your personal AI tutor.”*
- **Natural Visual Framing on All Devices**:
  - Remove the heavy dark terminal mockup box (`bg-[#0F172A]` and window chrome) that made the hero artwork look like an isolated dark poster.
  - Present the hero visual (`/assets/aistudio/NaomiLearn__Neon_Python_AI_Academy_6441544b.png`) inside a light, refined architectural showcase frame with a soft Python-blue/gold ambient radial glow, subtle hairline border, and zero overlaid HTML text.
  - **Desktop (`1280px+`)**: Balanced 12-column grid (6 columns copy/actions, 6 columns visual showcase) vertically centered with proportional aspect ratio (`aspect-[16/10]`) and smooth entrance motion.
  - **Tablet (`768px–1023px`) & Mobile (`375px–767px`)**: Stacked cleanly below the hero copy, always visible (never hidden on mobile), responsive width (`w-full max-w-xl mx-auto`), constrained max-height, and zero horizontal overflow.

## 4. Streamlined CTA Hierarchy & Navigation
- **Eliminate Repetitive `Get Started` Buttons**:
  - Keep **one** `Get Started` button in the top navigation bar, **one** primary `Get Started` CTA in the hero section, and **one** in the closing conversion banner.
  - Replace repeated `Get Started` buttons inside feature cards and course track cards with descriptive, outcome-oriented links (`Explore Beginner Track`, `Explore Intermediate Track`, `Explore Advanced Track`, `Open Code Lab`, `Take a Skill Quiz`) pointing to their respective routes (`/learn`, `/practice`, `/quizzes`, `/tutor`).
- **Protected Route Flow**:
  - Unauthenticated clicks on any learning track or feature route smoothly redirect to `/login?redirect=<target>` and return the learner to their requested destination after Google Sign-In.

## 5. Public-Ready Floating Python AI Helper
- **No Login Wall for General Questions**:
  - Allow unauthenticated visitors on the homepage to open the Floating Python AI Helper and ask questions immediately without forcing Google Sign-In first.
  - Support questions about NaomiLearn, the 24-module curriculum, learning tracks, and Python concepts/syntax/debugging via `/api/gemini` with built-in curriculum knowledge fallbacks if the server API key is unavailable.
- **Contextual Sign-In Prompt Only for Personal Data**:
  - If a visitor asks about their personal progress, quiz scores, or saved cloud history—or wants to sync their chat across devices—display a polite inline prompt with a direct link to sign in with Google (`/login`).

## 6. Motion, Polish & Verification
- Add subtle CSS scroll-reveal transitions, tactile card lift-on-hover (`-translate-y-1` with smooth shadow elevation), and full `prefers-reduced-motion` support.
- Update and run the automated test suite (`vitest`), linter (`lint_applet`), and production build (`compile_applet`) to verify responsive rendering, public AI assistant interaction, and authentication guards.
