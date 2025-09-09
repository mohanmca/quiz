# Session Notes — 2025-09-09 — In‑Quiz Scenarios Link

## What changed
- In `programming/app.js`, added a "See Scenarios" ghost button to the in‑quiz footer (left side), visible when `articleFile` exists for the survey.

## Why
- Gives learners quick access to the scenarios section for applied guidance without leaving the quiz flow entirely.

## Details
- Implemented inside `renderQuiz()` next to Back and Stop buttons.
- Navigates to `<articleFile>#scenarios`.

