# Session Notes — 2025-09-09 — Result Deep Link to Scenarios

## What changed
- Updated `programming/app.js` result screen to include a "See Scenarios & Model Answers" button when a survey has an `articleFile`. It deep-links to `#scenarios` on the article.

## Why
- Quickly guides learners from quiz outcomes to applied examples and model answers, reinforcing learning.

## Details
- Button added in `renderResult()` next to "Back to Quizzes" and "Retry Quiz".
- It appends `#scenarios` to `articleFile`. If the target lacks that anchor, navigation still lands on the article page gracefully.

