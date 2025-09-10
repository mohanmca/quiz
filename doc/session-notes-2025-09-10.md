# Session Notes — 2025-09-10

- Goal: Add a new Postgres quiz covering psql fluency, EXPLAIN plans, index before/after comparisons, performance tuning, scripting/automation, error handling, and planner internals.
- Changes made:
  - Added questions JSON: `programming/data/json/postgres/postgres-psql-explain-tuning-automation-questions.json` (40 single-choice questions).
  - Registered quiz in `programming/data/json/surveys.json` with id `postgres-psql-explain-tuning-automation`.
  - Added article: `programming/articles/postgres-psql-explain-tuning-automation.html` with Python snippets (EXPLAIN JSON parsing, timing harness, migration safety patterns).
- Tricky bits:
  - Ensuring quiz items remain single-answer because UI renders radios (no multi-select); kept `correctAnswer` to a single value to match UI.
  - `apply_patch` quoting: used the direct two-argument invocation to avoid shell heredoc quoting issues with parentheses/quotes inside JSON/HTML.
  - Article syntax-highlighting: reused existing lightweight Python highlighter used in other articles for consistency.
- Verification steps to run locally:
  - `cd programming && python3 -m http.server 8000` then open `http://localhost:8000`.
  - Confirm the new quiz card appears and "Read Article" opens the new page.
  - Start the quiz and ensure all questions render and score.

