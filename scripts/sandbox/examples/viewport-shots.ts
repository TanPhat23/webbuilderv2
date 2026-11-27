// Switch the editor's viewport preset (Mobile, Tablet, Desktop) and screenshot each one
// to <sandbox>/shots/viewport-<preset>.png, returning the width the editor reports.
//   scripts/sandbox/sandbox.sh exec scripts/sandbox/examples/viewport-shots.ts
import path from 'node:path';
import type { ExecContext } from '../exec-helpers';

const PRESETS = ['Mobile', 'Tablet', 'Desktop'] as const;

export default async function ({ page, log }: ExecContext): Promise<unknown> {
  const shots = path.join(process.env.SANDBOX_DIR ?? '.sandbox', 'shots');
  const out: { preset: string; width: string; file: string }[] = [];
  for (const preset of PRESETS) {
    const button = page.getByRole('button', { name: preset, exact: true });
    await button.click();
    await page.locator(`button[aria-label="${preset}"][aria-pressed="true"]`).waitFor({ timeout: 10_000 });
    const width = (await page.locator('[aria-label^="Active viewport width"]').getAttribute('aria-label')) ?? '';
    const file = path.join(shots, `viewport-${preset.toLowerCase()}.png`);
    await page.screenshot({ path: file });
    log(`${preset}: ${width}`);
    out.push({ preset, width: width.replace('Active viewport width: ', ''), file });
  }
  return out; // ends on Desktop, the editor's default
}
