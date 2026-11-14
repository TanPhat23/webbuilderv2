// Prints the two dedicated Clerk test users as CSV rows for the "User" table
// ("Id","Email","FirstName","LastName","CreatedAt","UpdatedAt"), so
// scripts/e2e-collab.sh can seed a throwaway database. It reads the same env
// files as playwright.config.ts and refuses anything but development keys.
import { createClerkClient } from '@clerk/backend';
import { config } from 'dotenv';
import { clerkTestConfig, collaborationTestConfig, withClerkKeyFallback } from '../clerk-test-config';

config({ path: '.env.test', quiet: true });
withClerkKeyFallback(process.env, config({ path: '.env', processEnv: {}, quiet: true }).parsed ?? {});

const owner = clerkTestConfig(process.env).email;
const collaborator = collaborationTestConfig(process.env)?.email;
if (!collaborator) throw new Error('Run with E2E_COLLAB=1.');

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
const csv = (value: string | null | undefined) => (value == null ? '' : `"${value.replaceAll('"', '""')}"`);
const now = new Date().toISOString();

for (const email of [owner, collaborator]) {
  const { data } = await clerk.users.getUserList({ emailAddress: [email] });
  if (data.length !== 1) throw new Error(`Expected exactly one Clerk test user for ${email}, found ${data.length}.`);
  const user = data[0];
  console.log([user.id, email, user.firstName, user.lastName, now, now].map(csv).join(','));
}
