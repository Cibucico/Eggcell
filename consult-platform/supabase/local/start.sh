#!/usr/bin/env bash
# Runs a local, free, Docker-free stand-in for a Supabase project:
# your own Postgres + Supabase's open-source sign-in service (GoTrue) and
# data API (PostgREST), installed with Nix.
#
# Needs: PostgreSQL 15+ running locally (and rights to administer it), Nix, Node.
#   ./supabase/local/start.sh          create the database if needed and start the services
#   ./supabase/local/start.sh --reset  drop and recreate the database first
#   LOCAL_AUTOCONFIRM=false ./supabase/local/start.sh
#                                      require new users to confirm their email;
#                                      the emails are saved in .local-supabase/mail
#
# It writes .env.local so that `npm run dev` uses the local stack.
set -euo pipefail
cd "$(dirname "$0")/../.."

DB="${LOCAL_DB:-consult_local}"
BRAND="${NEXT_PUBLIC_BRAND:-inkqubo}"
SEED_FILE="supabase/seed.$BRAND.sql"
[[ -f "$SEED_FILE" ]] || SEED_FILE="supabase/seed.sql"
RUN_DIR="${LOCAL_RUN_DIR:-.local-supabase}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}"
# psql is run as the postgres superuser. Override if yours differs.
PSQL_SUPER="${PSQL_SUPER:-sudo -u postgres psql}"
NIX="nix --extra-experimental-features nix-command --extra-experimental-features flakes"
mkdir -p "$RUN_DIR"

if [[ "${1:-}" == "--reset" ]]; then
  pkill -f "$RUN_DIR/bin-auth" 2>/dev/null || true
  pkill -f "$RUN_DIR/bin-postgrest" 2>/dev/null || true
  $PSQL_SUPER -q -c "drop database if exists $DB with (force)"
fi

if ! $PSQL_SUPER -tAc "select 1 from pg_database where datname = '$DB'" | grep -q 1; then
  echo "Creating database $DB"
  $PSQL_SUPER -q -c "create database $DB"
  FRESH=1
fi
$PSQL_SUPER -q -v ON_ERROR_STOP=1 -d "$DB" -f supabase/local/setup.sql

# A signing secret shared by the services, and the two API keys made from it.
[[ -f "$RUN_DIR/id-hash-secret" ]] || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" > "$RUN_DIR/id-hash-secret"
[[ -f "$RUN_DIR/jwt-secret" ]] || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))" > "$RUN_DIR/jwt-secret"
JWT_SECRET="$(cat "$RUN_DIR/jwt-secret")"
make_key() {
  node -e "
    const c = require('crypto');
    const b = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const body = b({ alg: 'HS256', typ: 'JWT' }) + '.' + b({ role: '$1', iss: 'supabase-local', iat: 1700000000, exp: 4102444800 });
    console.log(body + '.' + c.createHmac('sha256', '$JWT_SECRET').update(body).digest('base64url'));
  "
}
ANON_KEY="$(make_key anon)"
SERVICE_KEY="$(make_key service_role)"

AUTH_BIN="$($NIX build --no-link --print-out-paths nixpkgs#gotrue-supabase)/bin/auth"
REST_BIN="$($NIX build --no-link --print-out-paths nixpkgs#postgrest)/bin/postgrest"
ln -sf "$AUTH_BIN" "$RUN_DIR/bin-auth"
ln -sf "$REST_BIN" "$RUN_DIR/bin-postgrest"

AUTH_ENV=(
  GOTRUE_DB_DRIVER=postgres
  "DATABASE_URL=postgres://supabase_auth_admin:local-dev-only@127.0.0.1:5432/$DB?sslmode=disable"
  DB_NAMESPACE=auth
  GOTRUE_API_HOST=127.0.0.1 PORT=9999
  "API_EXTERNAL_URL=http://127.0.0.1:54321/auth/v1"
  "GOTRUE_SITE_URL=$SITE_URL"
  "GOTRUE_URI_ALLOW_LIST=$SITE_URL/**"
  "GOTRUE_JWT_SECRET=$JWT_SECRET" GOTRUE_JWT_EXP=3600
  GOTRUE_JWT_AUD=authenticated GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated
  GOTRUE_JWT_ADMIN_ROLES=service_role
  GOTRUE_DISABLE_SIGNUP=false GOTRUE_EXTERNAL_EMAIL_ENABLED=true
  "GOTRUE_MAILER_AUTOCONFIRM=${LOCAL_AUTOCONFIRM:-true}"
  GOTRUE_PASSWORD_MIN_LENGTH=10
  # Emails go to the local mail sink and are saved under $RUN_DIR/mail.
  GOTRUE_SMTP_HOST=127.0.0.1 GOTRUE_SMTP_PORT=2525
  GOTRUE_SMTP_ADMIN_EMAIL=no-reply@example.test
  GOTRUE_SMTP_MAX_FREQUENCY=1s
  GOTRUE_RATE_LIMIT_EMAIL_SENT=1000
  "GOTRUE_MAILER_URLPATHS_CONFIRMATION=/auth/v1/verify"
  "GOTRUE_MAILER_URLPATHS_RECOVERY=/auth/v1/verify"
)

pkill -f "supabase/local/mail-sink.mjs" 2>/dev/null || true
MAIL_DIR="$RUN_DIR/mail" nohup node supabase/local/mail-sink.mjs > "$RUN_DIR/mail.log" 2>&1 &

echo "Preparing the sign-in service's tables"
env "${AUTH_ENV[@]}" "$RUN_DIR/bin-auth" migrate > "$RUN_DIR/auth-migrate.log" 2>&1 \
  || { echo "Could not prepare the sign-in tables; see $RUN_DIR/auth-migrate.log"; exit 1; }

echo "Starting the sign-in service"
pkill -f "$RUN_DIR/bin-auth" 2>/dev/null || true
env "${AUTH_ENV[@]}" nohup "$RUN_DIR/bin-auth" serve > "$RUN_DIR/auth.log" 2>&1 &

for _ in $(seq 1 40); do
  curl -sf http://127.0.0.1:9999/health > /dev/null && break
  sleep 0.5
done
curl -sf http://127.0.0.1:9999/health > /dev/null || { echo "Sign-in service failed to start; see $RUN_DIR/auth.log"; exit 1; }

if [[ "${FRESH:-}" == "1" ]]; then
  echo "Applying the schema and sample content"
  for f in supabase/migrations/*.sql; do $PSQL_SUPER -q -v ON_ERROR_STOP=1 -d "$DB" -f "$f"; done
  $PSQL_SUPER -q -v ON_ERROR_STOP=1 -d "$DB" -f "$SEED_FILE"
fi

echo "Starting the data API"
pkill -f "$RUN_DIR/bin-postgrest" 2>/dev/null || true
env \
  PGRST_DB_URI="postgres://authenticator:local-dev-only@127.0.0.1:5432/$DB" \
  PGRST_DB_SCHEMAS=public PGRST_DB_ANON_ROLE=anon \
  PGRST_DB_EXTRA_SEARCH_PATH=public,extensions \
  PGRST_JWT_SECRET="$JWT_SECRET" \
  PGRST_SERVER_HOST=127.0.0.1 PGRST_SERVER_PORT=3001 \
  nohup "$RUN_DIR/bin-postgrest" > "$RUN_DIR/rest.log" 2>&1 &

pkill -f "supabase/local/gateway.mjs" 2>/dev/null || true
nohup node supabase/local/gateway.mjs > "$RUN_DIR/gateway.log" 2>&1 &
sleep 1

cat > .env.local <<ENV
# Written by supabase/local/start.sh. Local test stack only.
NEXT_PUBLIC_BRAND=$BRAND
NEXT_PUBLIC_SITE_URL=$SITE_URL
ID_HASH_SECRET=$(cat "$RUN_DIR/id-hash-secret")
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$ANON_KEY
SUPABASE_SECRET_KEY=$SERVICE_KEY
ENV

echo
echo "Local Supabase is running at http://127.0.0.1:54321 (database: $DB, brand: $BRAND)."
echo "Settings were written to .env.local. Start the site with: npm run dev"
echo "Make yourself an admin after registering:"
echo "  $PSQL_SUPER -d $DB -c \"update public.profiles set role = 'admin' where email = 'you@example.com'\""
