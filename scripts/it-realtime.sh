#!/usr/bin/env bash
# Test the API's /ws in DEV_MODE, then exercise multi-client realtime using
# the loopback-only test harness. Both use disposable Docker services.
set -euo pipefail

GO_API_DIR="${GO_API_DIR:-$HOME/Code/Go/webbuilder.api.go}"
WORK="$(mktemp -d)"
PG_CONTAINER=""
REDIS_CONTAINER=""
SERVER_PID=""
cleanup() {
  if [ -n "$SERVER_PID" ]; then kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; fi
  if [ -n "$PG_CONTAINER" ]; then docker rm -f "$PG_CONTAINER" >/dev/null 2>&1 || true; fi
  if [ -n "$REDIS_CONTAINER" ]; then docker rm -f "$REDIS_CONTAINER" >/dev/null 2>&1 || true; fi
  rm -rf "$WORK"
}
trap cleanup EXIT

PG_CONTAINER="$(docker run -d --rm -e POSTGRES_PASSWORD=test -e POSTGRES_DB=wb -p 127.0.0.1::5432 postgres:16)"
REDIS_CONTAINER="$(docker run -d --rm -p 127.0.0.1::6379 redis:7)"
PG_PORT="$(docker port "$PG_CONTAINER" 5432 | head -1 | awk -F: '{print $NF}')"
REDIS_PORT="$(docker port "$REDIS_CONTAINER" 6379 | head -1 | awk -F: '{print $NF}')"
DB_URL="postgres://postgres:test@127.0.0.1:$PG_PORT/wb?sslmode=disable"
export WEBBUILDER_TEST_DATABASE_URL="$DB_URL" WEBBUILDER_TEST_REDIS_ADDR="127.0.0.1:$REDIS_PORT"
(cd "$GO_API_DIR" && go build -o "$WORK/migrate" ./cmd/migrate && go build -o "$WORK/api" ./cmd/api && go build -o "$WORK/harness" ./test/realtime-harness)
for _ in $(seq 1 60); do
  docker exec "$PG_CONTAINER" pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done
(cd "$WORK" && DATABASE_URL="$WEBBUILDER_TEST_DATABASE_URL" ./migrate up >/dev/null)
PGPASSWORD=test psql -h 127.0.0.1 -p "$PG_PORT" -U postgres wb -q <<'SQL'
INSERT INTO "User"("Id","Email","CreatedAt","UpdatedAt") VALUES ('u1','u1@x.test',now(),now()), ('u2','u2@x.test',now(),now());
INSERT INTO "Project"("Id","Name","OwnerId","CreatedAt","UpdatedAt") VALUES ('proj1','it','u1',now(),now());
INSERT INTO "Collaborator"("Id","UserId","ProjectId","Role","UpdatedAt") VALUES ('collab-u2','u2','proj1','editor',now());
INSERT INTO "Page"("Id","Name","Type","Styles","ProjectId","CreatedAt","UpdatedAt")
  SELECT 'p'||g, 'P'||g, 'page', '{}', 'proj1', now(), now() FROM generate_series(1, 30) g;
SQL

# Select an unused loopback port; the API's PORT accepts a port number only.
SERVER_PORT="$(node -e 'const n=require("net").createServer();n.listen(0,"127.0.0.1",()=>{console.log(n.address().port);n.close()})')"
(cd "$WORK" && exec env -i PATH="$PATH" PORT="$SERVER_PORT" DEV_MODE=true DEV_USER_ID=u1 DATABASE_URL="$WEBBUILDER_TEST_DATABASE_URL" REDIS_URL="redis://$WEBBUILDER_TEST_REDIS_ADDR/0" ./api >"$WORK/api.log" 2>&1) &
SERVER_PID=$!
for _ in $(seq 1 60); do
  if curl -fsS "http://127.0.0.1:$SERVER_PORT/health" >/dev/null 2>&1; then break; fi
  kill -0 "$SERVER_PID" 2>/dev/null || { cat "$WORK/api.log"; exit 1; }
  sleep 1
done
IT_WS_URL="ws://127.0.0.1:$SERVER_PORT" node --import tsx --test tests/integration/api-dev-smoke.ts || { tail -50 "$WORK/api.log"; exit 1; }
kill "$SERVER_PID"
wait "$SERVER_PID" || true
SERVER_PID=""

(cd "$WORK" && exec env -i PATH="$PATH" WEBBUILDER_TEST_DATABASE_URL="$WEBBUILDER_TEST_DATABASE_URL" WEBBUILDER_TEST_REDIS_ADDR="$WEBBUILDER_TEST_REDIS_ADDR" WEBBUILDER_TEST_LISTEN_FILE="$WORK/listen" ./harness >"$WORK/harness.log" 2>&1) &
SERVER_PID=$!
for _ in $(seq 1 60); do
  [ -s "$WORK/listen" ] && break
  kill -0 "$SERVER_PID" 2>/dev/null || { cat "$WORK/harness.log"; exit 1; }
  sleep 1
done
[ -s "$WORK/listen" ] || { cat "$WORK/harness.log"; exit 1; }
IT_WS_URL="ws://$(cat "$WORK/listen")" node --import tsx --test tests/integration/*.itest.ts || { tail -50 "$WORK/harness.log"; exit 1; }
