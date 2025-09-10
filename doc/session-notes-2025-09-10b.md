# Session Notes — 2025-09-10 (multi-sql addition)

- Added a new section to the article `programming/articles/postgres-psql-explain-tuning-automation.html` titled “8. Multi-SQL Analysis”.
- Content covers:
  - Prioritizing via pg_stat_statements (queryid-based aggregation)
  - Batch EXPLAIN ANALYZE JSON collection (plans.jsonl)
  - Parsing/ranking hot spots by Actual Total Time and buffer reads
  - Stabilization tips (warmups, fixed params, medians) and template-oriented indexing
- Rationale: Provide practical tips and scripts for analyzing and optimizing multiple queries at once.

