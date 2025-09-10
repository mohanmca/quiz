# Session Notes — 2025-09-10 — Merge Postgres Articles & Quizzes

## What changed
- Consolidated under: "PostgreSQL PSQL, EXPLAIN & Automation".
  - Kept article: `programming/articles/postgres-psql-explain-tuning-automation.html` and enriched its EXPLAIN section (already comprehensive) and clarified internals consolidation in section 7.
  - Removed the separate survey entry for "PostgreSQL Query Planning Internals" from `programming/data/json/surveys.json` to avoid duplication.
- Merged quiz content by appending unique internals topics to:
  - `programming/data/json/postgres/postgres-psql-explain-tuning-automation-questions.json` (added JIT, parallelism, cost model, join set, work_mem for hashing). Now spans both original scopes.

## Rationale
- One canonical Postgres performance/tuning path reduces overlap and confusion; learners get psql, EXPLAIN/ANALYZE practice, automation, and planner internals in a single flow.

## Verification
- Home page no longer lists the duplicate “Query Planning Internals” quiz; the PSQL/EXPLAIN quiz remains with the consolidated questions.
- Article covers EXPLAIN options, examples, planner internals, stats, and automation.

## Next
- If desired, redirect `postgres-query-planning-internals.html` to the consolidated article, or leave for manual browsing history.

