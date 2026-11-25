import { after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  $q,
  $$q,
  byText,
  cleanup,
  click,
  pickOption,
  React,
  render,
  type,
} from './support/sidebar-dom-harness';
import { Accordion } from '../src/components/ui/accordion';
import {
  AccordionSection,
  SectionDivider,
} from '../src/features/editor/components/sidebar/configurations/_shared/AccordionSection';
import {
  ConfigEmpty,
  ConfigField,
  ConfigSection,
} from '../src/features/editor/components/sidebar/configurations/_shared/ConfigField';
import {
  ConfigNumberInput,
  ConfigSelectInput,
  ConfigSwitch,
} from '../src/features/editor/components/sidebar/configurations/_shared/ConfigInputs';
import { ConfigPanel } from '../src/features/editor/components/sidebar/configurations/_shared/ConfigPanel';
import {
  AutocompleteSetting,
  FieldNameSetting,
  FieldValidationSection,
  NamedFieldConfigPanel,
} from '../src/features/editor/components/sidebar/configurations/_shared/TextControlSections';
import {
  MediaPlaybackSection,
  type SharedMediaPlaybackSettings,
} from '../src/features/editor/components/sidebar/configurations/_shared/MediaPlaybackSection';
import ChoiceConfigurationShell from '../src/features/editor/components/sidebar/configurations/_shared/ChoiceConfigurationSection';
import ValidationConfiguration from '../src/features/editor/components/sidebar/configurations/ValidationConfiguration';
import { useElementStore } from '../src/features/editor/store/element-store';
import { useSelectionStore } from '../src/features/editor/store/selection-store';
import type { InputElement } from '../src/types/elements/elements';

after(cleanup);
beforeEach(() => {
  cleanup();
  useElementStore.getState().setElements([], true);
  useSelectionStore.getState().setSelectedElement(undefined);
});

const h = React.createElement;

function makeInputElement(rules: NonNullable<InputElement['settings']>['validateRules'] = []): InputElement {
  return {
    id: 'input-1',
    type: 'Input',
    content: '',
    pageId: 'page-1',
    settings: { name: 'email', type: 'text', validateRules: rules },
    styles: {},
    tailwindStyles: '',
  };
}

test('ConfigField, ConfigSection, ConfigEmpty, ConfigPanel, AccordionSection, and TextControlSections render all variants', async () => {
  const changes: Array<[string, string | boolean]> = [];
  function Demo() {
    const [val, setVal] = React.useState('opt-a');
    const [text, setText] = React.useState('auto');
    const [num, setNum] = React.useState<number | undefined>(5);
    const [checked, setChecked] = React.useState(false);

    return h(
      Accordion,
      { type: 'multiple', defaultValue: ['panel-1', 'panel-2', 'sec-1', 'validation'] },
      h(NamedFieldConfigPanel, {
        value: 'panel-1',
        icon: h('span', null, 'IC'),
        title: 'Input Settings',
        name: 'username',
        children: [
          h(ConfigSection, {
            key: 'sec',
            title: 'Group',
            icon: h('span', null, 'G'),
            children: [
              h(ConfigField, {
                key: 'f1',
                label: 'Horizontal',
                htmlFor: 'h-in',
                hint: 'Row hint',
                children: h('input', { id: 'h-in' }),
              }),
              h(ConfigField, {
                key: 'f2',
                label: 'Vertical',
                htmlFor: 'v-in',
                vertical: true,
                children: h('input', { id: 'v-in' }),
              }),
              h(ConfigField, {
                key: 'f3',
                label: 'Full',
                fullWidth: true,
                children: h('span', null, 'Full Body'),
              }),
            ],
          }),
          h(SectionDivider, { key: 'div' }),
          h(AccordionSection, {
            key: 'acc',
            value: 'sec-1',
            title: 'Nested Section',
            icon: h('span', null, 'S'),
            badge: h('span', null, 'B'),
            nested: true,
            noBorder: true,
            children: [
              h(ConfigSelectInput, {
                key: 'sel',
                id: 'cfg-select',
                label: 'Kind',
                hint: 'Pick kind',
                value: val,
                onValueChange: (next) => { setVal(next); changes.push(['select', next]); },
                options: [
                  { value: 'opt-a', label: 'Alpha', icon: h('span', null, 'A') },
                  { value: 'opt-b', label: 'Beta' },
                ],
              }),
              h(FieldNameSetting, {
                key: 'fn',
                id: 'cfg-fname',
                hint: 'Field name',
                value: 'emailField',
                onValueChange: (next) => changes.push(['fname', next]),
              }),
              h(ConfigNumberInput, {
                key: 'num',
                id: 'cfg-num',
                label: 'Limit',
                hint: 'Max',
                value: num,
                placeholder: '0',
                min: 0,
                max: 100,
                compact: true,
                onValueChange: (next) => { setNum(Number(next)); changes.push(['num', next]); },
              }),
              h(ConfigSwitch, {
                key: 'sw',
                id: 'cfg-switch',
                label: 'Enabled',
                hint: 'Toggle',
                checked,
                onCheckedChange: (next) => { setChecked(next); changes.push(['switch', next]); },
              }),
              h(AutocompleteSetting, {
                key: 'ac',
                id: 'cfg-ac',
                hint: 'Autocomplete',
                value: text,
                onValueChange: (next) => { setText(next); changes.push(['ac', next]); },
              }),
              h(FieldValidationSection, { key: 'fv' }),
            ],
          }),
        ],
      }),
      h(ConfigPanel, {
        value: 'panel-2',
        icon: h('span', null, 'P2'),
        title: 'Empty Panel',
        children: h(ConfigEmpty, { icon: h('span', null, 'E'), message: 'Nothing configured' }),
      }),
    );
  }

  const r = await render(h(Demo));
  assert.ok(r.container.textContent!.includes('username'));
  assert.ok(r.container.textContent!.includes('Full Body'));
  assert.ok(r.container.textContent!.includes('Nothing configured'));
  assert.ok(r.container.textContent!.includes('Autocomplete hint: "auto"'));

  await pickOption($q<HTMLElement>(r.container, '#cfg-select'), 'Beta');
  await type($q<HTMLInputElement>(r.container, '#cfg-fname'), 'user_email');
  await type($q<HTMLInputElement>(r.container, '#cfg-num'), '42');
  await click($q<HTMLElement>(r.container, '#cfg-switch'));
  await type($q<HTMLInputElement>(r.container, '#cfg-ac'), 'off');
  assert.ok(r.container.textContent!.includes('Browser autocomplete disabled'));
  await type($q<HTMLInputElement>(r.container, '#cfg-ac'), '');
  assert.ok(r.container.textContent!.includes('Using browser default autocomplete'));
  assert.deepEqual(changes, [
    ['select', 'opt-b'],
    ['fname', 'user_email'],
    ['num', '42'],
    ['switch', true],
    ['ac', 'off'],
    ['ac', ''],
  ]);
});

test('ValidationConfiguration adds, updates, edits messages on, and removes rules in element store', async () => {
  const el = makeInputElement([{ rule: 'required', message: 'Required!' }]);
  useElementStore.getState().setElements([el], true);
  useSelectionStore.getState().setSelectedElement(el);

  const r = await render(h(ValidationConfiguration));
  assert.ok(r.container.textContent!.includes('1 rule configured'));

  await type($q<HTMLInputElement>(r.container, 'input[placeholder="Error message (optional)"]'), 'Must fill');
  let saved = useElementStore.getState().elements[0] as InputElement;
  assert.equal(saved.settings?.validateRules?.[0]?.message, 'Must fill');

  // Switch dropdown to minLength and add it.
  await pickOption($q<HTMLElement>(r.container, 'button[role="combobox"]'), 'Min Length');
  await click(byText(r.container, '', 'button') || $q<HTMLElement>(r.container, 'button:not([role])'));
  saved = useElementStore.getState().elements[0] as InputElement;
  assert.equal(saved.settings?.validateRules?.length, 2);

  await type($q<HTMLInputElement>(r.container, 'input[type="number"]'), '4');
  await pickOption($q<HTMLElement>(r.container, 'button[role="combobox"]'), 'Pattern');
  const addButtons = $$q<HTMLButtonElement>(r.container, 'button[type="button"]').filter((b) => !b.getAttribute('role'));
  await click(addButtons[0]);

  await type($q<HTMLInputElement>(r.container, 'input[placeholder="^[A-Za-z]+$"]'), '^[0-9]+$');
  await pickOption($q<HTMLElement>(r.container, 'button[role="combobox"]'), 'Custom');
  const addButtons2 = $$q<HTMLButtonElement>(r.container, 'button[type="button"]').filter((b) => !b.getAttribute('role'));
  await click(addButtons2[0]);

  saved = useElementStore.getState().elements[0] as InputElement;
  assert.equal(saved.settings?.validateRules?.length, 4);
  assert.ok(r.container.textContent!.includes('4 rules configured'));
  assert.ok(r.container.textContent!.includes('Edit in code'));

  // Remove rules down to empty state.
  for (let i = 0; i < 4; i++) {
    const removeButtons = $$q<HTMLButtonElement>(r.container, 'div.group\\/rule button[type="button"]:not([role])');
    if (removeButtons.length > 0) await click(removeButtons[removeButtons.length - 1]);
  }
  assert.ok(r.container.textContent!.includes('No validation rules'));
});

test('MediaPlaybackSection renders Audio and Video playback toggles and warning states', async () => {
  const updates: Array<[string, unknown]> = [];
  function Host() {
    const [settings, setSettings] = React.useState<SharedMediaPlaybackSettings>({
      controls: true,
      autoplay: true,
      loop: true,
      muted: false,
      preload: 'metadata',
    });
    const updateSetting = <K extends keyof typeof settings>(key: K, value: (typeof settings)[K]) => {
      updates.push([String(key), value]);
      setSettings((prev) => ({ ...prev, [key]: value }));
    };
    return h(
      Accordion,
      { type: 'multiple', defaultValue: ['playback'] },
      h(MediaPlaybackSection, {
        mediaType: 'Video',
        settings,
        updateSetting,
        extraPlaybackFields: h('span', null, 'Inline Option'),
      }),
    );
  }

  const r = await render(h(Host));
  assert.ok(r.container.textContent!.includes('Autoplay may be blocked'));
  assert.ok(r.container.textContent!.includes('Inline Option'));
  assert.ok(r.container.textContent!.includes('autoplay'));
  assert.ok(r.container.textContent!.includes('loop'));
  assert.ok(r.container.textContent!.includes('controls'));

  await click($q<HTMLElement>(r.container, '#video-controls'));
  await click($q<HTMLElement>(r.container, '#video-autoplay'));
  await click($q<HTMLElement>(r.container, '#video-loop'));
  await click($q<HTMLElement>(r.container, '#video-muted'));
  await pickOption($q<HTMLElement>(r.container, '#video-preload'), 'Auto');

  assert.deepEqual(updates, [
    ['controls', false],
    ['autoplay', false],
    ['loop', false],
    ['muted', true],
    ['preload', 'auto'],
  ]);

  const audioOnly = await render(
    h(
      Accordion,
      { type: 'multiple', defaultValue: ['playback'] },
      h(MediaPlaybackSection, {
        mediaType: 'Audio',
        settings: { autoplay: false, muted: false },
        updateSetting: () => {},
      }),
    ),
  );
  assert.ok(audioOnly.container.textContent!.includes('audio on'));
});

test('ChoiceConfigurationShell updates checkbox and radio fields and constraint summary badges', async () => {
  const edits: Array<[string, unknown]> = [];
  function ChoiceHost() {
    const [settings, setSettings] = React.useState({
      name: 'agree',
      value: 'yes',
      label: 'I agree',
      defaultChecked: false,
      required: false,
      disabled: false,
    });
    return h(
      Accordion,
      { type: 'multiple', defaultValue: ['checkbox-cfg'] },
      h(ChoiceConfigurationShell, {
        idPrefix: 'checkbox',
        accordionValue: 'checkbox-cfg',
        title: 'Checkbox Options',
        icon: h('span', null, 'CB'),
        stateIcon: h('span', null, 'ST'),
        settings,
        onSettingChange: (k, v) => {
          edits.push([k, v]);
          setSettings((prev) => ({ ...prev, [k]: v }));
        },
        nameHint: 'Field name',
        namePlaceholder: 'agree',
        valueHint: 'Submitted value',
        valuePlaceholder: 'yes',
        labelHint: 'Label text',
        labelPlaceholder: 'Accept',
        defaultCheckedLabel: 'Checked by default',
        defaultCheckedHint: 'Initial state',
        requiredHint: 'Required field',
        disabledHint: 'Disabled field',
        stateSummary: h('span', null, 'Summary'),
      }),
    );
  }

  const r = await render(h(ChoiceHost));
  assert.ok(r.container.textContent!.includes('No constraints applied'));
  assert.ok(r.container.textContent!.includes('Label: “I agree”'));

  await type($q<HTMLInputElement>(r.container, '#checkbox-name'), 'terms');
  await type($q<HTMLInputElement>(r.container, '#checkbox-value'), 'accepted');
  await type($q<HTMLInputElement>(r.container, '#checkbox-label'), 'Accept terms');
  await click($q<HTMLElement>(r.container, '#checkbox-defaultChecked'));
  await click($q<HTMLElement>(r.container, '#checkbox-required'));
  await click($q<HTMLElement>(r.container, '#checkbox-disabled'));

  assert.ok(r.container.textContent!.includes('required'));
  assert.ok(r.container.textContent!.includes('disabled'));
  assert.deepEqual(edits, [
    ['name', 'terms'],
    ['value', 'accepted'],
    ['label', 'Accept terms'],
    ['defaultChecked', true],
    ['required', true],
    ['disabled', true],
  ]);
});
