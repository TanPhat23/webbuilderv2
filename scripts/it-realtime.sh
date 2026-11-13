#!/usr/bin/env bash
# Runs tests/integration against the real Go realtime server, no Clerk login.
#
# Starts a throwaway Postgres and Redis in Docker, applies the API's
# migrations, seeds a project, and starts the server in DEV_MODE from a
# scratch directory (so its .env, which may point at real databases, is never
# read). Everything is removed afterwards.
#
# Needs: docker, go, psql, and the Go repos. Override the paths if they differ:
#   GO_REALTIME_DIR (default ~/Code/Go/webbuilder.realtimev2.go)
#   GO_API_DIR      (default ~/Code/Go/webbuilder.api.go)
# The realtime server must support the dev-only `devUser` query parameter.
set -euo pipefail

GO_REALTIME_DIR="${GO_REALTIME_DIR:-$HOME/Code/Go/webbuilder.realtimev2.go}"
GO_API_DIR="${GO_API_DIR:-$HOME/Code/Go/webbuilder.api.go}"
PG_PORT="${IT_PG_PORT:-55432}"
REDIS_PORT="${IT_REDIS_PORT:-56379}"
SERVER_PORT="${IT_SERVER_PORT:-18080}"
PAGES="${IT_PAGES:-30}"

WORK="$(mktemp -d)"
SERVER_PID=""
cleanup() {
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
  docker rm -f wb-it-pg wb-it-redis >/dev/null 2>&1 || true
  rm -rf "$WORK"
}
trap cleanup EXIT

docker rm -f wb-it-pg wb-it-redis >/dev/null 2>&1 || true
docker run -d --name wb-it-pg -e POSTGRES_PASSWORD=test -e POSTGRES_DB=wb -p "127.0.0.1:$PG_PORT:5432" postgres:16 >/dev/null
docker run -d --name wb-it-redis -p "127.0.0.1:$REDIS_PORT:6379" redis:7 >/dev/null

(cd "$GO_API_DIR" && go build -o "$WORK/migrate" ./cmd/migrate)
(cd "$GO_REALTIME_DIR" && go build -o "$WORK/realtime" ./cmd/api)

for _ in $(seq 1 60); do
  docker exec wb-it-pg pg_isready -U postgres >/dev/null 2>&1 && break
  sleep 1
done

DB_URL="postgres://postgres:test@127.0.0.1:$PG_PORT/wb?sslmode=disable"
(cd "$WORK" && DATABASE_URL="$DB_URL" ./migrate up >/dev/null)

export PGPASSWORD=test
psql -h 127.0.0.1 -p "$PG_PORT" -U postgres wb -q <<SQL
INSERT INTO "User"("Id","Email","CreatedAt","UpdatedAt") VALUES ('u1','u1@x.test',now(),now());
INSERT INTO "Project"("Id","Name","OwnerId","CreatedAt","UpdatedAt") VALUES ('proj1','it','u1',now(),now());
INSERT INTO "Page"("Id","Name","Type","Styles","ProjectId","CreatedAt","UpdatedAt")
  SELECT 'p'||g, 'P'||g, 'page', '{}', 'proj1', now(), now() FROM generate_series(1, $PAGES) g;
SQL

# Run from $WORK so godotenv finds no .env; explicit variables win anyway.
(cd "$WORK" && DEV_MODE=true SERVER_PORT="$SERVER_PORT" DATABASE_URL="$DB_URL" \
  DB_HOST=127.0.0.1 DB_PORT="$PG_PORT" DB_USER=postgres DB_PASSWORD=test DB_NAME=wb \
  REDIS_URL="redis://127.0.0.1:$REDIS_PORT/0" REDIS_HOST=127.0.0.1 REDIS_PORT="$REDIS_PORT" REDIS_PASSWORD="" REDIS_DB=0 \
  exec ./realtime >"$WORK/server.log" 2>&1) &
SERVER_PID=$!

for _ in $(seq 1 30); do
  (exec 3<>"/dev/tcp/127.0.0.1/$SERVER_PORT") 2>/dev/null && break
  sleep 1
done

status=0
IT_WS_URL="ws://127.0.0.1:$SERVER_PORT" node --import tsx --test tests/integration/*.itest.ts || status=$?
[ "$status" -ne 0 ] && { echo "--- server log (tail) ---"; tail -20 "$WORK/server.log"; }
exit "$status"
