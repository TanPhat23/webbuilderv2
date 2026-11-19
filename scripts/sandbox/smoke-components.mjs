// End-to-end check of reusable components through the real stack (run after
// `sandbox.sh up`): MCP tools -> Redis relay -> API websocket -> the headless
// editor tab -> API/DB, then back out through MCP reads.
//   node scripts/sandbox/smoke-components.mjs
import { execFileSync } from 'node:child_process';
import { connect } from './mcp-client.mjs';

const c = await connect();
const projectId = c.env.projectId;
const sb = (...args) => execFileSync('scripts/sandbox/sandbox.sh', args, { encoding: 'utf8' }).trim();
const shot = (name) => { try { return JSON.parse(sb('shot', name)).file; } catch { return '(no screenshot)'; } };
let failures = 0;
const check = (ok, label, detail) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${!ok && detail ? `\n      ${typeof detail === 'string' ? detail : JSON.stringify(detail).slice(0, 600)}` : ''}`); if (!ok) failures++; };
const nodes = (list) => list.flatMap((n) => [n, ...nodes(n.children ?? [])]);
const suffix = Date.now().toString(36).slice(-4);
const name = `Plan card ${suffix}`;

const proj = await c.call('get_project', { projectId });
const pageId = proj.pages.find((p) => p.type !== 'cp').id;

await c.call('apply_edits', { projectId, pageId, operations: [
  { op: 'create', ref: 'card', element: { type: 'Section', name: `Plan ${suffix}`, tailwindStyles: 'p-8 m-8 rounded-xl border bg-white max-w-sm' } },
  { op: 'create', parentId: 'card', element: { type: 'Text', name: `Title ${suffix}`, content: 'Pro', tailwindStyles: 'text-2xl font-bold' } },
  { op: 'create', parentId: 'card', element: { type: 'Text', name: `Price ${suffix}`, content: '$29 / month', tailwindStyles: 'text-lg' } },
] });
let page = await c.call('get_page', { projectId, pageId });
const card = page.elements.find((e) => e.name === `Plan ${suffix}`);
check(!!card && card.children?.length === 2, 'built a card with two texts on page 1', page);

// 1. convert the card into a component
const made = await c.call('create_component', { projectId, name, fromElementId: card.id });
check(!!made, 'create_component from the card', made);
const list = await c.call('list_components', { projectId });
const comps = list.components ?? list;
const comp = comps.find((x) => x.name === name);
check(!!comp, 'list_components shows the new component', list);
page = await c.call('get_page', { projectId, pageId });
const instance = page.elements.find((e) => e.component);
check(!!instance && !(instance.children?.length), 'page 1 now holds an instance node with no children', page);
console.log('      shot:', shot('1-after-convert'));
// The conversion races the server's commit of the master: watch the canvas for a while.
const canvas = () => JSON.parse(sb('canvas'));
const samples = [];
for (let i = 0; i < 12; i++) { samples.push(canvas().missing); await new Promise((r) => setTimeout(r, 1000)); }
check(samples.every((n) => n === 0) && canvas().text.includes('Pro'), 'the new instance keeps rendering for 12s (no "Missing component" flashes)', `missing per second: ${samples.join(',')}`);

// 2. names are unique: a second component with the same name is refused clearly
const dup = await c.raw('create_component', { projectId, name });
const dupText = (dup.content ?? []).map((x) => x.text).join(' ');
check(dup.isError && /already exists/i.test(dupText), 'duplicate component name gives a clear error', dupText);

// 3. insert the component on a second page, overriding one text
const second = await c.call('create_page', { projectId, name: `Second ${suffix}`, open: true });
const secondId = second.id ?? second.pageId ?? second.page?.id;
check(!!secondId, 'create_page(open) for a second page', second);
const master = await c.call('get_page', { projectId, pageId: comp.id ?? comp.pageId });
const price = nodes(master.elements).find((n) => n.name === `Price ${suffix}`);
check(!!price, 'master page is readable and has the Price node', master);
await c.call('apply_edits', { projectId, pageId: secondId, operations: [
  { op: 'create', element: { component: { id: comp.id ?? comp.pageId, overrides: { [price.id]: { text: '$99 / month' } } } } },
] });
const p2 = await c.call('get_page', { projectId, pageId: secondId });
const inst2 = p2.elements.find((e) => e.component);
check(!!inst2 && inst2.component.overrides && !(inst2.children?.length), 'second page has an instance with its override, no children', p2);
console.log('      shot:', shot('2-second-page'));

// 4. editing the master changes both instances
await c.call('open_page', { projectId, pageId: comp.id ?? comp.pageId });
const masterNow = await c.call('get_page', { projectId, pageId: comp.id ?? comp.pageId });
const plan = nodes(masterNow.elements).find((n) => n.name === `Title ${suffix}`);
await c.call('apply_edits', { projectId, pageId: comp.id ?? comp.pageId, operations: [{ op: 'update', id: plan.id, set: { content: 'Pro Plus' } }] });
console.log('      shot (master edited):', shot('3-master'));
await c.call('open_page', { projectId, pageId: secondId });
console.log('      shot (second page after master edit):', shot('4-second-after-master-edit'));
for (let i = 0; i < 6; i++) { if (canvas().text.includes('Pro Plus')) break; await new Promise((r) => setTimeout(r, 1500)); }
const c2 = canvas();
check(c2.missing === 0 && c2.text.includes('Pro Plus') && c2.text.includes('$99 / month'),
  'second page renders the edited master text with its own override', c2);

// 5. detach turns the instance into ordinary elements
const detached = await c.call('detach_component', { projectId, elementId: inst2.id });
const p3 = await c.call('get_page', { projectId, pageId: secondId });
const flat = nodes(p3.elements);
check(!flat.some((n) => n.component) && flat.some((n) => n.content === 'Pro Plus') && flat.some((n) => n.content === '$99 / month'),
  'detach keeps the master content and the override as plain elements', { detached, p3 });

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
