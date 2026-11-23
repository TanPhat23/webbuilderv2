/**
 * One-stop environment for editor component tests. Import this FIRST in a test
 * file (before any `src` module): it installs jsdom, redirects the router /
 * clerk / start packages to stubs, and re-exports the mount helpers.
 */
import './editor-dom-harness';
import { redirectModules } from './test-stub-modules';

redirectModules({
  '@clerk/tanstack-react-start': './test-clerk-stub.ts',
  '@tanstack/react-router': './editor-router-stub.ts',
  '@tanstack/react-start': './test-start-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
});

/** Network is never available in unit tests: any fetch rejects and is recorded. */
export const fetchCalls: string[] = [];
globalThis.fetch = (async (input: unknown) => {
  fetchCalls.push(String(input));
  throw new Error('network disabled in tests');
}) as typeof fetch;

export * from './editor-dom-mount';
