-- PG16+ Profiling Helper (psql script)
-- Usage:
--   psql -X -v ON_ERROR_STOP=1 \
--        -v query="SELECT count(*) FROM your_table WHERE ..." \
--        -v runs=5 \
--        -f programming/simple/pg16-profiling.sql

\pset pager off
\timing on
\set QUIET 1

-- Defaults (can be overridden via -v)
\ifndef query
  \set query 'SELECT 1'
\endif
\ifndef runs
  \set runs 5
\endif

\echo
\echo '== Resetting pg_stat_statements (if available) =='
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'pg_stat_statements_reset') THEN
    PERFORM pg_stat_statements_reset();
  END IF;
END $$;

\echo
\echo '== Preparing statement =='
DEALLOCATE ALL;
PREPARE prof_stmt AS :query;

\echo
\echo '== Warming up and executing query :' :runs ' times =='
DO $$
DECLARE i int;
BEGIN
  FOR i IN 1..:runs LOOP
    EXECUTE 'EXECUTE prof_stmt';
  END LOOP;
END$$;

\echo
\echo '== EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) for representative run =='
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) EXECUTE prof_stmt;

\echo
\echo '== Top queries by total_time from pg_stat_statements (if available) =='
\t on
WITH s AS (
  SELECT queryid, calls, total_time, mean_time, rows, query
  FROM pg_stat_statements
  ORDER BY total_time DESC
  LIMIT 20
)
SELECT queryid, calls, round(total_time)::int AS total_ms,
       round(mean_time,2) AS mean_ms, rows
FROM s;
\t off

\echo
\echo '== pg_stat_io (PG16) summary by highest read_time =='
\t on
SELECT backend_type, context, io_object, io_context,
       reads, round(read_time)::int AS read_ms,
       writes, round(write_time)::int AS write_ms
FROM pg_stat_io
ORDER BY read_time DESC
LIMIT 20;
\t off

\echo
\echo '== Done =='

