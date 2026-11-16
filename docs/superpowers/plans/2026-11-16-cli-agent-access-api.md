# CLI Agent Access, Part 2: changes in the Go API (`webbuilder.api.go`)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The API owns the two things only it can do: let a signed-in user create and revoke personal access tokens, and deliver a CLI's tool calls to that user's open editor tab through the realtime WebSocket.

**Architecture:** One migration, one model, one repository and one handler for tokens (REST under `/api/v1/agent-tokens`, behind the existing Clerk auth). One small bridge in the in-process realtime service (`internal/realtime`) that listens on Redis for `agent:req:<userId>`, forwards each request to the user's most recently active tab, and publishes the tab's reply. The MCP service (Part 1) and the bridge talk only through Redis.

**Tech Stack:** Go 1.27, Fiber v2.52, gorm, goose, go-redis v9, `github.com/lucsky/cuid`.

**Overview, global constraints and Review Focus:** `docs/superpowers/plans/2026-11-16-cli-agent-access.md` (read it first; its constraints apply to every task here).

**Spec:** `docs/superpowers/specs/2026-11-16-cli-agent-access-design.md`

Paths used below: `API=/home/ghug/Code/Go/webbuilder/webbuilder.api.go`, `MCP=/home/ghug/Code/Go/webbuilder/webbuilder.mcp.go`.

This part touches existing files only for small additions: `interface.repository.go` (one interface, one field), `privateRoutes.routes.go` (three routes), and the realtime `message.go`, `client.go`, `room.go`, `hub.go`, `handler.go`. Everything else is new files.

Start the branch once: `cd $API && git checkout -b feat/agent-cli-access`.

---

### Task A1: Personal access tokens: table, repository, service, REST

**Files:**
- Create: `$API/migrations/00005_agent_tokens.sql`, `$API/internal/models/agenttoken.model.go`, `$API/internal/repositories/agenttoken.repository.go`, `$API/internal/agenttokens/secret.go`, `$API/internal/agenttokens/service.go`, `$API/internal/handlers/agenttoken.handler.go`
- Modify: `$API/internal/repositories/interface.repository.go` (the interfaces near line 419, the repositories struct near line 428 and its constructor near line 471), `$API/internal/routes/privateRoutes.routes.go`
- Test: `$API/internal/agenttokens/service_test.go`, `$API/internal/handlers/agenttoken_handler_test.go`

**Interfaces:**
- Consumes: `models.AgentToken` (defined here).
- Produces (used by Task M3 in the MCP service through the table, not through Go code):

```go
// package agenttokens
const TokenPrefix = "wbk_"
func NewSecret() (secret, prefix, hash string, err error)
func HashSecret(secret string) string // hex SHA-256: must equal the MCP service's HashSecret
type Store interface {
	Create(ctx context.Context, t *models.AgentToken) error
	ListActiveByUser(ctx context.Context, userID string) ([]models.AgentToken, error)
	Revoke(ctx context.Context, userID, id string) (bool, error)
}
var ErrTooManyTokens, ErrTokenNotFound, ErrBadName error
const MaxActiveTokens = 10
type Service struct{ ... }
func NewService(store Store) *Service
func (s *Service) Create(ctx, userID, name string) (secret string, tok models.AgentToken, err error)
func (s *Service) List(ctx, userID string) ([]models.AgentToken, error)
func (s *Service) Revoke(ctx, userID, id string) error
// package handlers
func NewAgentTokenHandler(tokens AgentTokenManager, mcpBaseURL string) *AgentTokenHandler
func PublicMCPURL() string // PUBLIC_MCP_URL, default http://localhost:8090
```

- [ ] **Step 1: Write the failing service tests**

```go
// $API/internal/agenttokens/service_test.go
package agenttokens

import (
	"context"
	"errors"
	"strings"
	"testing"
	"time"

	"my-go-app/internal/models"
)

type memStore struct{ tokens []models.AgentToken }

func (m *memStore) Create(_ context.Context, t *models.AgentToken) error {
	m.tokens = append(m.tokens, *t)
	return nil
}
func (m *memStore) ListActiveByUser(_ context.Context, u string) ([]models.AgentToken, error) {
	var out []models.AgentToken
	for _, t := range m.tokens {
		if t.UserId == u && t.RevokedAt == nil {
			out = append(out, t)
		}
	}
	return out, nil
}
func (m *memStore) Revoke(_ context.Context, u, id string) (bool, error) {
	for i := range m.tokens {
		if m.tokens[i].Id == id && m.tokens[i].UserId == u && m.tokens[i].RevokedAt == nil {
			now := time.Now()
			m.tokens[i].RevokedAt = &now
			return true, nil
		}
	}
	return false, nil
}

// The MCP service has the same vector in its own test. If these ever differ,
// tokens created here stop verifying there.
func TestHashSecretMatchesTheMCPServicesHash(t *testing.T) {
	const want = "a1069d5e4e69aed3fcf506b1202976b27308b6a2ae9fad0f2ee38af34ecc4604"
	if got := HashSecret("wbk_fixture"); got != want {
		t.Fatalf("HashSecret(wbk_fixture) = %s, want %s", got, want)
	}
}

func TestSecretShapeAndHash(t *testing.T) {
	secret, prefix, hash, err := NewSecret()
	if err != nil {
		t.Fatal(err)
	}
	if !strings.HasPrefix(secret, TokenPrefix) || len(secret) != len(TokenPrefix)+43 {
		t.Fatalf("secret %q", secret)
	}
	if !strings.HasPrefix(secret, prefix) || len(prefix) != len(TokenPrefix)+4 {
		t.Fatalf("prefix %q", prefix)
	}
	if hash != HashSecret(secret) || len(hash) != 64 || strings.Contains(hash, secret) {
		t.Fatalf("hash %q", hash)
	}
	other, _, _, _ := NewSecret()
	if other == secret {
		t.Fatal("secrets must differ")
	}
}

func TestCreateStoresOnlyTheHash(t *testing.T) {
	store := &memStore{}
	secret, tok, err := NewService(store).Create(context.Background(), "user-1", "  My laptop ")
	if err != nil {
		t.Fatal(err)
	}
	if tok.Name != "My laptop" || tok.UserId != "user-1" {
		t.Fatalf("token %+v", tok)
	}
	if store.tokens[0].TokenHash != HashSecret(secret) || store.tokens[0].TokenHash == secret {
		t.Fatal("only the hash may be stored")
	}
}

func TestCreateRejectsBadNamesAndTooManyTokens(t *testing.T) {
	svc := NewService(&memStore{})
	for _, name := range []string{"", "   ", strings.Repeat("x", 101)} {
		if _, _, err := svc.Create(context.Background(), "u", name); !errors.Is(err, ErrBadName) {
			t.Fatalf("name %q: %v", name, err)
		}
	}
	for i := 0; i < MaxActiveTokens; i++ {
		if _, _, err := svc.Create(context.Background(), "u", "t"); err != nil {
			t.Fatal(err)
		}
	}
	if _, _, err := svc.Create(context.Background(), "u", "one too many"); !errors.Is(err, ErrTooManyTokens) {
		t.Fatalf("got %v", err)
	}
}

func TestRevokeIsOwnerScopedAndRevokedTokensLeaveTheList(t *testing.T) {
	svc := NewService(&memStore{})
	_, tok, _ := svc.Create(context.Background(), "owner", "cli")
	if err := svc.Revoke(context.Background(), "someone-else", tok.Id); !errors.Is(err, ErrTokenNotFound) {
		t.Fatalf("got %v", err)
	}
	if err := svc.Revoke(context.Background(), "owner", tok.Id); err != nil {
		t.Fatal(err)
	}
	if list, _ := svc.List(context.Background(), "owner"); len(list) != 0 {
		t.Fatalf("revoked token still listed: %+v", list)
	}
	if err := svc.Revoke(context.Background(), "owner", tok.Id); !errors.Is(err, ErrTokenNotFound) {
		t.Fatalf("revoking twice: %v", err)
	}
}
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `cd $API && go test ./internal/agenttokens -v`
Expected: FAIL to compile (`undefined: NewSecret`, `models.AgentToken`).

- [ ] **Step 3: Migration and model**

```sql
-- $API/migrations/00005_agent_tokens.sql
-- +goose Up
CREATE TABLE "AgentToken" (
    "Id"         VARCHAR(255) PRIMARY KEY,
    "UserId"     VARCHAR(255) NOT NULL,
    "Name"       VARCHAR(100) NOT NULL,
    "Prefix"     VARCHAR(16)  NOT NULL,
    "TokenHash"  CHAR(64)     NOT NULL,
    "CreatedAt"  TIMESTAMPTZ  NOT NULL DEFAULT now(),
    "LastUsedAt" TIMESTAMPTZ,
    "RevokedAt"  TIMESTAMPTZ
);
CREATE UNIQUE INDEX "AgentToken_TokenHash_key" ON "AgentToken" ("TokenHash");
CREATE INDEX "AgentToken_UserId_idx" ON "AgentToken" ("UserId");

-- +goose Down
DROP TABLE "AgentToken";
```

```go
// $API/internal/models/agenttoken.model.go
package models

import "time"

// AgentToken is a personal access token for the MCP service. Only the hash of
// the secret is stored; the secret is shown once when the token is created.
// The MCP service reads this table directly to verify tokens.
type AgentToken struct {
	Id         string     `gorm:"primaryKey;column:Id;type:varchar(255)" json:"id"`
	UserId     string     `gorm:"column:UserId;type:varchar(255);not null;index" json:"userId"`
	Name       string     `gorm:"column:Name;type:varchar(100);not null" json:"name"`
	Prefix     string     `gorm:"column:Prefix;type:varchar(16);not null" json:"prefix"`
	TokenHash  string     `gorm:"column:TokenHash;type:char(64);not null;uniqueIndex" json:"-"`
	CreatedAt  time.Time  `gorm:"column:CreatedAt" json:"createdAt"`
	LastUsedAt *time.Time `gorm:"column:LastUsedAt" json:"lastUsedAt,omitempty"`
	RevokedAt  *time.Time `gorm:"column:RevokedAt" json:"revokedAt,omitempty"`
}

func (AgentToken) TableName() string {
	return `public."AgentToken"`
}
```

- [ ] **Step 4: Secret helpers and service**

```go
// $API/internal/agenttokens/secret.go
// Package agenttokens creates, lists and revokes the personal access tokens
// that Claude Code and Codex CLI present to the MCP service.
package agenttokens

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
)

const TokenPrefix = "wbk_"

// NewSecret returns a new token secret, the short prefix shown in the token
// list, and the hash that is stored.
func NewSecret() (secret, prefix, hash string, err error) {
	b := make([]byte, 32)
	if _, err = rand.Read(b); err != nil {
		return "", "", "", err
	}
	secret = TokenPrefix + base64.RawURLEncoding.EncodeToString(b)
	return secret, secret[:len(TokenPrefix)+4], HashSecret(secret), nil
}

func HashSecret(secret string) string {
	sum := sha256.Sum256([]byte(secret))
	return hex.EncodeToString(sum[:])
}
```

```go
// $API/internal/agenttokens/service.go
package agenttokens

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/lucsky/cuid"

	"my-go-app/internal/models"
)

const MaxActiveTokens = 10

var (
	ErrTooManyTokens = errors.New("too many active tokens: revoke one first")
	ErrTokenNotFound = errors.New("token not found")
	ErrBadName       = errors.New("name must be 1 to 100 characters")
)

type Store interface {
	Create(ctx context.Context, t *models.AgentToken) error
	ListActiveByUser(ctx context.Context, userID string) ([]models.AgentToken, error)
	Revoke(ctx context.Context, userID, id string) (bool, error)
}

type Service struct {
	store Store
	now   func() time.Time
}

func NewService(store Store) *Service { return &Service{store: store, now: time.Now} }

func (s *Service) Create(ctx context.Context, userID, name string) (string, models.AgentToken, error) {
	name = strings.TrimSpace(name)
	if name == "" || len(name) > 100 {
		return "", models.AgentToken{}, ErrBadName
	}
	active, err := s.store.ListActiveByUser(ctx, userID)
	if err != nil {
		return "", models.AgentToken{}, err
	}
	if len(active) >= MaxActiveTokens {
		return "", models.AgentToken{}, ErrTooManyTokens
	}
	secret, prefix, hash, err := NewSecret()
	if err != nil {
		return "", models.AgentToken{}, err
	}
	tok := models.AgentToken{Id: cuid.New(), UserId: userID, Name: name, Prefix: prefix, TokenHash: hash, CreatedAt: s.now()}
	if err := s.store.Create(ctx, &tok); err != nil {
		return "", models.AgentToken{}, err
	}
	return secret, tok, nil
}

func (s *Service) List(ctx context.Context, userID string) ([]models.AgentToken, error) {
	return s.store.ListActiveByUser(ctx, userID)
}

func (s *Service) Revoke(ctx context.Context, userID, id string) error {
	ok, err := s.store.Revoke(ctx, userID, id)
	if err != nil {
		return err
	}
	if !ok {
		return ErrTokenNotFound
	}
	return nil
}
```

Run: `cd $API && go test ./internal/agenttokens -v` — expected PASS.

- [ ] **Step 5: Repository**

```go
// $API/internal/repositories/agenttoken.repository.go
package repositories

import (
	"context"
	"time"

	"gorm.io/gorm"

	"my-go-app/internal/models"
)

type AgentTokenRepository struct{ db *gorm.DB }

func NewAgentTokenRepository(db *gorm.DB) AgentTokenRepositoryInterface {
	return &AgentTokenRepository{db: db}
}

func (r *AgentTokenRepository) Create(ctx context.Context, t *models.AgentToken) error {
	return r.db.WithContext(ctx).Create(t).Error
}

func (r *AgentTokenRepository) ListActiveByUser(ctx context.Context, userID string) ([]models.AgentToken, error) {
	var out []models.AgentToken
	err := r.db.WithContext(ctx).
		Where(`"UserId" = ? AND "RevokedAt" IS NULL`, userID).
		Order(`"CreatedAt" DESC`).
		Find(&out).Error
	return out, err
}

// Revoke marks the user's token revoked. It reports false when there is no such
// active token for that user.
func (r *AgentTokenRepository) Revoke(ctx context.Context, userID, id string) (bool, error) {
	res := r.db.WithContext(ctx).Model(&models.AgentToken{}).
		Where(`"Id" = ? AND "UserId" = ? AND "RevokedAt" IS NULL`, id, userID).
		Update("RevokedAt", time.Now())
	return res.RowsAffected > 0, res.Error
}
```

Register it in `$API/internal/repositories/interface.repository.go`: add next to `NotificationRepositoryInterface` (around line 419):

```go
// AgentTokenRepositoryInterface stores MCP personal access tokens.
type AgentTokenRepositoryInterface interface {
	Create(ctx context.Context, t *models.AgentToken) error
	ListActiveByUser(ctx context.Context, userID string) ([]models.AgentToken, error)
	Revoke(ctx context.Context, userID, id string) (bool, error)
}
```

Add the field `AgentTokenRepository AgentTokenRepositoryInterface` to the repositories struct (around line 428) and `AgentTokenRepository: NewAgentTokenRepository(db),` to its constructor literal (around line 471), matching how the neighbouring repositories are listed.

- [ ] **Step 6: Write the failing handler test**

```go
// $API/internal/handlers/agenttoken_handler_test.go
package handlers

import (
	"context"
	"encoding/json"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gofiber/fiber/v2"

	"my-go-app/internal/agenttokens"
	"my-go-app/internal/models"
)

type tokenManagerStub struct {
	created []string
	revoked string
	err     error
}

func (s *tokenManagerStub) Create(_ context.Context, userID, name string) (string, models.AgentToken, error) {
	if s.err != nil {
		return "", models.AgentToken{}, s.err
	}
	s.created = append(s.created, userID+":"+name)
	return "wbk_secretvalue", models.AgentToken{Id: "t1", UserId: userID, Name: name, Prefix: "wbk_secr"}, nil
}
func (s *tokenManagerStub) List(context.Context, string) ([]models.AgentToken, error) {
	return []models.AgentToken{{Id: "t1", Name: "cli", Prefix: "wbk_secr", TokenHash: "must-never-be-serialised"}}, nil
}
func (s *tokenManagerStub) Revoke(_ context.Context, _, id string) error {
	if id == "missing" {
		return agenttokens.ErrTokenNotFound
	}
	s.revoked = id
	return nil
}

func tokenApp(stub *tokenManagerStub) *fiber.App {
	app := fiber.New()
	h := NewAgentTokenHandler(stub, "https://mcp.example.test/")
	app.Use(func(c *fiber.Ctx) error { c.Locals("userId", "user-1"); return c.Next() })
	app.Post("/agent-tokens", h.Create)
	app.Get("/agent-tokens", h.List)
	app.Delete("/agent-tokens/:id", h.Revoke)
	return app
}

func TestCreateReturnsTheSecretAndMcpUrlOnce(t *testing.T) {
	stub := &tokenManagerStub{}
	req := httptest.NewRequest("POST", "/agent-tokens", strings.NewReader(`{"name":"laptop"}`))
	req.Header.Set("Content-Type", "application/json")
	resp, err := tokenApp(stub).Test(req)
	if err != nil || resp.StatusCode != 201 {
		t.Fatalf("status=%v err=%v", resp, err)
	}
	var body map[string]any
	_ = json.NewDecoder(resp.Body).Decode(&body)
	if body["token"] != "wbk_secretvalue" || body["mcpUrl"] != "https://mcp.example.test/mcp" || body["id"] != "t1" {
		t.Fatalf("body=%v", body)
	}
	if len(stub.created) != 1 || stub.created[0] != "user-1:laptop" {
		t.Fatalf("created=%v", stub.created)
	}
}

func TestListNeverReturnsSecretMaterial(t *testing.T) {
	resp, _ := tokenApp(&tokenManagerStub{}).Test(httptest.NewRequest("GET", "/agent-tokens", nil))
	raw := new(strings.Builder)
	_, _ = raw.ReadFrom(resp.Body)
	for _, leak := range []string{"must-never-be-serialised", `"token"`, "tokenHash", "TokenHash"} {
		if strings.Contains(raw.String(), leak) {
			t.Fatalf("list leaked %q: %s", leak, raw.String())
		}
	}
}

func TestCreateMapsServiceErrors(t *testing.T) {
	cases := []struct {
		err  error
		want int
	}{{agenttokens.ErrBadName, 400}, {agenttokens.ErrTooManyTokens, 409}}
	for _, c := range cases {
		req := httptest.NewRequest("POST", "/agent-tokens", strings.NewReader(`{"name":"x"}`))
		req.Header.Set("Content-Type", "application/json")
		resp, _ := tokenApp(&tokenManagerStub{err: c.err}).Test(req)
		if resp.StatusCode != c.want {
			t.Fatalf("%v: status %d want %d", c.err, resp.StatusCode, c.want)
		}
	}
}

func TestRevokeStatuses(t *testing.T) {
	stub := &tokenManagerStub{}
	app := tokenApp(stub)
	if resp, _ := app.Test(httptest.NewRequest("DELETE", "/agent-tokens/t1", nil)); resp.StatusCode != 204 || stub.revoked != "t1" {
		t.Fatalf("status=%d revoked=%q", resp.StatusCode, stub.revoked)
	}
	if resp, _ := app.Test(httptest.NewRequest("DELETE", "/agent-tokens/missing", nil)); resp.StatusCode != 404 {
		t.Fatalf("status=%d", resp.StatusCode)
	}
}
```

- [ ] **Step 7: Run it to confirm it fails**

Run: `cd $API && go test ./internal/handlers -run 'Token|Revoke|Create|List' -v`
Expected: FAIL to compile (`undefined: NewAgentTokenHandler`).

- [ ] **Step 8: Handler and routes**

```go
// $API/internal/handlers/agenttoken.handler.go
package handlers

import (
	"context"
	"errors"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"

	"my-go-app/internal/agenttokens"
	"my-go-app/internal/models"
)

type AgentTokenManager interface {
	Create(ctx context.Context, userID, name string) (string, models.AgentToken, error)
	List(ctx context.Context, userID string) ([]models.AgentToken, error)
	Revoke(ctx context.Context, userID, id string) error
}

type AgentTokenHandler struct {
	tokens AgentTokenManager
	// mcpBaseURL is the public address of the MCP service; the editor prints
	// mcpBaseURL + "/mcp" for the user to paste into their CLI.
	mcpBaseURL string
}

func NewAgentTokenHandler(tokens AgentTokenManager, mcpBaseURL string) *AgentTokenHandler {
	return &AgentTokenHandler{tokens: tokens, mcpBaseURL: strings.TrimRight(mcpBaseURL, "/")}
}

// PublicMCPURL is read at startup from PUBLIC_MCP_URL (for example
// https://mcp.example.com). The default suits local development.
func PublicMCPURL() string {
	if v := os.Getenv("PUBLIC_MCP_URL"); v != "" {
		return v
	}
	return "http://localhost:8090"
}

func (h *AgentTokenHandler) userID(c *fiber.Ctx) string {
	id, _ := c.Locals("userId").(string)
	return id
}

func (h *AgentTokenHandler) Create(c *fiber.Ctx) error {
	var body struct {
		Name string `json:"name"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	secret, tok, err := h.tokens.Create(c.UserContext(), h.userID(c), body.Name)
	switch {
	case errors.Is(err, agenttokens.ErrBadName):
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	case errors.Is(err, agenttokens.ErrTooManyTokens):
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": err.Error()})
	case err != nil:
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "could not create token"})
	}
	// The secret appears in this response only.
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id": tok.Id, "name": tok.Name, "prefix": tok.Prefix, "createdAt": tok.CreatedAt,
		"token": secret, "mcpUrl": h.mcpBaseURL + "/mcp",
	})
}

func (h *AgentTokenHandler) List(c *fiber.Ctx) error {
	tokens, err := h.tokens.List(c.UserContext(), h.userID(c))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "could not list tokens"})
	}
	return c.JSON(tokens)
}

func (h *AgentTokenHandler) Revoke(c *fiber.Ctx) error {
	err := h.tokens.Revoke(c.UserContext(), h.userID(c), c.Params("id"))
	if errors.Is(err, agenttokens.ErrTokenNotFound) {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "token not found"})
	}
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "could not revoke token"})
	}
	return c.SendStatus(fiber.StatusNoContent)
}
```

In `$API/internal/routes/privateRoutes.routes.go`, after the `notificationHandler` line add (and import `"my-go-app/internal/agenttokens"`):

```go
	agentTokenHandler := handlers.NewAgentTokenHandler(agenttokens.NewService(repos.AgentTokenRepository), handlers.PublicMCPURL())
```

and after the `group := app.Group(...)` line add:

```go
	group.Post("/agent-tokens", agentTokenHandler.Create)
	group.Get("/agent-tokens", agentTokenHandler.List)
	group.Delete("/agent-tokens/:id", agentTokenHandler.Revoke)
```

The handler reads `c.Locals("userId")`. Confirm that is the key the existing private handlers read: open `internal/handlers/notification.handler.go` (or whichever handler is nearest) and use the exact same accessor if it differs.

- [ ] **Step 9: Run everything and commit**

Run: `cd $API && go build ./... && go test ./internal/agenttokens ./internal/handlers -v`
Expected: PASS. Apply migration `00005` the way the repo normally does (goose at startup, or the repo's documented migrate command) and confirm the table exists.

```bash
cd $API && git add migrations internal && git commit -m "feat(agent): personal access tokens with create, list and revoke" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task A2: Realtime bridge: deliver requests to the most recent tab, return responses

**Files:**
- Modify: `$API/internal/realtime/domain/entity/message.go`, `$API/internal/realtime/delivery/ws/entity/client.go`, `$API/internal/realtime/delivery/ws/entity/room.go`, `$API/internal/realtime/delivery/ws/entity/hub.go`, `$API/internal/realtime/delivery/ws/handlers/handler.go`
- Create: `$API/internal/realtime/delivery/ws/handlers/agent_handlers.go`
- Test: `$API/internal/realtime/delivery/ws/handlers/agent_handlers_test.go`

**Interfaces:**
- Consumes: `agentproto` (copied here in Step 0 from Task M2 of the MCP service plan); hub rooms are keyed `projectID` or `projectID:pageID`; `Room.clients map[*Client]bool` guarded by `Room.mu`.
- Produces:

```go
// message.go
TypeAgentRequest  MessageType = "agent:request"
TypeAgentResponse MessageType = "agent:response"
// client.go
func (c *Client) Touch()                 // marks the client active now
func (c *Client) LastActiveUnixNano() int64
// hub.go
func (h *Hub) MostRecentClient(projectID, userID string) *Client
// agent_handlers.go
type agentTarget interface{ Send(domainEntity.Message) error }
type agentLocator interface{ MostRecentClient(projectID, userID string) agentTarget }
type claimer interface{ Claim(ctx context.Context, requestID string) (bool, error) } // true for exactly one caller per request id
type redisClaimer struct{ rdb *redis.Client }  // SET agent:claim:<id> NX EX 30
func newAgentBridge(loc agentLocator, bus agentproto.Bus, claim claimer, lg logger.Logger) *agentBridge
func (b *agentBridge) Run(ctx context.Context)
func (b *agentBridge) handleResponse(ctx context.Context, from agentTarget, msg domainEntity.Message) error
```

- [ ] **Step 0: Copy the wire types from the MCP service and pin them**

The API and the MCP service talk over Redis in the JSON defined by `agentproto`. Each repo carries its own copy (the MCP service's `internal/` cannot be imported), pinned by the same golden test.

```bash
cd $API && mkdir -p internal/agentproto
cp $MCP/internal/agentproto/agentproto.go $MCP/internal/agentproto/bus.go $MCP/internal/agentproto/bus_test.go $MCP/internal/agentproto/wire_test.go internal/agentproto/
go test ./internal/agentproto -v
```
Expected: PASS (the files import only the standard library and go-redis, which the API already uses). If you are working before Plan 1's Task M2 exists, write the files from that task first.

- [ ] **Step 1: Write the failing bridge tests**

```go
// $API/internal/realtime/delivery/ws/handlers/agent_handlers_test.go
package handlers

import (
	"context"
	"encoding/json"
	"sync"
	"testing"
	"time"

	"my-go-app/internal/agentproto"
	domainEntity "my-go-app/internal/realtime/domain/entity"
	"my-go-app/internal/realtime/utils/logger"
)

type fakeTab struct {
	mu   sync.Mutex
	sent []domainEntity.Message
}

func (f *fakeTab) Send(m domainEntity.Message) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.sent = append(f.sent, m)
	return nil
}
func (f *fakeTab) count() int { f.mu.Lock(); defer f.mu.Unlock(); return len(f.sent) }

type fakeLocator struct{ byUser map[string]agentTarget } // key: project/user

func (f fakeLocator) MostRecentClient(project, user string) agentTarget {
	if t, ok := f.byUser[project+"/"+user]; ok {
		return t
	}
	return nil
}

func waitFor(t *testing.T, what string, cond func() bool) {
	t.Helper()
	deadline := time.Now().Add(time.Second)
	for time.Now().Before(deadline) {
		if cond() {
			return
		}
		time.Sleep(5 * time.Millisecond)
	}
	t.Fatalf("timed out waiting for %s", what)
}

func request(bus agentproto.Bus, id string) {
	b, _ := json.Marshal(agentproto.Request{RequestID: id, UserID: "u1", ProjectID: "p1", PageID: "pg1", Tool: "get_code", Args: json.RawMessage(`{}`)})
	_ = bus.Publish(context.Background(), agentproto.RequestChannelPrefix+"u1", b)
}

func startBridge(t *testing.T, loc agentLocator, bus agentproto.Bus) {
	t.Helper()
	ctx, cancel := context.WithCancel(context.Background())
	t.Cleanup(cancel)
	b := newAgentBridge(loc, bus, newMemClaimer(), logger.Default())
	ready := make(chan struct{})
	go func() { b.Run(ctx); close(ready) }()
	time.Sleep(20 * time.Millisecond) // Run subscribes first thing
}

type memClaimer struct {
	mu   sync.Mutex
	seen map[string]bool
}

func newMemClaimer() *memClaimer { return &memClaimer{seen: map[string]bool{}} }
func (m *memClaimer) Claim(_ context.Context, id string) (bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.seen[id] {
		return false, nil
	}
	m.seen[id] = true
	return true, nil
}

// Review Focus 1: two API instances both hear the request; only one delivers.
func TestTwoInstancesDeliverARequestToExactlyOneTab(t *testing.T) {
	bus := &agentproto.MemBus{}
	claims := newMemClaimer() // shared, like Redis
	tabA, tabB := &fakeTab{}, &fakeTab{}
	for _, tab := range []*fakeTab{tabA, tabB} {
		b := newAgentBridge(fakeLocator{byUser: map[string]agentTarget{"p1/u1": tab}}, bus, claims, logger.Default())
		ctx, cancel := context.WithCancel(context.Background())
		t.Cleanup(cancel)
		go b.Run(ctx)
	}
	time.Sleep(30 * time.Millisecond)
	request(bus, "r4")
	waitFor(t, "a delivery", func() bool { return tabA.count()+tabB.count() >= 1 })
	time.Sleep(100 * time.Millisecond)
	if got := tabA.count() + tabB.count(); got != 1 {
		t.Fatalf("the request reached %d tabs, want exactly 1", got)
	}
}

func TestBridgeDeliversToTheTabAcksAndReturnsItsResponse(t *testing.T) {
	bus := &agentproto.MemBus{}
	tab := &fakeTab{}
	acks, stopAcks, _ := bus.PSubscribe(context.Background(), agentproto.AckChannelPrefix+"r1")
	defer stopAcks()
	resps, stopResps, _ := bus.PSubscribe(context.Background(), agentproto.ResponseChannelPrefix+"r1")
	defer stopResps()
	loc := fakeLocator{byUser: map[string]agentTarget{"p1/u1": tab}}
	b := newAgentBridge(loc, bus, newMemClaimer(), logger.Default())
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go b.Run(ctx)
	time.Sleep(20 * time.Millisecond)

	request(bus, "r1")
	waitFor(t, "ws delivery", func() bool { return tab.count() == 1 })
	if m := tab.sent[0]; m.Type != domainEntity.TypeAgentRequest || m.RequestID != "r1" || m.PageID != "pg1" {
		t.Fatalf("delivered %+v", m)
	}
	select {
	case <-acks:
	case <-time.After(time.Second):
		t.Fatal("no ack")
	}

	reply := domainEntity.Message{Type: domainEntity.TypeAgentResponse, RequestID: "r1", Payload: json.RawMessage(`{"ok":true,"result":{"code":"x"}}`)}
	if err := b.handleResponse(context.Background(), tab, reply); err != nil {
		t.Fatal(err)
	}
	select {
	case m := <-resps:
		var r agentproto.Response
		_ = json.Unmarshal(m.Payload, &r)
		if !r.OK || r.RequestID != "r1" {
			t.Fatalf("%+v", r)
		}
	case <-time.After(time.Second):
		t.Fatal("no response published")
	}
}

func TestBridgeStaysSilentWhenTheUserHasNoTab(t *testing.T) {
	bus := &agentproto.MemBus{}
	acks, stop, _ := bus.PSubscribe(context.Background(), agentproto.AckChannelPrefix+"r2")
	defer stop()
	startBridge(t, fakeLocator{}, bus)
	request(bus, "r2")
	select {
	case <-acks:
		t.Fatal("must not ack when there is nobody to deliver to")
	case <-time.After(100 * time.Millisecond):
	}
}

func TestResponseFromANonAddressedSessionIsRejected(t *testing.T) {
	bus := &agentproto.MemBus{}
	addressed, other := &fakeTab{}, &fakeTab{}
	resps, stop, _ := bus.PSubscribe(context.Background(), agentproto.ResponseChannelPrefix+"r3")
	defer stop()
	b := newAgentBridge(fakeLocator{byUser: map[string]agentTarget{"p1/u1": addressed}}, bus, newMemClaimer(), logger.Default())
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	go b.Run(ctx)
	time.Sleep(20 * time.Millisecond)
	request(bus, "r3")
	waitFor(t, "delivery", func() bool { return addressed.count() == 1 })

	forged := domainEntity.Message{Type: domainEntity.TypeAgentResponse, RequestID: "r3", Payload: json.RawMessage(`{"ok":true}`)}
	if err := b.handleResponse(context.Background(), other, forged); err == nil {
		t.Fatal("a response from a session that was not sent the request must be rejected")
	}
	select {
	case <-resps:
		t.Fatal("nothing may be published for a rejected response")
	case <-time.After(50 * time.Millisecond):
	}
	// A request id is single use: the right session's first answer works, a replay does not.
	if err := b.handleResponse(context.Background(), addressed, forged); err != nil {
		t.Fatal(err)
	}
	if err := b.handleResponse(context.Background(), addressed, forged); err == nil {
		t.Fatal("a replayed response must be rejected")
	}
}
```

Add a Hub test in `$API/internal/realtime/delivery/ws/entity/` only if a hub test helper already exists for registering fake clients; otherwise cover `MostRecentClient` through the bridge test above (its locator is the seam) and a small direct test of `Client.Touch`/`LastActiveUnixNano` ordering:

```go
// $API/internal/realtime/delivery/ws/entity/client_active_test.go
package entity

import (
	"testing"
	"time"
)

func TestTouchOrdersClientsByRecency(t *testing.T) {
	a, b := &Client{}, &Client{}
	a.Touch()
	time.Sleep(2 * time.Millisecond)
	b.Touch()
	if !(b.LastActiveUnixNano() > a.LastActiveUnixNano()) {
		t.Fatal("the later Touch must have the larger timestamp")
	}
}
```

- [ ] **Step 2: Run to confirm it fails**

Run: `cd $API && go test ./internal/realtime/delivery/ws/... -run 'Bridge|Response|Touch' -v`
Expected: FAIL to compile.

- [ ] **Step 3: Message types, client activity, hub lookup**

In `domain/entity/message.go`, add to the const block (after `TypeSnapshot`/`TypeError`):

```go
	TypeAgentRequest  MessageType = "agent:request"  // CLI tool call for the user's tab
	TypeAgentResponse MessageType = "agent:response" // the tab's answer
```

In `ws/entity/client.go`, add the field `lastActive atomic.Int64` to `Client` (import `"sync/atomic"`) and:

```go
// Touch marks the client as active now. Any message from the tab counts.
func (c *Client) Touch() { c.lastActive.Store(time.Now().UnixNano()) }

func (c *Client) LastActiveUnixNano() int64 { return c.lastActive.Load() }
```

In `NewClient`, call `c.Touch()` on the new client before returning (so a fresh tab is "recent").

In `ws/entity/room.go`, add (copy the locking style of `GetParticipants`, which already reads `clients` under `r.mu`):

```go
// ClientsOf returns the room's clients belonging to userID.
func (r *Room) ClientsOf(userID string) []*Client {
	r.mu.Lock()
	defer r.mu.Unlock()
	var out []*Client
	for c := range r.clients {
		if c.User != nil && c.User.ID == userID {
			out = append(out, c)
		}
	}
	return out
}
```

In `ws/entity/hub.go`, add:

```go
// MostRecentClient returns the user's most recently active connection to any
// page of the project on this instance, or nil.
func (h *Hub) MostRecentClient(projectID, userID string) *Client {
	h.mu.RLock()
	rooms := make([]*Room, 0, len(h.rooms))
	for id, r := range h.rooms {
		if id == projectID || strings.HasPrefix(id, projectID+":") {
			rooms = append(rooms, r)
		}
	}
	h.mu.RUnlock()

	var best *Client
	for _, r := range rooms {
		for _, c := range r.ClientsOf(userID) {
			if best == nil || c.LastActiveUnixNano() > best.LastActiveUnixNano() {
				best = c
			}
		}
	}
	return best
}
```

- [ ] **Step 4: The bridge**

```go
// $API/internal/realtime/delivery/ws/handlers/agent_handlers.go
package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"

	"my-go-app/internal/agentproto"
	wsentity "my-go-app/internal/realtime/delivery/ws/entity"
	domainEntity "my-go-app/internal/realtime/domain/entity"
	domainErrors "my-go-app/internal/realtime/domain/errors"
	"my-go-app/internal/realtime/utils/logger"
)

// agentTarget is a connected editor tab. *wsentity.Client implements it.
type agentTarget interface {
	Send(domainEntity.Message) error
}

type agentLocator interface {
	MostRecentClient(projectID, userID string) agentTarget
}

// hubLocator adapts the hub (which returns a concrete *Client, and a nil
// *Client must not become a non-nil interface).
type hubLocator struct{ hub *wsentity.Hub }

func (l hubLocator) MostRecentClient(projectID, userID string) agentTarget {
	if c := l.hub.MostRecentClient(projectID, userID); c != nil {
		return c
	}
	return nil
}

// redisClaimer lets exactly one API instance deliver a given request.
type redisClaimer struct{ rdb *redis.Client }

func (c redisClaimer) Claim(ctx context.Context, requestID string) (bool, error) {
	return c.rdb.SetNX(ctx, "agent:claim:"+requestID, 1, 30*time.Second).Result()
}

// agentBridge connects the MCP relay (Redis) to editor tabs (WebSocket).
type agentBridge struct {
	loc    agentLocator
	bus    agentproto.Bus
	claim  claimer
	logger logger.Logger

	mu     sync.Mutex
	issued map[string]agentTarget // requestId -> the session it was sent to
}

func newAgentBridge(loc agentLocator, bus agentproto.Bus, claim claimer, lg logger.Logger) *agentBridge {
	return &agentBridge{loc: loc, bus: bus, claim: claim, logger: lg, issued: map[string]agentTarget{}}
}

// Run delivers requests until ctx ends. It subscribes before returning control
// to the loop, so call it in its own goroutine.
func (b *agentBridge) Run(ctx context.Context) {
	reqs, stop, err := b.bus.PSubscribe(ctx, agentproto.RequestChannelPrefix+"*")
	if err != nil {
		b.logger.Errorf("agent bridge: subscribe failed: %v", err)
		return
	}
	defer stop()
	for {
		select {
		case <-ctx.Done():
			return
		case m, ok := <-reqs:
			if !ok {
				return
			}
			var req agentproto.Request
			if err := json.Unmarshal(m.Payload, &req); err != nil || req.RequestID == "" || req.UserID == "" {
				b.logger.Errorf("agent bridge: bad request payload: %v", err)
				continue
			}
			b.deliver(ctx, req)
		}
	}
}

func (b *agentBridge) deliver(ctx context.Context, req agentproto.Request) {
	target := b.loc.MostRecentClient(req.ProjectID, req.UserID)
	if target == nil {
		return // another instance may hold the tab; with none anywhere the relay times out on the missing ack
	}
	// Every API instance hears every request. Only the instance that wins the
	// claim delivers, so a user with tabs on two instances still gets one edit.
	if won, err := b.claim.Claim(ctx, req.RequestID); err != nil || !won {
		return
	}
	payload, _ := json.Marshal(map[string]any{"tool": req.Tool, "args": req.Args, "pageId": req.PageID})
	b.mu.Lock()
	b.issued[req.RequestID] = target
	b.mu.Unlock()
	msg := domainEntity.Message{
		Type: domainEntity.TypeAgentRequest, ProjectID: req.ProjectID, PageID: req.PageID,
		RequestID: req.RequestID, Payload: payload,
	}
	if err := target.Send(msg); err != nil {
		b.mu.Lock()
		delete(b.issued, req.RequestID)
		b.mu.Unlock()
		return
	}
	ack, _ := json.Marshal(struct{}{})
	_ = b.bus.Publish(ctx, agentproto.AckChannelPrefix+req.RequestID, ack)
}

// handleResponse accepts the tab's answer only from the session the request
// was sent to, and only once.
func (b *agentBridge) handleResponse(ctx context.Context, from agentTarget, msg domainEntity.Message) error {
	b.mu.Lock()
	want, ok := b.issued[msg.RequestID]
	if ok && want == from {
		delete(b.issued, msg.RequestID)
	}
	b.mu.Unlock()
	if !ok || want != from {
		return domainErrors.New(domainErrors.CodeValidation, "unknown agent request", errors.New("response from a session that was not addressed"))
	}
	var resp agentproto.Response
	if err := json.Unmarshal(msg.Payload, &resp); err != nil {
		resp = agentproto.Response{Error: &agentproto.Error{Code: agentproto.CodeInternal, Message: "the editor sent an unreadable response"}}
	}
	resp.RequestID = msg.RequestID
	out, _ := json.Marshal(resp)
	return b.bus.Publish(ctx, agentproto.ResponseChannelPrefix+msg.RequestID, out)
}
```

Note: `domainErrors.New(code, message, cause)` is the constructor used in `handler.go` (`domainErrors.New(domainErrors.CodeAccessDenied, "...", nil)`).

- [ ] **Step 5: Wire it into the handler**

In `handler.go`:
- Add field `agents *agentBridge` to `Handler`.
- In `NewHandler`, after `h.hub = wsentity.NewHub(...)` and before `h.registerHandlers()`: if `rdb != nil`, `h.agents = newAgentBridge(hubLocator{h.hub}, agentproto.NewRedisBus(rdb), redisClaimer{rdb}, lg)` then `h.wg.Add(1); go func(){ defer h.wg.Done(); h.agents.Run(h.ctx) }()`. (Import `"my-go-app/internal/agentproto"`.)
- In `registerHandlers`, add inside the map only when the bridge exists. Since the map literal is built in one expression, add after it:

```go
	if h.agents != nil {
		h.handlers[domainEntity.TypeAgentResponse] = func(ctx context.Context, c *wsentity.Client, msg domainEntity.Message) error {
			return h.agents.handleResponse(ctx, c, msg)
		}
	}
```

- In `processMessage`, first line after the `msg.ProjectID = ...` assignments: `client.Touch()`. `TypeAgentResponse` is intentionally not in `mutating`, so read-only collaborators' tabs can answer `get_code`.

- [ ] **Step 6: Run and commit**

Run: `cd $API && go build ./... && go test ./internal/realtime/... ./internal/agent/... ./internal/agentproto/... 2>&1 | tail -30`
Expected: PASS (integration tests that need Postgres or Redis skip themselves as before).

```bash
cd $API && git add internal && git commit -m "feat(realtime): bridge agent requests to the user's most recent editor tab" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---
