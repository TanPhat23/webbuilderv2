import { after, afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  $$q,
  $q,
  byLabel,
  cleanup,
  click,
  pickOption,
  React,
  render,
  type,
} from './support/sidebar-dom-harness';
import { editorValue, makeSp } from './support/sidebar-fixtures';
import { Accordion } from '../src/components/ui/accordion';
import { LayoutSection } from '../src/features/editor/components/sidebar/style/LayoutSection';
import ButtonConfiguration from '../src/features/editor/components/sidebar/configurations/ButtonConfiguration';
import { LinkConfigurationAccordion } from '../src/features/editor/components/sidebar/configurations/LinkConfiguration';
import { FormConfigurationAccordion } from '../src/features/editor/components/sidebar/configurations/FormConfiguration';
import TextareaConfiguration from '../src/features/editor/components/sidebar/configurations/TextareaConfiguration';
import TableConfiguration from '../src/features/editor/components/sidebar/configurations/TableConfiguration';
import { SelectConfigurationAccordion } from '../src/features/editor/components/sidebar/configurations/SelectConfiguration';
import CMSConfiguration from '../src/features/editor/components/sidebar/configurations/CMSConfiguration';
import { EditorContext } from '../src/features/editor/context/EditorContext';
import { useElementStore } from '../src/features/editor/store/element-store';
import { useSelectionStore } from '../src/features/editor/store/selection-store';
import { projectKeys } from '../src/features/projects/hooks/useProjects';
import { cmsKeys } from '../src/features/cms/query-keys';
import type {
  ButtonElement,
  CMSContentGridElement,
  CMSContentItemElement,
  FormElement,
  LinkElement,
  SelectElement,
  TableElement,
  TextareaElement,
} from '../src/types/elements/elements';

const h = React.createElement;
const realFetch = globalThis.fetch;
const realError = console.error;

function makeClient() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  client.setQueryData(projectKeys.pages('proj-1'), [
    { Id: 'page-home', Name: 'Home', Type: 'sp', ProjectId: 'proj-1', DeletedAt: null },
  ]);
  const contentTypes = [
    { id: 'ct-1', name: 'Posts', description: '', createdAt: new Date(0), updatedAt: new Date(0) },
  ];
  client.setQueryData(cmsKeys.contentTypes(), contentTypes);
  client.setQueryData(cmsKeys.contentTypes('proj-1'), contentTypes);
  client.setQueryData(cmsKeys.publicContentList('ct-1'), [
    { id: 'item-1', contentTypeId: 'ct-1', title: 'Hello World', slug: 'hello-world', published: true, createdAt: new Date(0), updatedAt: new Date(0) },
  ]);
  return client;
}

function withProviders(client: QueryClient, child: React.ReactNode) {
  return h(
    QueryClientProvider,
    { client },
    h(EditorContext.Provider, { value: editorValue() }, child),
  );
}

beforeEach(() => {
  console.error = () => {};
  useElementStore.getState().loadElements([], true);
  useSelectionStore.getState().setSelectedElement(undefined);
  globalThis.fetch = (async () => Response.json([])) as typeof fetch;
});

afterEach(async () => {
  await cleanup();
  globalThis.fetch = realFetch;
  console.error = realError;
});

after(cleanup);

test('LayoutSection renders flex, grid, width/height mode controls, and expanded options', async () => {
  const { sp, calls } = makeSp({
    values: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
    inherited: { flexDirection: 'row' },
  });

  const r = await render(
    h(EditorContext.Provider, { value: editorValue() }, h(LayoutSection, { sp })),
  );
  await click(byLabel(r.container, 'Vertical'));
  assert.deepEqual(calls.pop(), ['set', 'flexDirection', 'column']);

  await click(r.container.querySelector('button[title="Wrap children onto new lines"]')!);
  assert.deepEqual(calls.pop(), ['set', 'flexWrap', 'nowrap']);

  await click(byLabel(r.container, 'More size options'));
  assert.ok(r.container.textContent?.includes('Inside a flex parent'));

  const { sp: gridSp } = makeSp({ values: { display: 'grid' } });
  const rGrid = await render(
    h(EditorContext.Provider, { value: editorValue() }, h(LayoutSection, { sp: gridSp })),
  );
  assert.ok(byLabel(rGrid.container, 'Grid columns (e.g. repeat(3, 1fr))'));
});

test('ButtonConfiguration and LinkConfiguration update href, target, and rel attributes', async () => {
  const client = makeClient();
  try {
    const btn: ButtonElement = {
      id: 'btn-1',
      type: 'Button',
      content: 'Click',
      pageId: 'page-1',
      href: 'https://example.com',
      styles: {},
      tailwindStyles: '',
      settings: { target: '_self' },
    };
    useElementStore.getState().loadElements([btn], true);
    useSelectionStore.getState().setSelectedElement(btn);

    const rBtn = await render(
      withProviders(client, h(Accordion, { type: 'multiple', defaultValue: ['button-settings'] }, h(ButtonConfiguration))),
    );
    assert.ok(rBtn.container.textContent?.includes('External link'));
    await type($q<HTMLInputElement>(rBtn.container, '#button-href'), 'mailto:team@example.com');
    assert.equal(useElementStore.getState().elements[0]?.href, 'mailto:team@example.com');

    const lnk: LinkElement = {
      id: 'lnk-1',
      type: 'Link',
      content: 'Read more',
      pageId: 'page-1',
      href: '/about',
      styles: {},
      tailwindStyles: '',
      settings: {},
    };
    useElementStore.getState().loadElements([lnk], true);
    useSelectionStore.getState().setSelectedElement(lnk);

    const rLnk = await render(
      withProviders(client, h(Accordion, { type: 'multiple', defaultValue: ['link-settings'] }, h(LinkConfigurationAccordion))),
    );
    assert.ok(rLnk.container.textContent?.includes('Internal'));
    await click($q<HTMLElement>(rLnk.container, '#link-noreferrer'));
    const savedSettings = useElementStore.getState().elements[0]?.settings as Record<string, unknown>;
    assert.match(String(savedSettings.rel), /noreferrer/);
  } finally {
    await cleanup();
    client.clear();
  }
});

test('FormConfiguration, TextareaConfiguration, TableConfiguration, and SelectConfiguration update store settings', async () => {
  const client = makeClient();
  try {
    const formEl: FormElement = {
      id: 'form-1',
      type: 'Form',
      content: '',
      pageId: 'page-1',
      styles: {},
      tailwindStyles: '',
      settings: { action: '/api/submit', method: 'post' },
      elements: [],
    };
    useElementStore.getState().loadElements([formEl], true);
    useSelectionStore.getState().setSelectedElement(formEl);

    const rForm = await render(
      withProviders(client, h(Accordion, { type: 'multiple', defaultValue: ['form-settings'] }, h(FormConfigurationAccordion))),
    );
    assert.ok(rForm.container.textContent?.includes('Internal endpoint'));
    await type($q<HTMLInputElement>(rForm.container, '#form-action'), 'https://api.example.com/hook');
    assert.ok(rForm.container.textContent?.includes('External endpoint'));
    await pickOption($q<HTMLElement>(rForm.container, '#form-method'), 'GET');
    assert.equal((useElementStore.getState().elements[0] as FormElement).settings?.method, 'get');

    const taEl: TextareaElement = {
      id: 'ta-1',
      type: 'Textarea',
      content: '',
      pageId: 'page-1',
      styles: {},
      tailwindStyles: '',
      settings: { name: 'bio', rows: 4, wrap: 'soft', resize: 'vertical' },
    };
    useElementStore.getState().loadElements([taEl], true);
    useSelectionStore.getState().setSelectedElement(taEl);

    const rTa = await render(
      withProviders(client, h(Accordion, { type: 'multiple', defaultValue: ['textarea-settings'] }, h(TextareaConfiguration))),
    );
    assert.ok(rTa.container.textContent?.includes('Textarea Settings'));

    const tblEl: TableElement = {
      id: 'tbl-1',
      type: 'Table',
      content: '',
      pageId: 'page-1',
      styles: {},
      tailwindStyles: '',
      settings: { caption: '', columns: [] },
      elements: [],
    };
    useElementStore.getState().loadElements([tblEl], true);
    useSelectionStore.getState().setSelectedElement(tblEl);

    const rTbl = await render(
      withProviders(client, h(Accordion, { type: 'multiple', defaultValue: ['table-settings'] }, h(TableConfiguration))),
    );
    assert.ok(rTbl.container.textContent?.includes('No columns defined'));
    const addColBtn = $$q<HTMLButtonElement>(rTbl.container, 'button').find((b) =>
      b.textContent?.includes('Add Column'),
    )!;
    await click(addColBtn);
    assert.equal((useElementStore.getState().elements[0] as TableElement).settings?.columns?.length, 1);

    const selEl: SelectElement = {
      id: 'sel-1',
      type: 'Select',
      content: '',
      pageId: 'page-1',
      styles: {},
      tailwindStyles: '',
      settings: {
        name: 'country',
        selectOptions: [{ id: 'o1', label: 'Vietnam', value: 'vn' }],
      },
      elements: [],
    };
    useElementStore.getState().loadElements([selEl], true);
    useSelectionStore.getState().setSelectedElement(selEl);

    const rSel = await render(
      withProviders(client, h(Accordion, { type: 'multiple', defaultValue: ['select-settings'] }, h(SelectConfigurationAccordion))),
    );
    const addOptBtn = $$q<HTMLButtonElement>(rSel.container, 'button').find((b) =>
      b.textContent?.includes('Add option'),
    )!;
    await click(addOptBtn);
    assert.equal((useElementStore.getState().elements[0] as SelectElement).settings?.selectOptions?.length, 2);
  } finally {
    await cleanup();
    client.clear();
  }
});

test('CMSConfiguration renders Grid and Single Item controls from seeded CMS content', async () => {
  const client = makeClient();
  try {
    const gridEl: CMSContentGridElement = {
      id: 'cms-grid',
      type: 'CMSContentGrid',
      content: '',
      pageId: 'page-1',
      styles: {},
      tailwindStyles: '',
      settings: { contentTypeId: 'ct-1', displayMode: 'grid', limit: 6 },
      elements: [],
    };
    useElementStore.getState().loadElements([gridEl], true);
    useSelectionStore.getState().setSelectedElement(gridEl);

    const rGrid = await render(
      withProviders(client, h(Accordion, { type: 'multiple', defaultValue: ['cms-config'] }, h(CMSConfiguration))),
    );
    assert.ok(rGrid.container.textContent?.includes('CMS Content'));
    assert.ok(rGrid.container.textContent?.includes('Posts'));

    const itemEl: CMSContentItemElement = {
      id: 'cms-item',
      type: 'CMSContentItem',
      content: '',
      pageId: 'page-1',
      styles: {},
      tailwindStyles: '',
      settings: { contentTypeId: 'ct-1', displayMode: 'single', itemSlug: 'hello-world' },
      elements: [],
    };
    useElementStore.getState().loadElements([itemEl], true);
    useSelectionStore.getState().setSelectedElement(itemEl);

    const rItem = await render(
      withProviders(client, h(Accordion, { type: 'multiple', defaultValue: ['cms-config'] }, h(CMSConfiguration))),
    );
    assert.ok(rItem.container.textContent?.includes('CMS Content'));
  } finally {
    await cleanup();
    client.clear();
  }
});
