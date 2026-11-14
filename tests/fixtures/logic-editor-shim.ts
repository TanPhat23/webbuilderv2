import type { EditorElement } from '../../src/types/global.type';
const elements = [{ id: 'signup', type: 'button', name: 'Signup', settings: { interactions: { ix_aaaaaaaa: { on: 'click', do: [{ set: 'count', to: '1' }] } } } } as unknown as EditorElement];
export const useElements = () => elements;
export const useSetSelectedElement = () => (element: EditorElement | undefined) => { document.body.dataset.selectedElement = element?.id ?? ''; };
