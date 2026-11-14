import { clerkSetup } from '@clerk/testing/playwright';
import { clerkTestConfig } from './clerk-test-config';

// Runs once in the runner process, so the Clerk testing token and Frontend API
// URL it stores in process.env reach every worker. Calling it from a setup
// test would set them only in that test's worker, and later clerk.signIn calls
// in other workers would fail.
export default async function globalSetup() {
  clerkTestConfig(process.env);
  await clerkSetup();
}
