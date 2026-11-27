// Select an element in the editor canvas and return what the editor shows for it.
//   scripts/sandbox/sandbox.sh exec scripts/sandbox/examples/select-element.ts
// An empty page gets the "Hero" starter block first, so this works on a fresh sandbox.
import type { ExecContext } from '../exec-helpers';

export default async function ({ page, log }: ExecContext): Promise<unknown> {
  const starter = page.getByRole('button', { name: 'Hero', exact: true });
  if (await starter.isVisible().catch(() => false)) {
    log('empty page: inserting the Hero starter block');
    await starter.click();
  }
  const canvas = page.frameLocator('iframe').first();
  const target = canvas.locator('[data-element-type="Heading"], [data-element-type="Text"]').first();
  await target.waitFor({ state: 'visible', timeout: 20_000 });
  const picked = await target.evaluate((el) => ({
    id: (el as HTMLElement).dataset.elementId ?? null,
    type: (el as HTMLElement).dataset.elementType ?? null,
    text: (el.textContent ?? '').trim().slice(0, 60),
  }));
  await target.click();
  // The selection chip floats above the selected element, e.g. "Text  Fill × Hug".
  const chip = page.locator('[data-hud-layer="floating"]').getByText(picked.type ?? '', { exact: false }).first();
  await chip.waitFor({ state: 'visible', timeout: 10_000 });
  const label = ((await chip.innerText()).replace(/\s+/g, ' ')).trim();
  return { picked, selectionLabel: label };
}
