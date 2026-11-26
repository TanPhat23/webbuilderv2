import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as card from '../apps/editor/src/components/ui/card';
import * as table from '../apps/editor/src/components/ui/table';
import * as dialog from '../apps/editor/src/components/ui/dialog';
import * as alertDialog from '../apps/editor/src/components/ui/alert-dialog';
import * as select from '../apps/editor/src/components/ui/select';
import * as command from '../apps/editor/src/components/ui/command';
import * as tooltip from '../apps/editor/src/components/ui/tooltip';
import * as accordion from '../apps/editor/src/components/ui/accordion';

type Props = Record<string, unknown>;

/** Every props bag in an element tree, without rendering (so Portals and Radix context are not needed). */
function propsIn(node: unknown, out: Props[] = []): Props[] {
  if (Array.isArray(node)) {
    node.forEach((n) => propsIn(n, out));
  } else if (React.isValidElement(node)) {
    const props = node.props as Props;
    out.push(props);
    propsIn(props.children, out);
  }
  return out;
}

const kebab = (name: string) => name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

function call(fn: unknown, props: Props): unknown {
  return (fn as (p: Props) => unknown)(props);
}

/**
 * Wrappers that only re-export or re-label a Radix primitive. They still carry
 * a data-slot, but className is intentionally not forwarded (or not accepted).
 */
const NO_CLASSNAME = new Set([
  'Dialog', 'DialogTrigger', 'DialogPortal', 'DialogClose',
  'AlertDialog', 'AlertDialogTrigger', 'AlertDialogPortal',
  'Select', 'SelectGroup', 'SelectValue',
  'Tooltip', 'TooltipTrigger', 'TooltipProvider',
  'Accordion', 'AccordionItem',
]);

const modules: Record<string, Record<string, unknown>> = {
  card, table, dialog, alertDialog, select, command, tooltip, accordion,
};

test('every shadcn wrapper stamps a data-slot named after itself', () => {
  let checked = 0;
  for (const [modName, mod] of Object.entries(modules)) {
    for (const [name, fn] of Object.entries(mod)) {
      if (typeof fn !== 'function') continue;
      const tree = call(fn, { children: 'kid' });
      const slots = propsIn(tree).map((p) => p['data-slot']);
      // CommandDialog is composed from the dialog wrappers rather than owning a slot.
      if (name === 'CommandDialog') continue;
      assert.ok(slots.includes(kebab(name)), `${modName}.${name} should render data-slot="${kebab(name)}", got ${JSON.stringify(slots)}`);
      checked++;
    }
  }
  assert.ok(checked > 40, `only ${checked} wrappers checked`);
});

test('wrappers merge a custom className onto the element they style', () => {
  let checked = 0;
  for (const [modName, mod] of Object.entries(modules)) {
    for (const [name, fn] of Object.entries(mod)) {
      if (typeof fn !== 'function' || NO_CLASSNAME.has(name) || name === 'CommandDialog') continue;
      const tree = call(fn, { className: 'custom-marker', children: 'kid' });
      const carriers = propsIn(tree).filter((p) => String(p.className ?? '').includes('custom-marker'));
      assert.ok(carriers.length > 0, `${modName}.${name} dropped className`);
      checked++;
    }
  }
  assert.ok(checked > 25, `only ${checked} wrappers checked`);
});

test('DialogContent only renders a close button unless it is turned off', () => {
  const slots = (props: Props) => propsIn(call(dialog.DialogContent, props)).map((p) => p['data-slot']);
  assert.ok(slots({ children: 'x' }).includes('dialog-close'));
  assert.ok(!slots({ children: 'x', showCloseButton: false }).includes('dialog-close'));
  const hasOverlay = (el: unknown): boolean =>
    Array.isArray(el)
      ? el.some(hasOverlay)
      : React.isValidElement(el) && (el.type === dialog.DialogOverlay || hasOverlay((el.props as Props).children));
  assert.ok(hasOverlay(call(dialog.DialogContent, { children: 'x', showCloseButton: false })), 'the overlay is always rendered');
});

const h = React.createElement;

test('card parts render as divs inside the card, in markup', () => {
  const html = renderToStaticMarkup(
    h(card.Card, { className: 'outer' },
      h(card.CardHeader, null,
        h(card.CardTitle, null, 'Title'),
        h(card.CardDescription, null, 'Desc')),
      h(card.CardContent, null, 'Body'),
      h(card.CardFooter, null, 'Foot')),
  );
  for (const slot of ['card', 'card-header', 'card-title', 'card-description', 'card-content', 'card-footer']) {
    assert.match(html, new RegExp(`data-slot="${slot}"`), slot);
  }
  assert.match(html, /class="[^"]*outer/);
  assert.match(html, />Title</);
});

test('table parts nest into a valid table, wrapped for horizontal scroll', () => {
  const html = renderToStaticMarkup(
    h(table.Table, { className: 't' },
      h(table.TableHeader, null, h(table.TableRow, null, h(table.TableHead, null, 'H'))),
      h(table.TableBody, null, h(table.TableRow, null, h(table.TableCell, null, 'C')))),
  );
  assert.match(html, /<table[^>]*data-slot="table"/);
  assert.match(html, /<thead[^>]*data-slot="table-header"/);
  assert.match(html, /<th[^>]*data-slot="table-head"[^>]*>H</);
  assert.match(html, /<td[^>]*data-slot="table-cell"[^>]*>C</);
  assert.match(html, /overflow-x-auto/);
});

test('accordion renders its item, trigger and content in markup', () => {
  const html = renderToStaticMarkup(
    h(accordion.Accordion, { type: 'single', collapsible: true, defaultValue: 'a' },
      h(accordion.AccordionItem, { value: 'a' },
        h(accordion.AccordionTrigger, { className: 'trig' }, 'Open me'),
        h(accordion.AccordionContent, { className: 'body' }, 'Inside'))),
  );
  assert.match(html, /data-slot="accordion-item"/);
  assert.match(html, /data-slot="accordion-trigger"[^>]*>Open me/);
  assert.match(html, /data-state="open"/);
  assert.match(html, /<div class="[^"]*body[^"]*">Inside</);
});
