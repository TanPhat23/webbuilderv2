import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { act, clearPendingFrames, doc, fire, installMatchMedia, mount, win } from './support/app-dom-harness';
import { useForm } from 'react-hook-form';
import { ThemeProvider as NextThemes } from 'next-themes';
import * as avatar from '../src/components/ui/avatar';
import * as breadcrumb from '../src/components/ui/breadcrumb';
import * as checkbox from '../src/components/ui/checkbox';
import * as collapsible from '../src/components/ui/collapsible';
import * as contextMenu from '../src/components/ui/context-menu';
import * as dropdownMenu from '../src/components/ui/dropdown-menu';
import * as empty from '../src/components/ui/empty';
import * as form from '../src/components/ui/form';
import * as inputMod from '../src/components/ui/input';
import * as popover from '../src/components/ui/popover';
import * as radioGroup from '../src/components/ui/radio-group';
import * as resizable from '../src/components/ui/resizable';
import * as scrollArea from '../src/components/ui/scroll-area';
import * as separator from '../src/components/ui/separator';
import * as sheet from '../src/components/ui/sheet';
import * as sidebar from '../src/components/ui/sidebar';
import * as skeleton from '../src/components/ui/skeleton';
import * as slider from '../src/components/ui/slider';
import * as spinner from '../src/components/ui/spinner';
import * as switchMod from '../src/components/ui/switch';
import * as tabs from '../src/components/ui/tabs';
import * as textarea from '../src/components/ui/textarea';
import * as toggle from '../src/components/ui/toggle';
import * as toggleGroup from '../src/components/ui/toggle-group';
import { Toaster } from '../src/components/ui/sonner';
import PanelIntro from '../src/components/PanelIntro';
import ThemeSwitcher from '../src/components/ThemeSwitcher';
import { ThemeProvider } from '../src/providers/themeprovider';
import { useIsMobile } from '../src/hooks/use-mobile';

type Props = Record<string, unknown>;

const mounted: Array<{ unmount(): Promise<void> }> = [];
async function mountTracked(node: React.ReactNode) {
  const m = await mount(node);
  mounted.push(m);
  return m;
}
afterEach(async () => {
  for (const m of mounted.splice(0)) await m.unmount().catch(() => undefined);
  doc.body.innerHTML = '';
  clearPendingFrames();
});

/** Every props bag in an element tree, without rendering. */
function propsIn(node: unknown, out: Props[] = []): Props[] {
  if (Array.isArray(node)) node.forEach((n) => propsIn(n, out));
  else if (React.isValidElement(node)) {
    const props = node.props as Props;
    out.push(props);
    propsIn(props.children, out);
  }
  return out;
}
const kebab = (name: string) => name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
const call = (fn: unknown, props: Props): unknown => (fn as (p: Props) => unknown)(props);
const click = (el: Element) => fire(el, new win.MouseEvent('click', { bubbles: true, cancelable: true }));
const q = <T extends Element = HTMLElement>(sel: string, root: ParentNode = doc) => root.querySelector(sel) as T | null;

// ------------------------------------------------------------------ stateless wrappers

const STATELESS: Record<string, Record<string, unknown>> = {
  avatar, breadcrumb, checkbox, collapsible, contextMenu, dropdownMenu, empty, popover,
  radioGroup, scrollArea, separator, sheet, skeleton, tabs, textarea, toggle, toggleGroup,
  resizable,
};
/** Thin re-exports of Radix roots: they take no className / are renamed in data-slot. */
const NO_CLASSNAME = /^(Collapsible|CollapsibleTrigger|CollapsibleContent|ContextMenu|ContextMenuTrigger|ContextMenuGroup|ContextMenuPortal|ContextMenuSub|DropdownMenu|DropdownMenuTrigger|DropdownMenuGroup|DropdownMenuPortal|DropdownMenuSub|DropdownMenuRadioGroup|Popover|PopoverTrigger|PopoverAnchor|PopoverHeader|PopoverTitle|PopoverDescription|Sheet|SheetTrigger|SheetPortal|SheetClose|Breadcrumb|ResizablePanel|Empty.*Media)$/;
const SLOT_RENAMES: Record<string, string> = { EmptyMedia: 'empty-icon', ScrollBar: 'scroll-area-scrollbar' };

test('every stateless ui wrapper stamps a data-slot and forwards className', () => {
  let checked = 0;
  for (const [modName, mod] of Object.entries(STATELESS)) {
    for (const [name, fn] of Object.entries(mod)) {
      if (typeof fn !== 'function' || name.endsWith('Variants') || name === 'ToggleGroupItem') continue;
      const tree = call(fn, { children: 'kid', className: 'x-custom' });
      const all = propsIn(tree);
      const slots = all.map((p) => p['data-slot']);
      const expected = SLOT_RENAMES[name] ?? kebab(name);
      assert.ok(slots.includes(expected), `${modName}.${name} should render data-slot="${expected}", got ${JSON.stringify(slots)}`);
      if (!NO_CLASSNAME.test(name)) {
        assert.ok(
          all.some((p) => typeof p.className === 'string' && (p.className as string).includes('x-custom')),
          `${modName}.${name} should forward className`,
        );
      }
      checked++;
    }
  }
  assert.ok(checked >= 60, `expected to check many wrappers, checked ${checked}`);
});

test('avatar size defaults and is forwarded to data-size', () => {
  assert.equal(propsIn(call(avatar.Avatar, {}))[0]['data-size'], 'default');
  assert.equal(propsIn(call(avatar.Avatar, { size: 'lg' }))[0]['data-size'], 'lg');
});

test('PanelIntro renders icon, copy and optional children', () => {
  const Icon = (p: Props) => React.createElement('svg', { 'data-testid': 'icon', ...p });
  const bare = renderToStaticMarkup(React.createElement(PanelIntro, { icon: Icon as never, title: 'Title', description: 'Desc' }));
  assert.match(bare, /Title/);
  assert.match(bare, /Desc/);
  assert.match(bare, /data-testid="icon"/);
  assert.doesNotMatch(bare, /w-full flex-col gap-2/);
  const withKids = renderToStaticMarkup(
    React.createElement(PanelIntro, { icon: Icon as never, title: 'T', description: 'D' }, React.createElement('button', null, 'Go')),
  );
  assert.match(withKids, /w-full flex-col gap-2"><button>Go<\/button>/);
});

test('simple presentational wrappers render the expected markup', () => {
  const html = (n: React.ReactNode) => renderToStaticMarkup(n as React.ReactElement);
  assert.match(html(React.createElement(skeleton.Skeleton, { className: 'h-4' })), /data-slot="skeleton"[^>]*|class="[^"]*animate-pulse/);
  const sp = html(React.createElement(spinner.Spinner, { className: 'size-9' }));
  assert.match(sp, /role="status"/);
  assert.match(sp, /aria-label="Loading"/);
  assert.match(sp, /animate-spin/);
  assert.match(sp, /size-9/);
  assert.match(html(React.createElement(textarea.Textarea, { placeholder: 'p', rows: 2 })), /<textarea[^>]*data-slot="textarea"/);
  assert.match(html(React.createElement(separator.Separator, { orientation: 'vertical' })), /data-orientation="vertical"/);
  assert.match(html(React.createElement(separator.Separator, {})), /role="none"|data-orientation="horizontal"/);
});

test('breadcrumb: nav label, link asChild, page and separator', () => {
  const html = renderToStaticMarkup(
    React.createElement(breadcrumb.Breadcrumb, null,
      React.createElement(breadcrumb.BreadcrumbList, null,
        React.createElement(breadcrumb.BreadcrumbItem, null,
          React.createElement(breadcrumb.BreadcrumbLink, { href: '/a' }, 'Home')),
        React.createElement(breadcrumb.BreadcrumbItem, null,
          React.createElement(breadcrumb.BreadcrumbLink, { asChild: true }, React.createElement('button', null, 'Custom'))),
        React.createElement(breadcrumb.BreadcrumbSeparator, null),
        React.createElement(breadcrumb.BreadcrumbSeparator, null, '/'),
        React.createElement(breadcrumb.BreadcrumbPage, null, 'Now'))),
  );
  assert.match(html, /<nav aria-label="breadcrumb"/);
  assert.match(html, /<a[^>]*href="\/a"[^>]*data-slot="breadcrumb-link"|<a[^>]*data-slot="breadcrumb-link"[^>]*href="\/a"/);
  assert.match(html, /<button[^>]*data-slot="breadcrumb-link"[^>]*>Custom<\/button>/);
  assert.match(html, /role="presentation"[^>]*aria-hidden="true"[^>]*><svg/); // default chevron
  assert.match(html, /aria-hidden="true"[^>]*>\/<\/li>/); // custom separator child
  assert.match(html, /aria-current="page"[^>]*>Now|>Now<\/span>/);
});

test('empty state: media variant and slots', () => {
  const html = renderToStaticMarkup(
    React.createElement(empty.Empty, null,
      React.createElement(empty.EmptyHeader, null,
        React.createElement(empty.EmptyMedia, { variant: 'icon' }, 'I'),
        React.createElement(empty.EmptyTitle, null, 'Nothing'),
        React.createElement(empty.EmptyDescription, null, 'Add one'))),
  );
  assert.match(html, /data-slot="empty-icon" data-variant="icon"/);
  assert.match(html, /bg-muted/);
  assert.match(html, />Nothing</);
  assert.match(html, />Add one</);
  const def = renderToStaticMarkup(React.createElement(empty.EmptyMedia, null));
  assert.match(def, /data-variant="default"/);
  assert.match(def, /bg-transparent/);
});

test('toggle variants and toggle-group context precedence', () => {
  assert.notEqual(toggle.toggleVariants({ variant: 'outline' }), toggle.toggleVariants({ variant: 'default' }));
  assert.notEqual(toggle.toggleVariants({ size: 'sm' }), toggle.toggleVariants({ size: 'lg' }));
  const html = renderToStaticMarkup(
    React.createElement(toggleGroup.ToggleGroup, { type: 'single', variant: 'outline', size: 'sm', spacing: 2 },
      React.createElement(toggleGroup.ToggleGroupItem, { value: 'a', variant: 'default', size: 'lg' }, 'A')),
  );
  assert.match(html, /data-slot="toggle-group"[^>]*data-variant="outline"/);
  assert.match(html, /data-spacing="2"/);
  // The group's variant/size win over the item's own props.
  assert.match(html, /data-slot="toggle-group-item"[^>]*data-variant="outline"[^>]*data-size="sm"/);
  assert.throws(
    () =>
      renderToStaticMarkup(
        React.createElement(toggleGroup.ToggleGroupItem, { value: 'b', variant: 'outline' } as never, 'B'),
      ),
    /ToggleGroupItem.*ToggleGroup/,
  );
});

test('scroll bar picks orientation classes', () => {
  const v = propsIn(call(scrollArea.ScrollBar, {}));
  const h = propsIn(call(scrollArea.ScrollBar, { orientation: 'horizontal' }));
  assert.match(String(v[0].className), /w-2\.5/);
  assert.match(String(h[0].className), /h-2\.5/);
  assert.equal(v[0].orientation, 'vertical');
  assert.equal(h[0].orientation, 'horizontal');
});

// ------------------------------------------------------------------ interactive (jsdom)

test('checkbox toggles and reports changes', async () => {
  const seen: unknown[] = [];
  const m = await mountTracked(React.createElement(checkbox.Checkbox, { onCheckedChange: (v: unknown) => seen.push(v) }));
  const box = q('[data-slot="checkbox"]')!;
  assert.equal(box.getAttribute('aria-checked'), 'false');
  assert.equal(q('[data-slot="checkbox-indicator"]'), null);
  await click(box);
  await click(box);
  assert.deepEqual(seen, [true, false]);
  await m.render(React.createElement(checkbox.Checkbox, { checked: true }));
  assert.ok(q('[data-slot="checkbox-indicator"]'));
});

test('radio group selects an item', async () => {
  const seen: string[] = [];
  await mountTracked(
    React.createElement(radioGroup.RadioGroup, { onValueChange: (v: string) => seen.push(v), defaultValue: 'a' },
      React.createElement(radioGroup.RadioGroupItem, { value: 'a', id: 'ra' }),
      React.createElement(radioGroup.RadioGroupItem, { value: 'b', id: 'rb' })),
  );
  const items = doc.querySelectorAll('[data-slot="radio-group-item"]');
  assert.equal(items.length, 2);
  assert.equal(items[0].getAttribute('aria-checked'), 'true');
  assert.ok(q('[data-slot="radio-group-indicator"]'));
  await click(items[1]);
  assert.deepEqual(seen, ['b']);
});

test('tabs switch content on activation and honour orientation', async () => {
  const m = await mountTracked(
    React.createElement(tabs.Tabs, { defaultValue: 'one', orientation: 'vertical' },
      React.createElement(tabs.TabsList, { variant: 'line' },
        React.createElement(tabs.TabsTrigger, { value: 'one' }, 'One'),
        React.createElement(tabs.TabsTrigger, { value: 'two' }, 'Two')),
      React.createElement(tabs.TabsContent, { value: 'one' }, 'Body one'),
      React.createElement(tabs.TabsContent, { value: 'two' }, 'Body two')),
  );
  assert.equal(q('[data-slot="tabs"]')!.getAttribute('data-orientation'), 'vertical');
  assert.equal(q('[data-slot="tabs-list"]')!.getAttribute('data-variant'), 'line');
  assert.match(m.container.textContent!, /Body one/);
  assert.doesNotMatch(m.container.textContent!, /Body two/);
  const triggers = doc.querySelectorAll('[data-slot="tabs-trigger"]');
  await fire(triggers[1], new win.MouseEvent('mousedown', { bubbles: true, button: 0 }));
  assert.match(m.container.textContent!, /Body two/);
  assert.equal(triggers[1].getAttribute('data-state'), 'active');
  assert.ok(tabs.tabsListVariants({ variant: 'line' }).includes('bg-transparent'));
  assert.ok(tabs.tabsListVariants({}).includes('bg-muted'));
});

test('collapsible opens and closes via its trigger', async () => {
  const seen: boolean[] = [];
  const m = await mountTracked(
    React.createElement(collapsible.Collapsible, { onOpenChange: (o: boolean) => seen.push(o) },
      React.createElement(collapsible.CollapsibleTrigger, null, 'Toggle'),
      React.createElement(collapsible.CollapsibleContent, null, 'Hidden stuff')),
  );
  assert.doesNotMatch(m.container.textContent!, /Hidden stuff/);
  await click(q('[data-slot="collapsible-trigger"]')!);
  assert.match(m.container.textContent!, /Hidden stuff/);
  await click(q('[data-slot="collapsible-trigger"]')!);
  assert.deepEqual(seen, [true, false]);
});

test('slider renders one thumb per value (value, defaultValue, or min/max)', async () => {
  const thumbs = async (props: Props) => {
    const m = await mountTracked(React.createElement(slider.Slider, props));
    const n = m.container.querySelectorAll('[data-slot="slider-thumb"]').length;
    await m.unmount();
    mounted.splice(mounted.indexOf(m), 1);
    return n;
  };
  assert.equal(await thumbs({ value: [10, 20, 30] }), 3);
  assert.equal(await thumbs({ defaultValue: [5, 6] }), 2);
  assert.equal(await thumbs({ min: 0, max: 10 }), 2);
  const m = await mountTracked(React.createElement(slider.Slider, { value: [1], className: 'x-slide' }));
  assert.ok(q('[data-slot="slider"]')!.className.includes('x-slide'));
  assert.ok(q('[data-slot="slider-track"]'));
  assert.ok(q('[data-slot="slider-range"]'));
  void m;
});

test('dropdown menu renders items in a portal and fires onSelect', async () => {
  const picked: string[] = [];
  const E = React.createElement;
  await mountTracked(
    E(dropdownMenu.DropdownMenu, { open: true },
      E(dropdownMenu.DropdownMenuTrigger, null, 'Open'),
      E(dropdownMenu.DropdownMenuContent, { sideOffset: 8 },
        E(dropdownMenu.DropdownMenuGroup, null,
          E(dropdownMenu.DropdownMenuItem, { onSelect: () => picked.push('edit') }, 'Edit'),
          E(dropdownMenu.DropdownMenuItem, { variant: 'destructive', inset: true, onSelect: () => picked.push('del') }, 'Delete')),
        E(dropdownMenu.DropdownMenuSeparator, null))),
  );
  const items = doc.querySelectorAll('[data-slot="dropdown-menu-item"]');
  assert.equal(items.length, 2);
  assert.equal(items[1].getAttribute('data-variant'), 'destructive');
  assert.equal(items[1].getAttribute('data-inset'), 'true');
  assert.ok(q('[data-slot="dropdown-menu-separator"]'));
  assert.ok(q('[data-slot="dropdown-menu-content"]'));
  await click(items[0]);
  assert.deepEqual(picked, ['edit']);
});

test('context menu renders trigger, groups, items, labels, separators, shortcuts, and submenus', () => {
  const E = React.createElement;
  const html = renderToStaticMarkup(
    E(contextMenu.ContextMenu, null,
      E(contextMenu.ContextMenuTrigger, null, E('div', { id: 'area' }, 'Right click'))),
  );
  assert.match(html, /data-slot="context-menu-trigger"/);
  assert.match(html, /Right click/);

  const parts = renderToStaticMarkup(
    E(contextMenu.ContextMenuShortcut, { className: 'x-short' }, 'Ctrl+C'),
  );
  assert.match(parts, /data-slot="context-menu-shortcut"/);
  assert.match(parts, /Ctrl\+C/);

  const subTree = propsIn(
    E(contextMenu.ContextMenuGroup, null,
      E(contextMenu.ContextMenuLabel, { inset: true }, 'Actions'),
      E(contextMenu.ContextMenuItem, { variant: 'destructive', inset: true }, 'Delete'),
      E(contextMenu.ContextMenuSeparator, null),
      E(contextMenu.ContextMenuSub, null,
        E(contextMenu.ContextMenuSubTrigger, { inset: true }, 'More'),
        E(contextMenu.ContextMenuSubContent, null, E(contextMenu.ContextMenuItem, null, 'Nested')))),
  );
  assert.ok(subTree.length > 0);
});

test('popover content mounts in a portal when open', async () => {
  const E = React.createElement;
  const m = await mountTracked(
    E(popover.Popover, { open: true },
      E(popover.PopoverTrigger, null, 'Open'),
      E(popover.PopoverContent, { align: 'start', sideOffset: 2, className: 'x-pop' }, 'Popover body')),
  );
  const content = q('[data-slot="popover-content"]')!;
  assert.ok(content);
  assert.ok(content.className.includes('x-pop'));
  assert.match(content.textContent!, /Popover body/);
  await m.render(E(popover.Popover, { open: false }, E(popover.PopoverContent, null, 'x')));
  assert.equal(q('[data-slot="popover-content"]'), null);
});

test('sheet: side classes and the close button', async () => {
  const E = React.createElement;
  const sides: Array<[string, RegExp]> = [
    ['right', /right-0/], ['left', /left-0/], ['top', /top-0/], ['bottom', /bottom-0/],
  ];
  for (const [side, re] of sides) {
    const m = await mountTracked(
      E(sheet.Sheet, { open: true },
        E(sheet.SheetContent, { side: side as never },
          E(sheet.SheetHeader, null,
            E(sheet.SheetTitle, null, 'Title'),
            E(sheet.SheetDescription, null, 'Desc')))),
    );
    const content = q('[data-slot="sheet-content"]')!;
    assert.match(content.className, re, side);
    assert.ok(q('[data-slot="sheet-overlay"]'));
    assert.ok(q('[data-slot="sheet-header"]'));
    assert.ok(q('[data-slot="sheet-title"]'));
    assert.ok(q('[data-slot="sheet-description"]'));
    assert.match(content.textContent!, /Close/);
    await m.unmount();
    mounted.splice(mounted.indexOf(m), 1);
  }
  const m = await mountTracked(E(sheet.Sheet, { open: true }, E(sheet.SheetContent, { showCloseButton: false }, E(sheet.SheetTitle, null, 'T'))));
  assert.doesNotMatch(q('[data-slot="sheet-content"]')!.textContent!, /Close/);
  void m;
});

test('resizable group, panel and handle render', async () => {
  const E = React.createElement;
  await mountTracked(
    E(resizable.ResizablePanelGroup, { orientation: 'horizontal', className: 'x-group' },
      E(resizable.ResizablePanel, { defaultSize: 50, id: 'p1' }, 'left'),
      E(resizable.ResizableHandle, { withHandle: true, id: 'h1' }),
      E(resizable.ResizablePanel, { defaultSize: 50, id: 'p2' }, 'right')),
  );
  assert.ok(q('[data-slot="resizable-panel-group"]')!.className.includes('x-group'));
  assert.equal(doc.querySelectorAll('[data-slot="resizable-panel"]').length, 2);
  const handle = q('[data-slot="resizable-handle"]')!;
  assert.ok(handle.querySelector('svg'), 'withHandle renders the grip icon');
  assert.throws(() => renderToStaticMarkup(E(resizable.ResizableHandle, { id: 'solo' })));
});

// ------------------------------------------------------------------ form

function FormHarness({ withError, onReady }: { withError: boolean; onReady?: (id: string) => void }) {
  const methods = useForm<{ name: string }>({
    defaultValues: { name: '' },
    ...(withError ? { errors: { name: { type: 'required', message: 'Name is required' } } } : {}),
  });
  return React.createElement(form.Form, methods as never,
    React.createElement(form.FormField, {
      control: methods.control,
      name: 'name',
      render: ({ field }: { field: Props }) =>
        React.createElement(form.FormItem, { className: 'x-item' },
          React.createElement(form.FormLabel, null, 'Name'),
          React.createElement(form.FormControl, null, React.createElement('input', field as never)),
          React.createElement(form.FormMessage, null),
          React.createElement(Probe, { onReady })),
    } as never));
}
function Probe({ onReady }: { onReady?: (id: string) => void }) {
  const f = form.useFormField();
  onReady?.(f.formItemId);
  return null;
}

test('form wires label, control and message ids', async () => {
  let itemId = '';
  const m = await mountTracked(React.createElement(FormHarness, { withError: false, onReady: (id) => (itemId = id) }));
  const label = q('[data-slot="form-label"]')!;
  const control = q('[data-slot="form-control"]')!;
  assert.equal(label.getAttribute('for'), itemId);
  assert.equal(control.getAttribute('id'), itemId);
  assert.equal(control.getAttribute('aria-invalid'), 'false');
  assert.equal(label.getAttribute('data-error'), 'false');
  assert.ok(!control.getAttribute('aria-describedby')!.includes('message'));
  assert.equal(q('[data-slot="form-message"]'), null, 'no message without error or children');
  await m.unmount();
  mounted.splice(mounted.indexOf(m), 1);
});

test('form surfaces field errors on label, control and message', async () => {
  await mountTracked(React.createElement(FormHarness, { withError: true }));
  const control = q('[data-slot="form-control"]')!;
  assert.equal(control.getAttribute('aria-invalid'), 'true');
  assert.match(control.getAttribute('aria-describedby')!, /form-item-message/);
  assert.equal(q('[data-slot="form-label"]')!.getAttribute('data-error'), 'true');
  const msg = q('[data-slot="form-message"]')!;
  assert.equal(msg.textContent, 'Name is required');
  assert.ok(msg.className.includes('text-destructive'));
});

test('FormMessage shows its children when there is no error', () => {
  function H() {
    const methods = useForm<{ name: string }>({ defaultValues: { name: '' } });
    return React.createElement(form.Form, methods as never,
      React.createElement(form.FormField, {
        control: methods.control, name: 'name',
        render: () => React.createElement(form.FormItem, null, React.createElement(form.FormMessage, null, 'Helper text')),
      } as never));
  }
  assert.match(renderToStaticMarkup(React.createElement(H)), /data-slot="form-message"[^>]*>Helper text</);
});

// ------------------------------------------------------------------ sidebar

const E = React.createElement;

function SidebarProbe({ sink }: { sink: { ctx?: ReturnType<typeof sidebar.useSidebar> } }) {
  sink.ctx = sidebar.useSidebar();
  return null;
}

test('useSidebar throws outside a provider', () => {
  const orig = console.error;
  console.error = () => undefined;
  try {
    assert.throws(() => renderToStaticMarkup(E(SidebarProbe, { sink: {} })), /useSidebar must be used within a SidebarProvider/);
  } finally {
    console.error = orig;
  }
});

test('sidebar provider: toggle, cookie, keyboard shortcut and controlled mode', async () => {
  installMatchMedia(() => false);
  win.innerWidth = 1280;
  doc.cookie = 'sidebar_state=; max-age=0; path=/';
  const sink: { ctx?: ReturnType<typeof sidebar.useSidebar> } = {};
  const m = await mountTracked(
    E(sidebar.SidebarProvider, { className: 'x-wrap', style: { color: 'red' } as React.CSSProperties },
      E(SidebarProbe, { sink })),
  );
  const wrapper = q('[data-slot="sidebar-wrapper"]')!;
  assert.ok(wrapper.className.includes('x-wrap'));
  assert.equal(wrapper.style.getPropertyValue('--sidebar-width'), '16rem');
  assert.equal(wrapper.style.getPropertyValue('--sidebar-width-icon'), '3rem');
  assert.equal(wrapper.style.color, 'red');
  assert.equal(sink.ctx!.state, 'expanded');
  assert.equal(sink.ctx!.isMobile, false);

  await act(async () => sink.ctx!.toggleSidebar());
  assert.equal(sink.ctx!.state, 'collapsed');
  assert.equal(sink.ctx!.open, false);
  assert.match(doc.cookie, /sidebar_state=false/);

  // Ctrl+B and Cmd+B toggle; plain B and other keys do not.
  await fire(win, new win.KeyboardEvent('keydown', { key: 'b', ctrlKey: true, cancelable: true }));
  assert.equal(sink.ctx!.state, 'expanded');
  assert.match(doc.cookie, /sidebar_state=true/);
  await fire(win, new win.KeyboardEvent('keydown', { key: 'b', metaKey: true }));
  assert.equal(sink.ctx!.state, 'collapsed');
  await fire(win, new win.KeyboardEvent('keydown', { key: 'b' }));
  await fire(win, new win.KeyboardEvent('keydown', { key: 'x', ctrlKey: true }));
  assert.equal(sink.ctx!.state, 'collapsed');

  await act(async () => sink.ctx!.setOpen(true));
  assert.equal(sink.ctx!.state, 'expanded');

  // Controlled: onOpenChange fires and the prop decides the state.
  const seen: boolean[] = [];
  await m.render(E(sidebar.SidebarProvider, { open: false, onOpenChange: (o: boolean) => seen.push(o) }, E(SidebarProbe, { sink })));
  assert.equal(sink.ctx!.state, 'collapsed');
  await act(async () => sink.ctx!.toggleSidebar());
  assert.deepEqual(seen, [true]);
  assert.equal(sink.ctx!.state, 'collapsed', 'a controlled provider does not change by itself');

  const closed = await mountTracked(E(sidebar.SidebarProvider, { defaultOpen: false }, E(SidebarProbe, { sink })));
  assert.equal(sink.ctx!.state, 'collapsed');
  void closed;
});

test('useIsMobile tracks the viewport width and media-query changes', async () => {
  const mm = installMatchMedia(() => false);
  win.innerWidth = 500;
  const seen: boolean[] = [];
  function P() {
    seen.push(useIsMobile());
    return null;
  }
  const m = await mountTracked(E(P));
  assert.equal(seen.at(-1), true);
  assert.equal(mm.listeners, 1);
  win.innerWidth = 1000;
  await act(async () => mm.fire());
  assert.equal(seen.at(-1), false);
  win.innerWidth = 767;
  await act(async () => mm.fire());
  assert.equal(seen.at(-1), true);
  win.innerWidth = 768;
  await act(async () => mm.fire());
  assert.equal(seen.at(-1), false);
  await m.unmount();
  mounted.splice(mounted.indexOf(m), 1);
  assert.equal(mm.listeners, 0, 'listener removed on unmount');
});

test('sidebar on desktop renders the gap and container; variants and sides', async () => {
  installMatchMedia(() => false);
  win.innerWidth = 1280;
  const render = async (props: Props) => {
    const m = await mountTracked(
      E(sidebar.SidebarProvider, null,
        E(sidebar.Sidebar, props, E(sidebar.SidebarHeader, null, 'H'), E(sidebar.SidebarContent, null, 'C'), E(sidebar.SidebarFooter, null, 'F'))),
    );
    const root = q('[data-slot="sidebar"]')!;
    const snapshot = {
      state: root.getAttribute('data-state'),
      variant: root.getAttribute('data-variant'),
      side: root.getAttribute('data-side'),
      collapsible: root.getAttribute('data-collapsible'),
      container: q('[data-slot="sidebar-container"]')!.className,
      gap: q('[data-slot="sidebar-gap"]')!.className,
    };
    assert.ok(q('[data-slot="sidebar-inner"]'));
    assert.ok(q('[data-slot="sidebar-header"]'));
    assert.ok(q('[data-slot="sidebar-content"]'));
    assert.ok(q('[data-slot="sidebar-footer"]'));
    await m.unmount();
    mounted.splice(mounted.indexOf(m), 1);
    return snapshot;
  };
  const def = await render({});
  assert.deepEqual([def.state, def.variant, def.side, def.collapsible], ['expanded', 'sidebar', 'left', '']);
  assert.match(def.container, /left-0/);
  assert.match(def.container, /border-r/);
  const right = await render({ side: 'right', variant: 'floating', className: 'x-side' });
  assert.deepEqual([right.variant, right.side], ['floating', 'right']);
  assert.match(right.container, /right-0/);
  assert.match(right.container, /p-2/);
  assert.match(right.container, /x-side/);
  assert.match(right.gap, /calc\(var\(--sidebar-width-icon\)/);
  const inset = await render({ variant: 'inset' });
  assert.match(inset.container, /p-2/);
  // Collapsed state exposes the collapsible mode.
  const m = await mountTracked(
    E(sidebar.SidebarProvider, { defaultOpen: false }, E(sidebar.Sidebar, { collapsible: 'icon' }, 'x')),
  );
  assert.equal(q('[data-slot="sidebar"]')!.getAttribute('data-collapsible'), 'icon');
  void m;
});

test('sidebar collapsible="none" is a plain panel', async () => {
  installMatchMedia(() => false);
  await mountTracked(
    E(sidebar.SidebarProvider, null, E(sidebar.Sidebar, { collapsible: 'none', className: 'x-none' }, 'plain')),
  );
  const el = q('[data-slot="sidebar"]')!;
  assert.ok(el.className.includes('x-none'));
  assert.equal(el.getAttribute('data-state'), null);
  assert.equal(q('[data-slot="sidebar-gap"]'), null);
});

test('sidebar on mobile renders a sheet that follows openMobile', async () => {
  installMatchMedia(() => true);
  win.innerWidth = 400;
  const sink: { ctx?: ReturnType<typeof sidebar.useSidebar> } = {};
  await mountTracked(
    E(sidebar.SidebarProvider, null,
      E(SidebarProbe, { sink }),
      E(sidebar.SidebarTrigger, null),
      E(sidebar.Sidebar, { side: 'right' }, E('span', { id: 'inside' }, 'in'))),
  );
  assert.equal(sink.ctx!.isMobile, true);
  assert.equal(q('[data-slot="sidebar"]'), null, 'closed sheet renders nothing');
  await click(q('[data-slot="sidebar-trigger"]')!);
  assert.equal(sink.ctx!.openMobile, true);
  const panel = q('[data-slot="sidebar"]')!;
  assert.equal(panel.getAttribute('data-mobile'), 'true');
  assert.equal(panel.style.getPropertyValue('--sidebar-width'), '18rem');
  assert.ok(q('#inside'));
  assert.match(panel.textContent!, /Displays the mobile sidebar/);
  await act(async () => sink.ctx!.setOpenMobile(false));
  assert.equal(q('[data-slot="sidebar"]'), null);
  // desktop open state is untouched by the mobile toggle
  assert.equal(sink.ctx!.open, true);
});

test('sidebar trigger and rail toggle, and chain a custom onClick', async () => {
  installMatchMedia(() => false);
  win.innerWidth = 1280;
  const sink: { ctx?: ReturnType<typeof sidebar.useSidebar> } = {};
  const clicks: string[] = [];
  await mountTracked(
    E(sidebar.SidebarProvider, null,
      E(SidebarProbe, { sink }),
      E(sidebar.SidebarTrigger, { onClick: () => clicks.push('trigger'), className: 'x-trig' }),
      E(sidebar.SidebarRail, { className: 'x-rail' }),
      E(sidebar.SidebarInset, { className: 'x-inset' }, 'main')),
  );
  const trig = q('[data-slot="sidebar-trigger"]')!;
  assert.ok(trig.className.includes('x-trig'));
  assert.match(trig.textContent!, /Toggle Sidebar/);
  await click(trig);
  assert.deepEqual(clicks, ['trigger']);
  assert.equal(sink.ctx!.state, 'collapsed');
  const rail = q('[data-slot="sidebar-rail"]')!;
  assert.equal(rail.getAttribute('aria-label'), 'Toggle Sidebar');
  assert.equal(rail.getAttribute('tabindex'), '-1');
  await click(rail);
  assert.equal(sink.ctx!.state, 'expanded');
  assert.ok(q('[data-slot="sidebar-inset"]')!.className.includes('x-inset'));
  assert.equal(q('[data-slot="sidebar-inset"]')!.tagName, 'MAIN');
});

test('sidebar groups and menus render their slots, with asChild variants', async () => {
  installMatchMedia(() => false);
  win.innerWidth = 1280;
  await mountTracked(
    E(sidebar.SidebarProvider, null,
      E(sidebar.SidebarGroup, { className: 'x-g' },
        E(sidebar.SidebarGroupLabel, null, 'Label'),
        E(sidebar.SidebarGroupLabel, { asChild: true }, E('h4', { id: 'as-child-label' }, 'AsChild')),
        E(sidebar.SidebarGroupContent, null,
          E(sidebar.SidebarMenu, null,
            E(sidebar.SidebarMenuItem, null,
              E(sidebar.SidebarMenuButton, { isActive: true, variant: 'outline', size: 'lg' }, 'Active')),
            E(sidebar.SidebarMenuItem, null,
              E(sidebar.SidebarMenuButton, { asChild: true }, E('a', { href: '/x', id: 'as-child-link' }, 'Link'))))))),
  );
  assert.ok(q('[data-slot="sidebar-group"]')!.className.includes('x-g'));
  assert.equal(q('#as-child-label')!.getAttribute('data-slot'), 'sidebar-group-label');
  assert.equal(q('[data-slot="sidebar-group-label"]')!.tagName, 'DIV');
  assert.ok(q('[data-slot="sidebar-group-content"]'));
  assert.equal(q('[data-slot="sidebar-menu"]')!.tagName, 'UL');
  assert.equal(doc.querySelectorAll('[data-slot="sidebar-menu-item"]').length, 2);
  const btn = q('[data-slot="sidebar-menu-button"]')!;
  assert.equal(btn.getAttribute('data-active'), 'true');
  assert.equal(btn.getAttribute('data-size'), 'lg');
  assert.match(btn.className, /h-12/);
  assert.match(btn.className, /shadow-\[0_0_0_1px/);
  const link = q('#as-child-link')!;
  assert.equal(link.getAttribute('data-slot'), 'sidebar-menu-button');
  assert.equal(link.getAttribute('data-active'), 'false');
  assert.equal(link.getAttribute('data-size'), 'default');
});

test('sidebar menu button tooltip: string or props, hidden unless collapsed on desktop', async () => {
  installMatchMedia(() => false);
  win.innerWidth = 1280;
  const render = async (props: Props, provider: Props = {}) => {
    const m = await mountTracked(
      E(sidebar.SidebarProvider, provider,
        E(sidebar.SidebarMenuButton, { id: 'tip-btn', ...props }, 'Btn')),
    );
    return m;
  };
  const m1 = await render({ tooltip: 'Hint' });
  assert.ok(q('#tip-btn'));
  await m1.unmount();
  const m2 = await render({ tooltip: { children: 'Rich hint', side: 'left' } }, { defaultOpen: false });
  assert.ok(q('#tip-btn'));
  await m2.unmount();
  mounted.length = 0;
  // Without a tooltip the button is rendered bare, no trigger wrapper attribute.
  await mountTracked(E(sidebar.SidebarProvider, null, E(sidebar.SidebarMenuButton, { id: 'plain-btn' }, 'x')));
  assert.equal(q('#plain-btn')!.getAttribute('data-state'), null);
});

// ------------------------------------------------------------------ theme + toaster

test('ThemeSwitcher renders after mount and flips the theme', async () => {
  installMatchMedia(() => false);
  localStorage.clear();
  const m = await mountTracked(
    E(ThemeProvider, { attribute: 'class', defaultTheme: 'light', enableSystem: false }, E(ThemeSwitcher)),
  );
  const btn = q('button')!;
  assert.ok(btn, 'button appears once mounted');
  assert.equal(btn.getAttribute('aria-label'), 'Switch to dark mode');
  await click(btn);
  assert.equal(q('button')!.getAttribute('aria-label'), 'Switch to light mode');
  assert.equal(localStorage.getItem('theme'), 'dark');
  assert.ok(doc.documentElement.classList.contains('dark'));
  await click(q('button')!);
  assert.equal(q('button')!.getAttribute('aria-label'), 'Switch to dark mode');
  assert.equal(localStorage.getItem('theme'), 'light');
  void m;
});

test('ThemeSwitcher renders nothing during server render', () => {
  assert.equal(renderToStaticMarkup(E(NextThemes, { attribute: 'class' }, E(ThemeSwitcher))).includes('<button'), false);
});

test('Toaster renders a themed sonner region', async () => {
  const m = await mountTracked(E(Toaster, { position: 'top-right', richColors: true }));
  const section = q('section[aria-label]');
  assert.ok(section, 'sonner renders its notification region');
  assert.match(section.getAttribute('aria-label')!, /Notifications/);
  await m.render(E(NextThemes, { attribute: 'class', defaultTheme: 'dark', enableSystem: false }, E(Toaster)));
  assert.ok(q('section[aria-label*="Notifications"]'));
});

test('Input and Switch render data-slot, sizes, and toggle state', async () => {
  const inputHtml = renderToStaticMarkup(E(inputMod.Input, { type: 'email', placeholder: 'you@example.com', className: 'extra' }));
  assert.match(inputHtml, /data-slot="input"/);
  assert.match(inputHtml, /type="email"/);

  let state = false;
  const m = await mountTracked(
    E(switchMod.Switch, {
      'aria-label': 'Active toggle',
      size: 'sm',
      checked: state,
      onCheckedChange: (next: boolean) => { state = next; },
    }),
  );
  const sw = q<HTMLButtonElement>('[aria-label="Active toggle"]')!;
  assert.equal(sw.getAttribute('data-slot'), 'switch');
  assert.equal(sw.getAttribute('data-size'), 'sm');
  await click(sw);
  assert.equal(state, true);
  void m;
});
