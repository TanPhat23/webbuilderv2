import { useState, type ChangeEvent, type ReactElement } from "react";
import { AlertCircle, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  validateSupabaseAnonKey,
  validateSupabaseUrl,
} from "@webbuilder/site-runtime/auth";

interface AuthTabProps {
  readonly authEnabled: boolean;
  readonly supabaseUrl: string;
  readonly supabaseAnonKey: string;
  readonly loginPath: string;
  readonly afterLoginPath: string;
  readonly disabled: boolean;
  readonly onAuthEnabledChange: (enabled: boolean) => void;
  readonly onSupabaseUrlChange: (value: string) => void;
  readonly onSupabaseAnonKeyChange: (value: string) => void;
  readonly onLoginPathChange: (value: string) => void;
  readonly onAfterLoginPathChange: (value: string) => void;
}

type TestResult =
  | { readonly status: "idle" }
  | { readonly status: "testing" }
  | { readonly status: "ok"; readonly message: string }
  | { readonly status: "error"; readonly message: string };

export function AuthTab({
  authEnabled,
  supabaseUrl,
  supabaseAnonKey,
  loginPath,
  afterLoginPath,
  disabled,
  onAuthEnabledChange,
  onSupabaseUrlChange,
  onSupabaseAnonKeyChange,
  onLoginPathChange,
  onAfterLoginPathChange,
}: AuthTabProps): ReactElement {
  const [testResult, setTestResult] = useState<TestResult>({ status: "idle" });

  const urlValidation =
    authEnabled && supabaseUrl.trim().length > 0
      ? validateSupabaseUrl(supabaseUrl)
      : null;
  const keyValidation =
    authEnabled && supabaseAnonKey.trim().length > 0
      ? validateSupabaseAnonKey(supabaseAnonKey)
      : null;

  const canTest =
    !disabled &&
    authEnabled &&
    validateSupabaseUrl(supabaseUrl).valid &&
    validateSupabaseAnonKey(supabaseAnonKey).valid &&
    testResult.status !== "testing";

  const handleTestConnection = async (): Promise<void> => {
    setTestResult({ status: "testing" });
    try {
      const response = await fetch("/api/site-auth/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supabaseUrl: supabaseUrl.trim(),
          supabaseAnonKey: supabaseAnonKey.trim(),
        }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const msg =
          body !== null &&
          typeof body === "object" &&
          "error" in body &&
          typeof (body as Record<string, unknown>).error === "string"
            ? (body as Record<string, string>).error
            : "Connection failed";
        setTestResult({ status: "error", message: msg });
        return;
      }
      const signupEnabled =
        body !== null &&
        typeof body === "object" &&
        "signupEnabled" in body &&
        (body as Record<string, unknown>).signupEnabled === true;
      setTestResult({
        status: "ok",
        message: signupEnabled
          ? "Connected — Email/Password & Magic Link ready"
          : "Connected — Email login ready (sign-ups disabled in Supabase)",
      });
    } catch {
      setTestResult({
        status: "error",
        message: "Network error while testing Supabase connection",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4 text-primary" />
                Supabase Site Authentication
              </CardTitle>
              <CardDescription className="mt-1">
                Delegate visitor login, sign-up, magic links, and protected pages to
                your Supabase project using server-verified HttpOnly cookies.
              </CardDescription>
            </div>
            <Switch
              id="project-auth-enabled"
              checked={authEnabled}
              disabled={disabled}
              onCheckedChange={(checked) => {
                onAuthEnabledChange(checked);
                setTestResult({ status: "idle" });
              }}
              aria-label="Enable Supabase Site Authentication"
            />
          </div>
        </CardHeader>

        {authEnabled && (
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="supabase-url">Supabase Project URL</Label>
              <Input
                id="supabase-url"
                type="url"
                value={supabaseUrl}
                disabled={disabled}
                placeholder="https://your-project.supabase.co"
                className="font-mono text-xs"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  onSupabaseUrlChange(event.target.value);
                  setTestResult({ status: "idle" });
                }}
              />
              {urlValidation && !urlValidation.valid && (
                <p className="text-xs text-destructive">{urlValidation.error}</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="supabase-anon-key">
                  Publishable / Anon Key
                </Label>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Public key only
                </Badge>
              </div>
              <Input
                id="supabase-anon-key"
                type="text"
                value={supabaseAnonKey}
                disabled={disabled}
                placeholder="sb_publishable_... or eyJhbGci..."
                className="font-mono text-xs"
                autoComplete="off"
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  onSupabaseAnonKeyChange(event.target.value);
                  setTestResult({ status: "idle" });
                }}
              />
              {keyValidation && !keyValidation.valid ? (
                <p className="text-xs text-destructive">{keyValidation.error}</p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Never paste your <code className="font-mono">service_role</code> or{" "}
                  <code className="font-mono">sb_secret_</code> key. Enable Row Level
                  Security (RLS) in Supabase.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!canTest}
                onClick={() => void handleTestConnection()}
              >
                {testResult.status === "testing" && (
                  <Spinner data-icon="inline-start" />
                )}
                Test Connection
              </Button>
              {testResult.status === "ok" && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5 shrink-0" />
                  {testResult.message}
                </span>
              )}
              {testResult.status === "error" && (
                <span className="flex items-center gap-1.5 text-xs text-destructive">
                  <AlertCircle className="size-3.5 shrink-0" />
                  {testResult.message}
                </span>
              )}
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-login-path">Login Page Path</Label>
                <Input
                  id="auth-login-path"
                  value={loginPath}
                  disabled={disabled}
                  placeholder="/login"
                  className="font-mono text-xs"
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    onLoginPathChange(event.target.value)
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  Where unauthenticated visitors are redirected from locked pages.
                </p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-after-login-path">After Login Path</Label>
                <Input
                  id="auth-after-login-path"
                  value={afterLoginPath}
                  disabled={disabled}
                  placeholder="/"
                  className="font-mono text-xs"
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    onAfterLoginPathChange(event.target.value)
                  }
                />
                <p className="text-[11px] text-muted-foreground">
                  Default landing page after sign-in when no <code className="font-mono">?next=</code> is set.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground space-y-1">
              <p className="font-medium text-foreground flex items-center gap-1.5">
                <Lock className="size-3.5" />
                Quick setup checklist
              </p>
              <p>
                1. Drop a <strong>Login</strong>, <strong>Sign Up</strong>, or{" "}
                <strong>Magic Link</strong> form onto your <code className="font-mono">{loginPath || "/login"}</code> page.
              </p>
              <p>
                2. Toggle <strong>Require Login</strong> in Page Settings on any page you want server-protected.
              </p>
              <p>
                3. For Magic Links, add <code className="font-mono">https://&lt;your-site&gt;/api/site-auth/callback</code> to Supabase Redirect URLs.
              </p>
              <p>
                4. Bind signed-in user info anywhere with{" "}
                <code className="font-mono">{"{{user.email}}"}</code> or{" "}
                <code className="font-mono">{"{{user.name}}"}</code>.
              </p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
