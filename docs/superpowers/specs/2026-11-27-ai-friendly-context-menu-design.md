# AI-friendly editor context menu — design

Date: 2026-11-27. Approved by the user.

## Goal
Make the element right-click menu (apps/editor/src/features/editor/components/EditorContextMenu.tsx) useful for AI work in three ways.

## 1. "Ask AI" submenu
- New submenu "Ask AI" (lucide `Sparkles` icon) placed after the clipboard group.
- Items: the existing `ELEMENT_STARTER_ACTIONS` from apps/editor/src/features/ai/utils/aiChatUtils.ts (Polish layout, Make responsive, Sharpen copy, Align to theme) — reuse their `label`, `scope` and `buildPrompt`; do not copy prompt text — plus a final "Ask about this element…" item (scope "element", empty prompt).
- Picking an item calls a new `askAi({ prompt, scope })` on the AI chat context (apps/editor/src/features/ai/context/AiChatContext.ts, provider apps/editor/src/providers/aiprovider.tsx). `askAi` opens the chat and stores a pending request (with a unique nonce so the same request twice still applies).
- AiChatPanel consumes the pending request once: switches to the Chat tab, `setDraft(prompt)`, `setPreferredScope(scope)`, focuses the composer, then clears the request. It never auto-sends.
- The element is already selected when the menu opens (canvas and Layers panel select before opening), so the chat's existing selected-element scoping applies.
- The menu must render where no AI provider exists (Layers panel, test fixtures): read the context without throwing (an optional hook); when absent, hide the submenu.
- Disabled when read-only or locked (same `canEdit` rule as other edit actions).

## 2. "Copy for AI agent"
- Item "Copy for AI agent" (lucide `Bot` icon) next to the Ask AI submenu; enabled even when read-only (it only reads).
- Copies a Markdown block built by a pure function (new file in features/ai/utils, unit-tested), e.g.:
  ```
  Webbuilder element reference
  - Element ID: <id>
  - Type: <type>
  - Name: <name>
  - Page ID: <pageId>          (when known)
  - Path: Section "Hero" › Frame › Text "Title"
  - Classes: <tailwindStyles, untruncated>
  - Text: <content, max 500 chars>
  Edit this element with the webbuilder MCP tools, targeting the Element ID above.
  ```
  Omit lines whose value is empty. Ancestor path is computed from the element tree (parentId chain) root → element.
- Uses navigator.clipboard.writeText; toast success / failure (sonner, as elsewhere).

## 3. Machine-readable menu
- Every item gets a stable `data-action` (copy, cut, paste, bring-to-front, send-to-back, ask-ai, ask-ai-<starter id>, ask-ai-custom, copy-for-agent, create-component, save-to-library, delete; the shared-section submenu trigger gets shared-section).
- Items with shortcuts get `aria-keyshortcuts` ("Control+C" / "Meta+C" matching platform, "Delete").
- Menu content gets `aria-label="Actions for <element name or type>"`.
- Keyboard: Shift+F10 or the ContextMenu key, when an element is selected and focus is on the canvas (same target rules as useEditorShortcuts: stage/body/iframe, not inputs/dialogs), opens the menu for the selected element positioned at the element's on-screen centre (dispatch a contextmenu event at the element node; contextMenuRetarget's routeSiteContextMenu must route it). preventDefault the native menu.

## Non-goals
No server/API changes, no auto-send, no new AI actions beyond the existing starters.
