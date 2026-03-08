# Session Notes - 2026-03-08 - Flink Workshop Quiz Migration

## What Changed
- Removed legacy duplicate exam source `programming/articles/quiz.json` after migrating workshop to `programming/data/json/data-engineering/flink-workshop-questions.json`.
- Moved the Flink external exam bank from `programming/data/json/flink_quiz.json` to:
  - `programming/data/json/data-engineering/flink-workshop-questions.json`
- Migrated external exam question schema from index-based answers to standard quiz style:
  - `options` -> `choices`
  - `answer` -> `correctAnswer` (string value)
- Updated `programming/articles/flink_workshop.html` to load the new JSON path and validate external quiz data with `choices` + `correctAnswer`.
- Updated exam scoring and answer handling to compute correctness via `correctAnswer` mapping rather than hardcoded `answer` indices.
- Updated exam loader/error UI text to reference the configured `QUIZ_DATA_URL` instead of `quiz.json`.
- Added explicit `Retake Exam` behavior and attempt-aware option shuffling that changes order across retakes.

## Why
- External Flink exam data had all questions with `answer: 0`, which created a predictable answer-position pattern when rendered.
- The workshop needed schema parity with other quiz banks that use `correctAnswer` semantics.

## Validation
- JSON validation passed:
  - `python3 -m json.tool programming/data/json/data-engineering/flink-workshop-questions.json`
- Schema sanity check passed for all 200 questions:
  - every question has valid `choices`
  - `correctAnswer` exists in the `choices` list
- Browser smoke test (`http://localhost:8000/articles/flink_workshop.html`) confirmed:
  - external exam loads from new JSON path
  - correct option indices vary across questions (not fixed to one index)
  - retake changes option ordering for the same question

## Tricky Areas / Lessons
- Mixing index-based and value-based answer schemas in one workshop requires clear helper functions (`getExternalChoices`, `getExternalCorrectIndex`) to avoid subtle scoring drift.
- Deterministic per-question/per-attempt shuffling is easier to reason about than ad-hoc random balancing and prevents repeating the same order across retakes.
