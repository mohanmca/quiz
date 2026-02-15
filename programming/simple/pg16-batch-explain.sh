#!/usr/bin/env bash
set -euo pipefail

# PG16+ Batch EXPLAIN JSONL emitter
#
# Usage:
#   HOST=localhost DB=mydb USER=myuser \
#   ./programming/simple/pg16-batch-explain.sh path/to/queries.sql out/runs 1
#
# Notes:
# - One SQL statement per line in queries.sql (comments starting with -- or # and blank lines are ignored).
# - Creates a timestamped run directory under the given OUT base directory for later review.
# - Emits:
#     plans.jsonl          (all plans, one JSON array per line, blank line between entries)
#     plan_001.json ...    (per-query EXPLAIN JSON output)
#     queries.txt          (the queries executed, numbered)
#     pg_stat_statements_top.txt (top 20 by total_time if extension available)
#     pg_stat_io_top.txt   (PG16 I/O summary by read_time)

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 QUERIES_FILE OUT_BASE_DIR [RUNS]" >&2
  exit 1
fi

QUERIES_FILE=$1
OUT_BASE=$2
RUNS=${3:-1}

if [[ ! -f "$QUERIES_FILE" ]]; then
  echo "Queries file not found: $QUERIES_FILE" >&2
  exit 1
fi

TS=$(date +%Y%m%d-%H%M%S)
RUN_DIR="$OUT_BASE/run-$TS"
mkdir -p "$RUN_DIR"

echo "Run directory: $RUN_DIR"

PSQL=(psql -X -q -A -t -v ON_ERROR_STOP=1 \
  -h "${HOST:-localhost}" -U "${USER:-$USER}" -d "${DB:-postgres}")

# Reset pg_stat_statements if present
"${PSQL[@]}" -c "DO $$ BEGIN IF EXISTS (SELECT 1 FROM pg_proc WHERE proname='pg_stat_statements_reset') THEN PERFORM pg_stat_statements_reset(); END IF; END $$;" >/dev/null || true

# Prepare output files
META="$RUN_DIR/meta.txt"
{
  echo "timestamp=$TS"
  echo "host=${HOST:-localhost}"
  echo "db=${DB:-postgres}"
  echo "user=${USER:-$USER}"
  echo "runs=$RUNS"
} > "$META"

PLANS_JSONL="$RUN_DIR/plans.jsonl"
QUERIES_TXT="$RUN_DIR/queries.txt"
>"$PLANS_JSONL"
>"$QUERIES_TXT"

idx=0
while IFS= read -r line || [[ -n "$line" ]]; do
  # Skip blanks and comments
  [[ -z "$line" ]] && continue
  [[ "$line" =~ ^\s*-- ]] && continue
  [[ "$line" =~ ^\s*# ]] && continue

  idx=$((idx+1))
  printf "%03d %s\n" "$idx" "$line" >> "$QUERIES_TXT"

  # Repeat query RUNS times and record last plan as representative
  tmp_sql=$(mktemp)
  for i in $(seq 1 "$RUNS"); do
    printf "EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) %s;\n" "$line" > "$tmp_sql"
    "${PSQL[@]}" -f "$tmp_sql" > "$RUN_DIR/plan_$(printf '%03d' "$idx").json"
  done
  rm -f "$tmp_sql"

  # Append to JSONL (plan array per entry) and separator
  cat "$RUN_DIR/plan_$(printf '%03d' "$idx").json" >> "$PLANS_JSONL"
  echo >> "$PLANS_JSONL"
done < "$QUERIES_FILE"

# Stats snapshots
"${PSQL[@]}" -c "\timing off; COPY (SELECT queryid, calls, total_time, mean_time, rows FROM pg_stat_statements ORDER BY total_time DESC LIMIT 20) TO STDOUT WITH CSV HEADER;" \
  > "$RUN_DIR/pg_stat_statements_top.txt" || true

"${PSQL[@]}" -c "\timing off; COPY (SELECT backend_type, context, io_object, io_context, reads, read_time, writes, write_time FROM pg_stat_io ORDER BY read_time DESC LIMIT 20) TO STDOUT WITH CSV HEADER;" \
  > "$RUN_DIR/pg_stat_io_top.txt" || true

echo "Done. Review outputs under: $RUN_DIR"

