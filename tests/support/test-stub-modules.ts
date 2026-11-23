/**
 * Test-only module redirection. `node:test`'s `mock.module` needs an
 * experimental flag, so instead we register a synchronous resolve hook that
 * points selected bare specifiers at stub files. Call `redirectModules` BEFORE
 * dynamically importing the module under test.
 */
import { registerHooks } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const SUPPORT_DIR = pathToFileURL(path.resolve(import.meta.dirname) + path.sep).href;

export function redirectModules(map: Record<string, string>): void {
  const urls = new Map(
    Object.entries(map).map(([spec, file]) => [
      spec,
      pathToFileURL(path.resolve(import.meta.dirname, file)).href,
    ]),
  );
  registerHooks({
    resolve(specifier, context, nextResolve) {
      const target = urls.get(specifier);
      // Stubs may re-export the real package, so never redirect from support/.
      if (target && !(context.parentURL ?? '').startsWith(SUPPORT_DIR)) {
        return { url: target, shortCircuit: true };
      }
      return nextResolve(specifier, context);
    },
  });
}
