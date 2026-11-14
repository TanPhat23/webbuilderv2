#!/usr/bin/env bash
# Runs the two-user Clerk collaboration test (e2e/collaboration.spec.ts)
# end to end against a throwaway backend:
#   1. starts disposable PostgreSQL and Redis on random loopback ports,
#   2. applies the API's goose migrations,
#   3. copies the two dedicated Clerk test users (E2E_EMAIL, E2E_COLLAB_EMAIL)
#      into the "User" table,
#   4. starts the API from a scratch directory with an explicit environment, so
#      the API repo's .env (which points at real databases) is never read,
#   5. runs Playwright, which starts its own Vite server pointed at that API.
# Everything is removed afterwards. Needs docker, go, psql, node and bunx.
# Clerk keys must be development keys (pk_test_/sk_test_); see e2e/README.md.
# Extra arguments are passed to Playwright, e.g. --headed or --debug.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GO_API_DIR="${GO_API_DIR:-$HOME/Code/Go/webbuilder/webbuilder.api.go}"
WORK="$(mktemp -d)"
PG_CONTAINER=""
REDIS_CONTAINER=""
API_PID=""
cleanup() {
  if [ -n "$API_PID" ]; then kill "$API_PID" 2>/dev/null || true; wait "$API_PID" 2>/dev/null || true; fi
  if [ -n "$PG_CONTAINER" ]; then docker rm -f "$PG_CONTAINER" >/dev/null 2>&1 || true; fi
  if [ -n "$REDIS_CONTAINER" ]; then docker rm -f "$REDIS_CONTAINER" >/dev/null 2>&1 || true; fi
  rm -rf "$WORK"
}
trap cleanup EXIT

cd "$ROOT"
if (exec 3<>/dev/tcp/127.0.0.1/3000) 2>/dev/null; then
  echo "Port 3000 is in use. Stop the dev server first: this test starts its own, pointed at the test API." >&2
  exit 1
fi

# The Clerk keys come from .env.test, falling back to .env (same as playwright.config.ts).
read_env() { node -e '
  const { config } = require("dotenv");
  const test = config({ path: ".env.test", processEnv: {}, quiet: true }).parsed ?? {};
  const app = config({ path: ".env", processEnv: {}, quiet: true }).parsed ?? {};
  const v = process.env[process.argv[1]] || test[process.argv[1]] || app[process.argv[1]] || "";
  process.stdout.write(v);' "$1"; }
CLERK_SECRET_KEY="$(read_env CLERK_SECRET_KEY)"
case "$CLERK_SECRET_KEY" in sk_test_*) ;; *) echo "CLERK_SECRET_KEY must be a development key (sk_test_...)." >&2; exit 1 ;; esac

PG_CONTAINER="$(docker run -d --rm -e POSTGRES_PASSWORD=test -e POSTGRES_DB=wb -p 127.0.0.1::5432 postgres:16)"
REDIS_CONTAINER="$(docker run -d --rm -p 127.0.0.1::6379 redis:7)"
PG_PORT="$(docker port "$PG_CONTAINER" 5432 | head -1 | awk -F: '{print $NF}')"
REDIS_PORT="$(docker port "$REDIS_CONTAINER" 6379 | head -1 | awk -F: '{print $NF}')"
DB_URL="postgres://postgres:test@127.0.0.1:$PG_PORT/wb?sslmode=disable"

(cd "$GO_API_DIR" && go build -o "$WORK/migrate" ./cmd/migrate && go build -o "$WORK/api" ./cmd/api)
for _ in $(seq 1 60); do
  docker exec "$PG_CONTAINER" pg_isready -U postgres -d wb >/dev/null 2>&1 && break
  sleep 1
done
(cd "$WORK" && env -i PATH="$PATH" DATABASE_URL="$DB_URL" ./migrate up >/dev/null)

E2E_COLLAB=1 E2E_TEST_API_URL="http://127.0.0.1:1" node --import tsx e2e/helpers/clerk-test-users.ts > "$WORK/users.csv"
PGPASSWORD=test psql -h 127.0.0.1 -p "$PG_PORT" -U postgres wb -q -v ON_ERROR_STOP=1 \
  -c '\copy "User"("Id","Email","FirstName","LastName","CreatedAt","UpdatedAt") FROM STDIN WITH (FORMAT csv)' < "$WORK/users.csv"

API_PORT="$(node -e 'const n=require("net").createServer();n.listen(0,"127.0.0.1",()=>{console.log(n.address().port);n.close()})')"
(cd "$WORK" && exec env -i PATH="$PATH" HOME="$WORK" PORT="$API_PORT" DATABASE_URL="$DB_URL" REDIS_URL="redis://127.0.0.1:$REDIS_PORT/0" \
  CLERK_SECRET_KEY="$CLERK_SECRET_KEY" ALLOWED_ORIGINS="http://localhost:3000" BASE_URL="http://localhost:3000" \
  ./api >"$WORK/api.log" 2>&1) &
API_PID=$!
for _ in $(seq 1 60); do
  curl -fsS "http://127.0.0.1:$API_PORT/health" >/dev/null 2>&1 && break
  kill -0 "$API_PID" 2>/dev/null || { cat "$WORK/api.log"; exit 1; }
  sleep 1
done
curl -fsS "http://127.0.0.1:$API_PORT/health" >/dev/null || { cat "$WORK/api.log"; exit 1; }

status=0
E2E_COLLAB=1 E2E_TEST_API_URL="http://127.0.0.1:$API_PORT" \
  bunx playwright test --project=setup --project=firefox e2e/collaboration.spec.ts "$@" || status=$?
if [ "$status" -ne 0 ]; then echo "--- API log (last 60 lines)"; tail -60 "$WORK/api.log"; fi
exit "$status"
