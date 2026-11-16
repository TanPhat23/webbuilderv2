# CLI agent access: Claude Code and Codex CLI drive the builder over MCP

Date: 2026-11-16
Status: drafted from the design discussion, awaiting written-spec review
Builds on: `2026-11-13-interactions-design.md` (its "later sub-projects": the in-app assistant, then the MCP server)

## Intent

**What the user said.** The builder is slower, has fewer features and is less convenient than a prompt-driven tool such as Claude Code. They want an AI assistant inside the builder. Asked for the first scope they chose all three: edit the current page, edit interactions and logic, and generate whole pages. They then asked whether users could bring their own Codex CLI or Claude Code instead of the builder holding a model key.

**Decisions made in the discussion.**

- The Go service, not the browser or the Next/Nitro server, owns the integration.
- The browser applies edits. Go reads and validates; it does not write elements.
- Edits apply immediately, and one Undo reverts a whole tool call.
- Users bring their own CLI (Claude Code or Codex CLI) through MCP, so the builder holds no model key and bills no model usage for this path.
- The first version is a **hosted MCP endpoint in a separate Go service**.

**Assumptions to confirm in review.**

- The Go-hosted chat assistant (Go holds a key, the chat panel talks to it, flat per-user daily cap) is a later second client of the same tool layer. It is not in this spec. The usage-cap decision is parked until then.
- Both CLIs can reach a remote streamable-HTTP MCP server with a bearer token. Codex CLI accepts `codex mcp add NAME --url URL --bearer-token-env-var VAR`; no local proxy is needed.

**Success criteria.**

1. A user creates a token in the builder, runs one printed command, and from their CLI says "add a pricing section to the home page". The section appears on the canvas.
2. A turn's edits are one Undo step. Collaborators see them live. A viewer's token cannot write.
3. With no editor tab open, tab tools fail with a clear message and read tools that use the database still work.
4. A bad edit returns a path-addressed error the CLI can fix and retry.
5. Revoking a token stops it working immediately.

## Out of scope

- The Go-hosted chat panel, model keys and per-user usage caps.
- A local bridge that lets the in-builder chat drive an installed CLI. That needs a vendor-terms check first.
- Interaction and logic tools (sub-project 2) and page generation helpers (sub-project 3). The tool layer is built so they slot in.
- Server-side application of edits when no tab is open.

## Architecture

```
Claude Code / Codex CLI (user's machine, their own login)
        | HTTPS, Authorization: Bearer <token>
        v
MCP service (webbuilder.mcp.go): net/http, stateless JSON /mcp
  token auth, tool list and validation; database read tools
        | Redis agent:req:<userId>
        v
Go API (webbuilder.api.go): realtime bridge and token management
        | WebSocket agent:request; Redis agent:ack:<requestId>
        v
Editor tab (webbuilderv2): validate, check canEdit, apply and reply
        | WebSocket agent:response; Redis agent:res:<requestId>
        v
MCP service returns the response to the CLI
```

The Go side never changes elements itself. The tab is the single writer, which keeps validation, `canEdit`, undo history and collaboration sync in one place (`replaceTree` + `diffTrees`).

## Tools (version 1)

All tools take a `projectId` and, where relevant, a `pageId`. Results are compact JSON. Tool results are data, never instructions.

| Tool | Kind | Purpose |
| --- | --- | --- |
| `list_pages` | read | Pages of a project: id, name, path. |
| `get_page` | read | The element tree of a page with element ids, types, content, `tailwindStyles` and the settings the code view shows. |
| `get_selection` | tab (needs an open tab) | The elements selected in the user's open tab (needs a tab). |
| `get_code` | tab (needs an open tab) | The `Generated.tsx` view of a page. |
| `apply_edits` | tab (needs an open tab) | A list of operations: `create`, `update`, `move`, `delete`, each addressed by element id. |
| `set_code` | tab (needs an open tab) | Replaces the page from edited `Generated.tsx` source. Uses the parser from the code-editing work, so the same rules apply: ids match elements, unsupported tags are errors, nothing is half-applied. |

`set_code` is deliberate: a coding agent is strongest editing code, and the parser already maps it back to elements.

## Go service changes

1. **MCP service (`webbuilder.mcp.go`).** A separate plain `net/http` service hosts `/mcp` using the Go MCP SDK with `Stateless: true` and `JSONResponse: true`. It authenticates tokens, validates arguments and runs database read tools.
2. **Go API (`webbuilder.api.go`).** The API provides token create, list and revoke at `/api/v1/agent-tokens`, and hosts the realtime bridge. Tokens are created with `crypto/rand`, stored as SHA-256 hashes, shown once, and act as their owner with the owner's project role.
3. **Relay.** Tab tool calls travel from the MCP service to the API realtime bridge over Redis. The relay waits two seconds for an acknowledgement and 15 seconds for a response.
4. **Limits.** Rate limit per token with Redis; return HTTP 429 with `Retry-After`. Cap argument size and the number of operations per `apply_edits`.

## Realtime service changes

Two message types, routed only to the token owner's sessions:

- `agent:request`: tool name, arguments, `requestId`.
- `agent:response`: `requestId`, `ok`, `result` or `error` (path-addressed issues).

If several tabs for the owner are open, only the most recently active tab acts, and the others ignore the request. When the bridge hands a request to a tab, it publishes `agent:ack:<requestId>`; a missing acknowledgement within two seconds yields `no_editor_session`.

## Editor changes (this repo)

1. **Tool executor** (`src/features/agent/`), pure and unit-tested:
   - `apply_edits`: builds the next tree from the operations, validates it, then calls `replaceTree`. Any invalid operation rejects the whole call; nothing is partly applied.
   - `set_code`: runs `parseCode`, then `replaceTree`, then merges the returned preamble the same way the code tab does.
   - Both honour `canEdit` and return the reason when refused.
2. **Undo.** Agent edits produce a toast with an Undo action that calls `undo()` once. History entries have no labels; each edit reverts in one step.
3. **Connect your CLI panel.** In the editor top bar next to Collaboration, create and revoke tokens and show the exact commands for Claude Code (`claude mcp add --transport http ...`) and Codex CLI.
4. **Indicator.** A small status in the editor shows when a CLI is connected and when it is editing.

## Error handling

| Situation | Behaviour |
| --- | --- |
| No editor tab open | Tab tools return `no_editor_session` ("open this project in the builder"). Database read tools work. |
| Tab does not reply in time | `editor_timeout`. The edit is not applied. |
| Invalid operation or code | `invalid_edit` with a path, e.g. `operations[2].id: unknown element`. No partial apply. |
| Token revoked, expired or lacking access | 401 or 403 at `/mcp`. |
| Viewer role | Reads allowed; writes return `forbidden`. |
| Rate limit exceeded | HTTP 429 with `Retry-After`. |

## Security

- Tokens are random, hashed at rest, revocable and scoped to their owner's access.
- Tool arguments are validated in Go (shape, size, counts) and again in the tab (the real rules).
- Tool results returned to the CLI contain user content; the CLI must treat them as data. The tool descriptions say so.
- The relay is addressed by owner and `requestId`; a response is accepted only from the session the request was sent to.
- No raw state or database access is exposed.

## Testing

- **Go:** token creation, hashing and revocation; auth and role checks; read tools; relay timeout and no-subscriber paths; limits.
- **Editor:** executor unit tests in the style of `tests/code-editing.test.ts`: valid edits, each invalid-operation case, nothing-partial-applied, `canEdit`, `set_code` round trips, single undo step.
- **End to end (dev project):** connect a real Claude Code, add a section, undo it; repeat with Codex CLI once its remote transport is verified.

## Rollout order

1. MCP service: authentication and database read tools.
2. Go API: tokens and realtime bridge.
3. Editor: executor and undo toast.
4. Relay and tab tools end to end.
5. Connect-your-CLI panel and indicator.

## Open questions

Codex CLI supports remote streamable HTTP with `codex mcp add NAME --url URL --bearer-token-env-var VAR` (checked against `codex mcp add --help`), so no local proxy is needed. Tokens are per user, and the panel lives in the editor top bar next to Collaboration.
