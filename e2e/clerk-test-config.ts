/** Copy only missing Clerk keys and test-user emails; never inherit unrelated app settings. */
export function withClerkKeyFallback(target: NodeJS.ProcessEnv, appEnv: Record<string, string>): void {
  for (const key of ['CLERK_PUBLISHABLE_KEY', 'CLERK_SECRET_KEY', 'E2E_EMAIL', 'E2E_COLLAB_EMAIL'] as const) {
    if (!target[key] && appEnv[key]) target[key] = appEnv[key];
  }
}

/** Validate the credentials before any browser signs in. Never print their values. */
export function clerkTestConfig(env: NodeJS.ProcessEnv): { email: string } {
  if (!env.CLERK_PUBLISHABLE_KEY?.startsWith('pk_test_')) {
    throw new Error('Set CLERK_PUBLISHABLE_KEY to a Clerk development instance key.');
  }
  if (!env.CLERK_SECRET_KEY?.startsWith('sk_test_')) {
    throw new Error('Set CLERK_SECRET_KEY to the matching Clerk development instance secret.');
  }
  const email = env.E2E_EMAIL?.trim();
  if (!email) throw new Error('Set E2E_EMAIL to an existing dedicated Clerk test user.');
  return { email };
}

/** Opt-in collaboration tests create a temporary project against a local test API. */
export function collaborationTestConfig(env: NodeJS.ProcessEnv): { email: string; apiURL: string } | null {
  if (env.E2E_COLLAB !== '1') return null;
  const first = clerkTestConfig(env).email;
  const email = env.E2E_COLLAB_EMAIL?.trim();
  if (!email || email.toLowerCase() === first.toLowerCase()) throw new Error('Set E2E_COLLAB_EMAIL to a distinct dedicated test user.');
  let url: URL;
  try { url = new URL(env.E2E_TEST_API_URL ?? ''); } catch { throw new Error('Set E2E_TEST_API_URL to the local isolated test API origin.'); }
  if (!['http:', 'https:'].includes(url.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error('E2E_TEST_API_URL must be a local HTTP origin without credentials or a path.');
  }
  return { email, apiURL: url.origin };
}
