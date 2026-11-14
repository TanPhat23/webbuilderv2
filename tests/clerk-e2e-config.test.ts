import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { clerkTestConfig, collaborationTestConfig, withClerkKeyFallback } from '../e2e/clerk-test-config';

const valid = { CLERK_PUBLISHABLE_KEY: 'pk_test_example', CLERK_SECRET_KEY: 'sk_test_example', E2E_EMAIL: 'tester+clerk_test@example.com' };

test('uses only missing Clerk keys from the app environment', () => {
  const target: NodeJS.ProcessEnv = { E2E_EMAIL: valid.E2E_EMAIL, CLERK_SECRET_KEY: 'sk_test_explicit' };
  withClerkKeyFallback(target, { CLERK_PUBLISHABLE_KEY: 'pk_test_fallback', CLERK_SECRET_KEY: 'sk_test_fallback', DATABASE_URL: 'must-not-be-imported' });
  assert.deepEqual(target, { E2E_EMAIL: valid.E2E_EMAIL, CLERK_PUBLISHABLE_KEY: 'pk_test_fallback', CLERK_SECRET_KEY: 'sk_test_explicit' });
});

test('test-user emails fall back to the app environment but never override', () => {
  const target: NodeJS.ProcessEnv = { E2E_EMAIL: 'explicit+clerk_test@example.com' };
  withClerkKeyFallback(target, { E2E_EMAIL: 'fallback@example.com', E2E_COLLAB_EMAIL: 'editor+clerk_test@example.com', E2E_PASSWORD: 'must-not-be-imported' });
  assert.deepEqual(target, { E2E_EMAIL: 'explicit+clerk_test@example.com', E2E_COLLAB_EMAIL: 'editor+clerk_test@example.com' });
});

test('requires a development Clerk instance and an explicit test user', () => {
  assert.deepEqual(clerkTestConfig(valid), { email: valid.E2E_EMAIL });
  for (const env of [
    { ...valid, CLERK_SECRET_KEY: 'sk_live_example' },
    { ...valid, CLERK_PUBLISHABLE_KEY: 'pk_live_example' },
    { ...valid, E2E_EMAIL: '' },
    { ...valid, CLERK_SECRET_KEY: undefined },
  ]) assert.throws(() => clerkTestConfig(env));
});

test('collaboration testing requires two distinct users and an isolated local API', () => {
  assert.equal(collaborationTestConfig(valid), null);
  const env = { ...valid, E2E_COLLAB: '1', E2E_COLLAB_EMAIL: 'editor+clerk_test@example.com', E2E_TEST_API_URL: 'http://127.0.0.1:8080' };
  assert.deepEqual(collaborationTestConfig(env), { email: env.E2E_COLLAB_EMAIL, apiURL: env.E2E_TEST_API_URL });
  for (const bad of [
    { ...env, E2E_COLLAB_EMAIL: valid.E2E_EMAIL.toUpperCase() },
    { ...env, E2E_COLLAB_EMAIL: '' },
    { ...env, E2E_TEST_API_URL: 'https://example.com' },
    { ...env, E2E_TEST_API_URL: '' },
    { ...env, E2E_TEST_API_URL: 'http://localhost:8080/path' },
    { ...env, E2E_TEST_API_URL: 'http://user:password@localhost:8080' },
  ]) assert.throws(() => collaborationTestConfig(bad));
});
