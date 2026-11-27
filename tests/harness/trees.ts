import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';
import { PAGE_ID } from './seed';

const base = { content: '', pageId: PAGE_ID, settings: null } as const;

const text = (id: string, content: string): EditorElement => ({
  ...base,
  id,
  type: 'Text',
  content,
  parentId: 'frame',
  styles: {
    default: { color: 'rgb(255, 0, 0)', padding: '16px', margin: '0px', fontSize: '24px' },
    md: { color: 'rgb(0, 0, 255)' },
  },
}) as unknown as EditorElement;

/** Section > grid Frame > two Text children; the grid goes two-column and the text blue from md up. */
export function sectionGridTree(): EditorElement[] {
  return [
    {
      ...base,
      id: 'section',
      type: 'Section',
      styles: { default: { padding: '24px', width: '100%' } },
      elements: [
        {
          ...base,
          id: 'frame',
          type: 'Frame',
          parentId: 'section',
          styles: {
            default: { display: 'grid', gridTemplateColumns: '1fr', gap: '12px', width: '100%' },
            md: { gridTemplateColumns: '1fr 1fr' },
          },
          elements: [text('text-1', 'First text'), text('text-2', 'Second text')],
        },
      ],
    } as unknown as EditorElement,
  ];
}

export const SECTION_GRID_CSS = '#frame-marker{outline:1px solid red}';
