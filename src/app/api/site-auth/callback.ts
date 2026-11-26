import { createFileRoute } from "@tanstack/react-router";
import { sanitizeRedirectPath } from "@/lib/site-auth";
import {
  buildSessionSetCookie,
  isSecureRequest,
  loadProjectAuthConfigForSite,
  supabaseVerifyOtp,
} from "@/features/preview/lib/supabase-site-auth.server";

const ALLOWED_OTP_TYPES = new Set([
  "signup",
  "magiclink",
  "recovery",
  "invite",
  "email",
  "email_change",
]);

function renderHashHandoffHtml(projectId: string, nextPath: string): string {
  const payload = JSON.stringify({ projectId, next: nextPath }).replace(
    /</g,
    "\\u003c",
  );
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Signing in…</title></head>
<body style="font-family:system-ui,sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;color:#52525b;font-size:14px">
<div id="status">Completing sign-in…</div>
<script>
(async function () {
  var cfg = ${payload};
  var hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  var accessToken = hash.get("access_token");
  var refreshToken = hash.get("refresh_token") || undefined;
  var expiresInRaw = Number(hash.get("expires_in"));
  var expiresIn = Number.isFinite(expiresInRaw) && expiresInRaw > 0 ? Math.floor(expiresInRaw) : undefined;
  if (!accessToken) {
    document.getElementById("status").textContent = "Sign-in link is missing or expired.";
    return;
  }
  try {
    var res = await fetch("/api/site-auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: cfg.projectId, accessToken: accessToken, refreshToken: refreshToken, expiresIn: expiresIn, next: cfg.next })
    });
    var data = await res.json();
    if (!res.ok) {
      document.getElementById("status").textContent = data.error || "Sign-in failed.";
      return;
    }
    window.location.replace(data.redirectTo || cfg.next || "/");
  } catch (e) {
    document.getElementById("status").textContent = "Sign-in failed. Please try again.";
  }
})();
</script>
</body>
</html>`;
}

export const Route = createFileRoute("/api/site-auth/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const projectId = url.searchParams.get("projectId")?.trim() ?? "";
        const nextParam = sanitizeRedirectPath(url.searchParams.get("next"), "/");
        if (!projectId) {
          return new Response("Missing projectId", { status: 400 });
        }

        const tokenHash = url.searchParams.get("token_hash")?.trim();
        const type = url.searchParams.get("type")?.trim().toLowerCase();

        if (tokenHash && type && ALLOWED_OTP_TYPES.has(type)) {
          const cfg = await loadProjectAuthConfigForSite(projectId);
          if (!cfg) {
            return new Response("Supabase Auth is not configured", { status: 400 });
          }
          const verified = await supabaseVerifyOtp(cfg, tokenHash, type);
          if (!verified.ok) {
            return new Response(verified.message, { status: 401 });
          }
          const redirectTo = sanitizeRedirectPath(
            nextParam,
            cfg.afterLoginPath ?? "/",
          );
          const cookie = buildSessionSetCookie(
            projectId,
            verified.session,
            isSecureRequest(request),
          );
          return new Response(null, {
            status: 302,
            headers: {
              Location: redirectTo,
              "Set-Cookie": cookie,
              "Cache-Control": "private, no-store",
            },
          });
        }

        return new Response(renderHashHandoffHtml(projectId, nextParam), {
          status: 200,
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "private, no-store",
          },
        });
      },
    },
  },
});
