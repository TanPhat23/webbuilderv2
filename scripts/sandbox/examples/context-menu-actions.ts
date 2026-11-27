// Right-click an element in the canvas and list the context menu's data-action ids.
//   scripts/sandbox/sandbox.sh exec scripts/sandbox/examples/context-menu-actions.ts
// Nothing is activated: the menu is closed with Escape afterwards.
import type { ExecContext } from '../exec-helpers';

export default async function ({ page, log }: ExecContext): Promise<unknown> {
  const starter = page.getByRole('button', { name: 'Hero', exact: true });
  if (await starter.isVisible().catch(() => false)) await starter.click();
  const canvas = page.frameLocator('iframe').first();
  const target = canvas.locator('[data-element-type="Button"], [data-element-type="Text"]').first();
  await target.waitFor({ state: 'visible', timeout: 20_000 });
  await target.click({ button: 'right' });
  const items = page.locator('[data-slot="context-menu-content"] [data-action]');
  await items.first().waitFor({ state: 'visible', timeout: 10_000 });
  const actions = await items.evaluateAll((nodes) =>
    nodes.map((n) => ({
      action: n.getAttribute('data-action') ?? '',
      disabled: n.hasAttribute('data-disabled') || n.getAttribute('aria-disabled') === 'true',
    })),
  );
  log(`${actions.length} actions`);
  await page.keyboard.press('Escape');
  return actions;
}
