# Connect your CLI

Connect Claude Code or Codex CLI to Webbuilder to read projects and edit the page open in your builder. The CLI uses your access and permissions; keep the project open while it works.

1. Open your project and the page you want to edit in the builder.
2. Click **CLI** in the editor top bar and create a named token.
3. Copy and paste the printed commands into your terminal. For Codex CLI, run both commands in order. The token is shown only once; keep it private.

The CLI can use these tools:

| Tool | What it does |
| --- | --- |
| `list_pages` | List the pages in a project. |
| `get_page` | Read a page's element tree. |
| `get_selection` | Read the selected elements in the open editor. |
| `get_code` | Read the generated code from the open editor. |
| `apply_edits` | Create, update, move, or delete elements on the open page. |
| `set_code` | Replace the open page from edited generated code. |

If the CLI reports an error:

| Error | What to do |
| --- | --- |
| `no_editor_session` | Open the project in the builder and try again. |
| `editor_timeout` | Check that the editor is connected and responsive, then check the page before retrying. |
| `invalid_edit` | Ask the CLI to correct the reported issues and retry. |
| `forbidden` | Ask a project owner for edit access or use an account with edit permission. |
| `page_not_open` | Open the requested page in the builder and retry. |

Each successful edit is one undo step. Click **Undo** in the change notification or use the usual editor undo. To revoke a token, open **CLI** and click the revoke button beside its name. Revocation takes effect immediately.
