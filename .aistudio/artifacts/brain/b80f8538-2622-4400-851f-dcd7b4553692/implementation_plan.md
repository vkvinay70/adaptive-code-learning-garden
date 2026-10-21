# NaomiLearn — Python & AI Academy

NaomiLearn transforms the existing repository into a full-featured, interactive Python & AI educational platform featuring a public marketing homepage, a three-tier curriculum, an in-browser WebAssembly Python Code Lab, adaptive quizzes, real-time progress analytics, and a server-side Gemini AI Tutor Agent.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and design decisions incorporate your confirmed preferences from our clarification step:

- **Confirmed Decision 1 — Real In-Browser Python Execution (Pyodide)**: The Code Lab executes real Python 3 code directly in the browser via the Pyodide WebAssembly runtime, capturing standard output, standard error, and readable tracebacks while validating student solutions against exercise test assertions.
- **Confirmed Decision 2 — Light Lavender & White Canvas with Deep Navy & Violet Accents**: The interface uses a luminous lavender-tinted white canvas (`#F8F7FF` and `#FFFFFF`), deep navy ink (`#0F172A` and `#1E1B4B`), crisp lavender hairline borders (`#E4E0F5`), and focused electric violet (`#6D28D9`) and warm gold (`#D97706`) accents, paired with high-contrast dark navy code editors (`#0F172A`).
- **Confirmed Decision 3 — Instant Guest Access + Optional Supabase Sync**: All learning routes, Code Lab exercises, quizzes, and the AI Tutor work immediately with local persistence (`localStorage`) so learners never hit an unexpected login wall or environment crash, while seamlessly syncing with Supabase Auth and user metadata when credentials are configured.

---

## 1. Overview & Core Concept

- **What It Does**: Provides an end-to-end Python learning environment where students discover courses on a welcoming homepage, study structured Beginner, Intermediate, and Advanced modules, write and run real Python code in an interactive Code Lab, test their mastery through topic quizzes, track their daily learning streak and accuracy, and get personalized coaching from an AI Tutor Agent.
- **Target Audience / Persona**: Aspiring programmers, students, and self-paced learners from complete beginners writing their first `print()` statement to advanced learners mastering decorators, async Python, and application architecture.
- **Key Value**: Bridges passive reading and active coding by combining structured curriculum lessons, instant in-browser Python execution, and Socratic AI tutoring that teaches step by step rather than just handing out answers.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Public Homepage (`/` → `/learn` or `/dashboard`)**:
   - Visitors land on a clean, uncluttered marketing homepage featuring a 3-zone top navigation bar, the hero heading _"Learn Python. Build your future."_, supporting copy, **Start Learning** and **Explore Courses** CTAs, and the uploaded NaomiLearn hero illustration displayed at its natural aspect ratio without overlapping badges or text clutter.
   - Below the fold, learners explore the three learning-level pathways (Beginner, Intermediate, Advanced), interactive platform capabilities, a step-by-step visual guide on how the AI Tutor coaches students, and a final conversion section.
2. **Structured Curriculum (`/learn`)**:
   - Learners filter by **Beginner**, **Intermediate**, or **Advanced** (8 comprehensive modules per level, 24 total modules).
   - Selecting a module opens a rich lesson drawer/view with learning objectives, clear explanations, runnable code snippets (which can be opened directly in the Code Lab), a hands-on checkpoint exercise, and explicit completion tracking triggered only when the learner completes the lesson checkpoint.
3. **Interactive Code Lab (`/practice`)**:
   - Two-zone split sandbox layout: left/top interactive code editor and output console powered by Pyodide; right/bottom exercise brief, requirements checklist, progressive hints, and AI Code Review trigger.
   - Learners edit Python code, click **Run Code** to execute it in WebAssembly, inspect stdout/stderr, verify their code against exercise requirements, reset starter code, or advance to the next exercise.
4. **Adaptive Quizzes (`/quizzes`)**:
   - Learners choose a difficulty level (Beginner, Intermediate, Advanced) and topic module, then take either curated topic quizzes or fresh AI-generated quizzes.
   - Each question provides immediate feedback, clear explanations, score calculation, a review of missed questions, retry controls, and automatic recording to the student's quiz history and module accuracy stats.
5. **AI Tutor Agent (`/tutor`)**:
   - Students chat with the NaomiLearn AI Tutor in natural language, switch difficulty depth (Beginner, Intermediate, Advanced) and active topic, and trigger quick learning actions (_Explain line by line_, _Give me a hint_, _Simpler explanation_, _Generate practice question_, _Review my code_, _Recommend next step_).
   - The tutor uses server-side Gemini tool declarations to inspect curriculum modules, check student progress summaries, generate tailored exercises, and provide Socratic guidance.
6. **Dashboard, Progress & Settings (`/dashboard`, `/progress`, `/settings`)**:
   - Honest, real-time metrics driven by actual student activity: daily question goal, consecutive day streak, tracked study time, completed lessons, module accuracy bars, weekly activity chart, and recent quiz attempts log—with helpful empty states for new learners.

### Visual Identity & Theme

- **Aesthetic Direction**: Modern EdTech editorial clarity meets friendly interactive studio—crisp, approachable, and structured.
- **Color Palette & 60-30-10 Discipline**:
  - **60% Dominant Canvas**: Soft lavender-tinted alabaster (`--background: #F8F7FF`) and pure white cards (`--card: #FFFFFF`).
  - **30% Structural Surfaces & Typography**: Deep midnight navy typography (`--foreground: #0F172A`), soft lavender-slate secondary panels (`--secondary: #F1EFFB`), subtle hairline borders (`--border: #E2DDF5`), and deep navy code blocks (`--code: #0F172A`).
  - **10% Accent Budget**: Electric royal violet (`--primary: #6D28D9`) for primary actions and active states, paired with warm amber gold (`--gold: #D97706`) for streaks/highlights and semantic emerald (`--success: #059669`) and coral red (`--destructive: #DC2626`) accompanied by explicit text and icon labels.
- **Typography & Hierarchy**:
  - **Display & Headings**: `Plus Jakarta Sans` (SemiBold/Bold, tight tracking, `text-wrap: balance` on headlines).
  - **Body Prose**: `Plus Jakarta Sans` (Regular/Medium, comfortable `1.6` line height).
  - **Code & Tabular Metrics**: `JetBrains Mono` with `tabular-nums` for all code editors, terminal output, scores, streaks, and percentages.
- **Interactive Feedback & Motion**:
  - Fast, responsive micro-interactions ($\le 200\text{ms}$) on buttons, tabs, and quiz options.
  - Clear loading skeletons and spinners for Pyodide initialization and Gemini AI responses, plus explicit error banners with one-click retry buttons.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dedicated `/dashboard` Route + Public `/` Homepage**
  - _Chosen Approach_: Keep `/` as the public NaomiLearn landing page (matching the prompt's homepage specification and top navigation bar) while providing `/dashboard` for the student workspace, and smoothly adapting the shell layout so public pages use the clean top header while workspace routes include the responsive sidebar.
  - _Why_: Ensures visitors and evaluators immediately see the requested public landing page with the hero artwork at `/`, while giving learners a dedicated, distraction-free workspace at `/dashboard`, `/learn`, `/practice`, `/quizzes`, `/tutor`, `/progress`, and `/settings`.
- **Decision 2: Safe Supabase Client Initialization**
  - _Chosen Approach_: Wrap Supabase client initialization with a configuration check so missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` never crashes module evaluation, and sync user profile/progress to both `localStorage` and Supabase user metadata when signed in.
  - _Why_: Previously, importing `src/lib/supabase.ts` without environment variables threw a top-level error that broke authentication routes. A resilient client guarantees all routes load reliably in any environment while preserving real Supabase Auth when configured.
- **Decision 3: Server-Side `@google/genai` SDK with Agent Tools**
  - _Chosen Approach_: Upgrade `/api/gemini` to use the official `@google/genai` SDK (`gemini-3.8-flash` default, configurable via `GEMINI_MODEL` env var) with structured function calling (`FunctionDeclaration`) for curriculum lookup, progress analysis, practice generation, and code review.
  - _Why_: Keeps `GEMINI_API_KEY` strictly on the server, adheres to the modern SDK standards, and powers a genuine AI Tutor Agent grounded in the student's actual curriculum and progress data.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NaomiLearn Application Shell                         │
│  ┌───────────────────────────────────┐  ┌────────────────────────────────┐  │
│  │ Public Layout (/, /login, /signup)│  │ Workspace Layout (/dashboard,  │  │
│  │ • 3-Zone Top Bar                  │  │ /learn, /practice, /quizzes,   │  │
│  │ • Hero w/ Uploaded Artwork        │  │ /tutor, /progress, /settings)  │  │
│  │ • Level Cards & Feature Sections  │  │ • Responsive AppSidebar        │  │
│  └─────────────────┬─────────────────┘  └────────────────┬───────────────┘  │
└────────────────────┼─────────────────────────────────────┼──────────────────┘
                     │                                     │
                     ▼                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                   Core Interactive Learning Engines                         │
│                                                                             │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌───────────────────┐  │
│  │ 3-Level Curriculum   │  │ Pyodide Code Lab     │  │ Quiz & Assessment │  │
│  │ • Beginner (8 mods)  │  │ • WebAssembly Python │  │ • Topic & Level   │  │
│  │ • Intermed. (8 mods) │  │ • Stdout/Stderr trap │  │ • Instant Grading │  │
│  │ • Advanced (8 mods)  │  │ • Test Case Runner   │  │ • Missed Review   │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  └─────────┬─────────┘  │
│             └─────────────────────────┼────────────────────────┘            │
│                                       ▼                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                 Student Progress & Auth Store                         │  │
│  │ • Streaks, Daily Goal, Study Timer, Completed Lessons, Quiz History   │  │
│  │ • LocalStorage Persistence + Optional Supabase Auth & Metadata Sync   │  │
│  └────────────────────────────────────┬──────────────────────────────────┘  │
└───────────────────────────────────────┼─────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                Server-Side AI Tutor Route (POST /api/gemini)                │
│  • Official @google/genai SDK (process.env.GEMINI_API_KEY)                  │
│  • Configurable Model (process.env.GEMINI_MODEL || "gemini-3.8-flash")      │
│  • Agent Tools: getCurriculumModule, recommendNextLesson,                   │
│    generatePracticeExercise, reviewStudentCode, summarizeProgress           │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Model & State

- **Curriculum Model**: Three levels (`Beginner`, `Intermediate`, `Advanced`), each containing 8 modules with `id`, `title`, `level`, `duration`, `objectives`, `explanation`, `exampleCode`, `checkpointPrompt`, `starterCode`, `expectedOutput`, and `hints`.
- **Progress Store**:
  - `stats`: Per-module `{ attempted, correct }` counters.
  - `completedLessons`: Array of completed lesson IDs with completion timestamps.
  - `quizHistory`: Array of completed quiz attempts (`id`, `date`, `module`, `level`, `score`, `total`).
  - `studyMinutes`: Daily and cumulative active study minutes tracked while the learner engages with lessons, Code Lab, quizzes, or the AI Tutor.
  - `dailyActivity` & `activeDays`: Date-keyed activity counters powering the 7-day chart, daily goal bar, and streak counter.

### Interactive Component & State Mapping

- **Homepage (`/`)**: Level cards link directly to `/learn?level=Beginner|Intermediate|Advanced`; primary CTAs navigate to `/learn` or `/dashboard`; interactive preview tabs showcase real curriculum topics.
- **Curriculum (`/learn`)**: Level filter tabs switch between the 24 modules; clicking a module opens its full interactive lesson; running or completing the lesson checkpoint records lesson completion and updates progress indicators.
- **Code Lab (`/practice`)**: Loads Pyodide in the browser on demand; **Run Code** executes Python and captures `sys.stdout`/`sys.stderr`; **Check Solution** validates output/AST conditions against the active exercise and marks the exercise solved; **Ask AI Tutor for Review** sends the code and output to `/tutor` or inline review.
- **Quizzes (`/quizzes`)**: Supports both instant curated quizzes (so quizzes work offline or without waiting) and **Generate Fresh AI Quiz** via Gemini; records every completed quiz into `quizHistory` and `stats`.
- **AI Tutor (`/tutor`)**: Sends conversation history, student level, active module, and current progress summary to `/api/gemini`, executing server-side agent tool calls when helpful and displaying structured tool badges alongside markdown responses.
