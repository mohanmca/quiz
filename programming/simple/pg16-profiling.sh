#!/usr/bin/env bash
set -euo pipefail

# Minimal wrapper to run the profiling SQL with psql.
# Usage:
#   HOST=localhost DB=mydb USER=myuser \
#   ./programming/simple/pg16-profiling.sh "SELECT count(*) FROM your_table WHERE created_at > now() - interval '7 days'" 5

QUERY=${1:-"SELECT 1"}
RUNS=${2:-5}

PSQL_OPTS=(
  -X -q -v ON_ERROR_STOP=1
  -h "${HOST:-localhost}" -U "${USER:-$USER}" -d "${DB:-postgres}"
)

psql "${PSQL_OPTS[@]}" \
  -v query="$QUERY" \
  -v runs="$RUNS" \
  -f programming/simple/pg16-profiling.sql

