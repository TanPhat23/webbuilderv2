import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import type { InlineConfig, Plugin } from 'vite';

const root = resolve(import.meta.dirname, '../..');
const harnessHtml = '/tests/harness/index.html';
const harnessStub = (name: string): string => resolve(import.meta.dirname, 'stubs', name);
const fixture = (name: string): string => resolve(root, 'tests/fixtures', name);
const support = (name: string): string => resolve(root, 'tests/support', name);

/**
 * Module stubs shared by every harness consumer. Stub the surroundings (auth, server
 * functions, realtime transport, permissions), never the behaviour under test.
 */
export const harnessStubs: ReadonlyArray<readonly [RegExp, string]> = [
  [/^@tanstack\/react-start$/, support('test-start-stub.ts')],
  [/^@clerk\/tanstack-react-start$/, support('test-clerk-stub.ts')],
  [/^@clerk\/tanstack-react-start\/server$/, support('test-clerk-server-stub.ts')],
  [/^@\/features\/auth\/lib\/gettoken$/, fixture('interactions-pick-auth-stub.ts')],
  [/^@\/features\/editor\/lib\/dropElement$/, fixture('interactions-pick-drop-stub.ts')],
  [/^@\/features\/editor\/utils\/element\/create\/ElementFactory$/, fixture('interactions-pick-factory-stub.ts')],
  [/^@\/features\/editor\/hooks\/useEditorPermissions$/, harnessStub('permissions-stub.ts')],
  [/^@\/features\/projects\/api\/project\.api$/, harnessStub('api-stub.ts')],
  [/^@\/features\/elements\/services\/element\.service$/, harnessStub('api-stub.ts')],
  [/^@\/features\/collaboration$/, harnessStub('collaboration-stub.ts')],
];

/** Serves the harness page at `/` so agents can open `/?scenario=<name>`. */
const harnessIndex: Plugin = {
  name: 'harness-index',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const url = req.url ?? '/';
      if (url === '/' || url.startsWith('/?')) req.url = harnessHtml + url.slice(1);
      next();
    });
  },
};

export interface HarnessServerOptions {
  /** 0 picks a free port (browser tests); a number is used as is. */
  readonly port: number;
  readonly strictPort?: boolean;
}

/**
 * Vite config for the component harness. It never loads a config file or any `.env`
 * (`envDir: false`) and only listens on loopback.
 */
export function createHarnessConfig({ port, strictPort = false }: HarnessServerOptions): InlineConfig {
  return {
    root,
    configFile: false,
    envDir: false,
    clearScreen: false,
    optimizeDeps: { entries: [resolve(root, harnessHtml.slice(1))] },
    define: { 'process.env': '{}' },
    plugins: [harnessIndex, tailwindcss()],
    esbuild: { jsx: 'automatic' },
    resolve: {
      alias: [
        ...harnessStubs.map(([find, replacement]) => ({ find, replacement })),
        { find: '@', replacement: resolve(root, 'apps/editor/src') },
      ],
    },
    server: { host: '127.0.0.1', port, strictPort },
  };
}
