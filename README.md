# Adaptive Code Learning Garden

Build a modern, interactive web application for an "AI Python Tutor: Personalized Learning Assistant" using React, Tailwind CSS, and Lucide icons.

Core Application Requirements:

1. Header / Setup Bar:

   - Student Name input.

   - Module Selector: "Variables & Data Types", "Conditionals (if/else)", "Loops", "Functions".

   - Difficulty Level: "Beginner", "Intermediate", "Advanced".

   - API Key Settings: A modal or header input allowing the user to provide a Google Gemini API Key.

2. Three Learning Modes (Tabs):

   - "Learn Mode": Explains concepts clearly using everyday analogies and concise code blocks.

   - "Practice Mode": Generates interactive mini-problems. Evaluates user code, provides hints on mistakes, and guides them step-by-step rather than giving immediate solutions.

   - "Quiz Mode": Dynamically generates 3 sequential questions. Evaluates submitted answers, tracks score, and displays correct/incorrect breakdowns.

3. Progress & Analytics Sidebar:

   - Questions Attempted counter.

   - Current Score & Accuracy %.

   - "Strong Areas" list and "Needs Practice" list.

   - "Recommended Next Lesson" based on performance.

4. System Prompt Configuration:

   - System Prompt: "You are PyTutor, a patient, adaptive AI programming tutor for beginners. In Learn Mode, teach concepts simply with analogies and short code snippets. In Practice Mode, provide challenges and offer helpful hints when errors occur before revealing answers. In Quiz Mode, assess answers and deliver constructive feedback."

   - Include quick-reply buttons below the chat input: "Give me a hint", "Explain simpler", "Next topic".

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://adaptive-code-learning-garden.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8a2e5ebf-3fca-435d-b249-1197d53af20c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
