/**
 * Redirect modules by their RESOLVED path (so relative and `@/` imports are
 * both caught), unlike `redirectModules` which matches the raw specifier.
 * Call before dynamically importing the module under test.
 */
import { registerHooks } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const SUPPORT_DIR = pathToFileURL(path.resolve(import.meta.dirname) + path.sep).href;
const SRC = path.resolve(import.meta.dirname, '../../src');

/**
 * @param map keys are source paths relative to `src/` without extension
 *   (e.g. `features/editor/hooks/useEditorPermissions`) or bare package names;
 *   values are stub files relative to tests/support.
 */
export function stubResolved(map: Record<string, string>): void {
  const bySource = new Map<string, string>();
  const byPackage = new Map<string, string>();
  for (const [key, file] of Object.entries(map)) {
    const url = pathToFileURL(path.resolve(import.meta.dirname, file)).href;
    if (key.startsWith('pkg:')) byPackage.set(key.slice(4), url);
    else bySource.set(path.join(SRC, key), url);
  }
  registerHooks({
    resolve(specifier, context, nextResolve) {
      if ((context.parentURL ?? '').startsWith(SUPPORT_DIR)) return nextResolve(specifier, context);
      const pkg = byPackage.get(specifier);
      if (pkg) return { url: pkg, shortCircuit: true };
      const next = nextResolve(specifier, context);
      if (next.url.startsWith('file://')) {
        const file = fileURLToPath(next.url).replace(/\.(tsx?|jsx?)$/, '');
        const target = bySource.get(file) ?? bySource.get(file.replace(/\/index$/, ''));
        if (target) return { url: target, shortCircuit: true };
      }
      return next;
    },
  });
}
