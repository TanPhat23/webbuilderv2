#!/usr/bin/env bash
# Local end-to-end sandbox for agents and people: a throwaway copy of the whole
# stack with a signed-in headless browser holding the editor tab open, so MCP
# tools, the relay and the editor can be exercised without touching real data.
#
#   scripts/sandbox/sandbox.sh up        start everything (idempotent) and print the env
#   scripts/sandbox/sandbox.sh status    what is running, URLs, project id
#   scripts/sandbox/sandbox.sh call TOOL '{"json":"args"}'   call an MCP tool as the test user
#   scripts/sandbox/sandbox.sh tools     list MCP tools
#   scripts/sandbox/sandbox.sh shot [name]   screenshot the editor tab -> .sandbox/shots/<name>.png
#   scripts/sandbox/sandbox.sh bot PATH      send the bot to a path (e.g. /editor/<id>?page=<id>), or `reload`
#   scripts/sandbox/sandbox.sh peek PATH [name] [anon]   open a path in a throwaway tab (e.g. /preview/<id>), return visible text + screenshot; anon = signed out
#   scripts/sandbox/sandbox.sh api PATH   GET an API path as the sandbox user (status, ms, bytes)
#   scripts/sandbox/sandbox.sh canvas    rendered text of the editor canvas + count of "Missing component" boxes
#   scripts/sandbox/sandbox.sh console [clear]   recent browser console messages (clear empties the buffer)
#   scripts/sandbox/sandbox.sh exec FILE | -e 'JS BODY' [--timeout MS]   run a script against the signed-in editor page (page, context, projectId, baseURL, log); prints JSON, exits 1 when ok is false
#   scripts/sandbox/sandbox.sh logs api|mcp|vite|bot
#   scripts/sandbox/sandbox.sh restart api|mcp   rebuild + restart Go services after code changes (web hot-reloads)
#   scripts/sandbox/sandbox.sh down      stop everything and delete all sandbox data
#
# Needs docker, go, psql, node, bun, Firefox for Playwright, and Clerk
# DEVELOPMENT keys + E2E_EMAIL (same setup as e2e/README.md). Never reads the
# API's or MCP's .env; nothing points at a real database. Ports are fixed and
# bound to loopback: pg 55432, redis 56379, api 18080, mcp 18090, web 3100, bot 18099.
set -euo pipefail

CALLER_PWD="$PWD"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
GO_API_DIR="${GO_API_DIR:-$ROOT/../webbuilder.api.go}"
MCP_DIR="${MCP_DIR:-$ROOT/../webbuilder.mcp.go}"
S="$ROOT/.sandbox"
PG_PORT=55432 REDIS_PORT=56379 API_PORT=18080 MCP_PORT=18090 WEB_PORT=3100 BOT_PORT=18099
PG_NAME=wb-sandbox-pg REDIS_NAME=wb-sandbox-redis
DB_URL="postgres://postgres:sandbox@127.0.0.1:$PG_PORT/wb?sslmode=disable"
REDIS_URL="redis://127.0.0.1:$REDIS_PORT/0"

alive() { [ -f "$S/$1.pid" ] && kill -0 "$(cat "$S/$1.pid")" 2>/dev/null; }
listening() { (exec 3<>/dev/tcp/127.0.0.1/"$1") 2>/dev/null; }
wait_http() { # url name seconds
  for _ in $(seq 1 "$3"); do curl -fsS "$1" >/dev/null 2>&1 && return 0; sleep 1; done
  echo "$2 did not become healthy; last log lines:" >&2; tail -30 "$S/${4:-$2}.log" >&2; return 1
}
start_bg() { # name cmd... (env must already be exported by the caller via env VAR=...)
  local name=$1; shift
  nohup "$@" >"$S/$name.log" 2>&1 &
  echo $! >"$S/$name.pid"
}

read_env() { (cd "$ROOT" && node -e '
  const { config } = require("dotenv");
  const test = config({ path: ".env.test", processEnv: {}, quiet: true }).parsed ?? {};
  const app = config({ path: ".env", processEnv: {}, quiet: true }).parsed ?? {};
  process.stdout.write(process.env[process.argv[1]] || test[process.argv[1]] || app[process.argv[1]] || "");' "$1"); }

cmd_up() {
  mkdir -p "$S/bin" "$S/shots"
  for port in $API_PORT $MCP_PORT $WEB_PORT $BOT_PORT; do
    if listening $port && ! alive api && ! alive mcp && ! alive vite && ! alive bot; then
      echo "Port $port is already in use by something that is not this sandbox." >&2; exit 1
    fi
  done
  local sk; sk="$(read_env CLERK_SECRET_KEY)"
  case "$sk" in sk_test_*) ;; *) echo "CLERK_SECRET_KEY must be a development key (sk_test_...)." >&2; exit 1 ;; esac

  if ! docker ps --format '{{.Names}}' | grep -qx "$PG_NAME"; then
    docker rm -f "$PG_NAME" >/dev/null 2>&1 || true
    docker run -d --rm --name "$PG_NAME" -e POSTGRES_PASSWORD=sandbox -e POSTGRES_DB=wb -p 127.0.0.1:$PG_PORT:5432 postgres:16 >/dev/null
    for _ in $(seq 1 60); do docker exec "$PG_NAME" pg_isready -U postgres -d wb >/dev/null 2>&1 && break; sleep 1; done
    NEW_DB=1
  fi
  docker ps --format '{{.Names}}' | grep -qx "$REDIS_NAME" || {
    docker rm -f "$REDIS_NAME" >/dev/null 2>&1 || true
    docker run -d --rm --name "$REDIS_NAME" -p 127.0.0.1:$REDIS_PORT:6379 redis:7 >/dev/null; }

  echo "building api + migrate + mcp"
  (cd "$GO_API_DIR" && go build -o "$S/bin/migrate" ./cmd/migrate && go build -o "$S/bin/api" ./cmd/api)
  (cd "$MCP_DIR" && go build -o "$S/bin/mcp" ./cmd/mcp)

  if [ "${NEW_DB:-0}" = 1 ]; then
    (cd "$S" && env -i PATH="$PATH" DATABASE_URL="$DB_URL" ./bin/migrate up >/dev/null)
    (cd "$ROOT" && E2E_COLLAB=1 E2E_COLLAB_EMAIL="${E2E_COLLAB_EMAIL:-$(read_env E2E_COLLAB_EMAIL)}" E2E_TEST_API_URL="http://127.0.0.1:1" \
      node --import tsx e2e/helpers/clerk-test-users.ts) >"$S/users.csv"
    PGPASSWORD=sandbox psql -h 127.0.0.1 -p $PG_PORT -U postgres wb -q -v ON_ERROR_STOP=1 \
      -c '\copy "User"("Id","Email","FirstName","LastName","CreatedAt","UpdatedAt") FROM STDIN WITH (FORMAT csv)' <"$S/users.csv"
    rm -f "$S/env.json" "$S/token" "$S/project.json"   # a fresh database has none of the old project ids
  fi

  alive api || { (cd "$S" && start_bg api env -i PATH="$PATH" HOME="$S" PORT=$API_PORT DATABASE_URL="$DB_URL" REDIS_URL="$REDIS_URL" \
    CLERK_SECRET_KEY="$sk" ALLOWED_ORIGINS="http://localhost:$WEB_PORT" BASE_URL="http://localhost:$WEB_PORT" ./bin/api); }
  wait_http "http://127.0.0.1:$API_PORT/health" api 60

  # The agent token: only its sha256 is stored, like the API does.
  if [ ! -f "$S/token" ]; then
    echo "wbk_sandbox_$(head -c 24 /dev/urandom | base64 | tr -dc 'A-Za-z0-9' | head -c 32)" >"$S/token"; chmod 600 "$S/token"
    local owner hash
    hash="$(printf %s "$(cat "$S/token")" | sha256sum | cut -d' ' -f1)"
    owner="$(PGPASSWORD=sandbox psql -h 127.0.0.1 -p $PG_PORT -U postgres wb -Atc "SELECT \"Id\" FROM \"User\" ORDER BY \"CreatedAt\" LIMIT 1")"
    PGPASSWORD=sandbox psql -h 127.0.0.1 -p $PG_PORT -U postgres wb -q -v ON_ERROR_STOP=1 -c \
      "INSERT INTO \"AgentToken\"(\"Id\",\"UserId\",\"Name\",\"Prefix\",\"TokenHash\") VALUES ('sandbox-token','$owner','sandbox','wbk_sandbox','$hash')"
  fi
  alive mcp || { (cd "$S" && start_bg mcp env -i PATH="$PATH" HOME="$S" PORT=$MCP_PORT DATABASE_URL="$DB_URL" REDIS_URL="$REDIS_URL" ./bin/mcp); }
  wait_http "http://127.0.0.1:$MCP_PORT/health" mcp 30

  alive vite || { (cd "$ROOT/apps/editor" && start_bg vite env GO_SERVER_URL="http://127.0.0.1:$API_PORT" VITE_GO_SERVER_URL="http://127.0.0.1:$API_PORT" \
    VITE_COLLAB_WS_URL="ws://127.0.0.1:$API_PORT" VITE_SOCKET_URL="ws://127.0.0.1:$API_PORT" VITE_BASE_URL="http://localhost:$WEB_PORT" \
    bunx vite dev --port $WEB_PORT --strictPort --host localhost); }
  wait_http "http://localhost:$WEB_PORT/" web 120 vite

  if ! alive bot; then
    rm -f "$S/env.json"
    (cd "$ROOT" && start_bg bot env SANDBOX_DIR="$S" SANDBOX_WEB="http://localhost:$WEB_PORT" SANDBOX_API="http://127.0.0.1:$API_PORT" \
      SANDBOX_MCP="http://127.0.0.1:$MCP_PORT/mcp" SANDBOX_BOT_PORT=$BOT_PORT E2E_COLLAB=0 node --import tsx scripts/sandbox/editor-bot.ts)
  fi
  for _ in $(seq 1 120); do [ -f "$S/env.json" ] && break; alive bot || { echo "editor bot exited:"; tail -30 "$S/bot.log"; exit 1; }; sleep 1; done
  [ -f "$S/env.json" ] || { echo "editor bot never became ready"; tail -30 "$S/bot.log"; exit 1; }
  cmd_status
}

cmd_status() {
  for n in api mcp vite bot; do printf '%-5s %s\n' $n "$(alive $n && echo "running (pid $(cat "$S/$n.pid"))" || echo stopped)"; done
  docker ps --format '{{.Names}}' | grep -E "^($PG_NAME|$REDIS_NAME)$" | sed 's/^/docker /' || true
  [ -f "$S/env.json" ] && cat "$S/env.json" || echo "(no env.json: run 'up')"
}

botcall() { curl -fsS -H "x-sandbox-key: $(cat "$S/bot.key")" "http://127.0.0.1:$BOT_PORT$1"; }

cmd_down() {
  for n in bot vite mcp api; do
    [ -f "$S/$n.pid" ] && kill "$(cat "$S/$n.pid")" 2>/dev/null || true
  done
  sleep 1; pkill -f "$S/bin/" 2>/dev/null || true
  docker rm -f "$PG_NAME" "$REDIS_NAME" >/dev/null 2>&1 || true
  rm -rf "$S"; echo "sandbox removed"
}

# Rebuild and restart Go services after code changes: restart api|mcp [more...]
cmd_restart() {
  for n in "$@"; do
    [ -f "$S/$n.pid" ] && kill "$(cat "$S/$n.pid")" 2>/dev/null || true
    rm -f "$S/$n.pid"
  done
  sleep 1; cmd_up
}

case "${1:-}" in
  up) cmd_up ;;
  restart) shift; cmd_restart "${@:?api|mcp}" ;;
  status) cmd_status ;;
  down) cmd_down ;;
  call) shift; (cd "$ROOT" && SANDBOX_DIR="$S" node scripts/sandbox/mcp-call.mjs "$@") ;;
  tools) (cd "$ROOT" && SANDBOX_DIR="$S" node scripts/sandbox/mcp-call.mjs --list) ;;
  shot) botcall "/shot?name=${2:-editor}"; echo ;;
  bot) if [ "${2:-}" = reload ]; then botcall "/reload"; else botcall "/goto?path=$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "${2:?path}")"; fi; echo ;;
  peek) botcall "/peek?path=$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "${2:?path}")&name=${3:-peek}${4:+&anon=1}"; echo ;;
  api) botcall "/api?path=$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "${2:?/api/... path}")"; echo ;;
  canvas) botcall "/canvas"; echo ;;
  console) botcall "/console?clear=${2:+1}"; echo ;;
  exec) shift; (cd "$ROOT" && SANDBOX_CWD="$CALLER_PWD" SANDBOX_DIR="$S" SANDBOX_BOT_PORT=$BOT_PORT node --import tsx scripts/sandbox/exec-cli.ts "$@") ;;
  logs) tail -n "${3:-60}" "$S/${2:?api|mcp|vite|bot}.log" ;;
  *) sed -n 2,19p "$0"; exit 2 ;;
esac
