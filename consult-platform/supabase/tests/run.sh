#!/usr/bin/env bash
# Applies the migrations and seed to a throwaway local database and runs the
# access-rule tests. Requires a local Postgres you can administer.
#   PGUSER=postgres ./supabase/tests/run.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB="${TEST_DB:-consult_platform_test}"
dropdb --if-exists "$DB"
createdb "$DB"
psql -q -v ON_ERROR_STOP=1 -d "$DB" -c 'create extension if not exists pgcrypto' -f tests/00_supabase_stub.sql
psql -q -v ON_ERROR_STOP=1 -d "$DB" -c 'drop extension pgcrypto'
for f in migrations/*.sql; do psql -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f"; done
psql -q -v ON_ERROR_STOP=1 -d "$DB" -f seed.sql
psql -v ON_ERROR_STOP=1 -d "$DB" -f tests/01_access_rules.sql
