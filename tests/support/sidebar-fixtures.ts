/** Shared fixtures for sidebar component tests (fake StyleProps, editor context, store seeding). */
import { React } from './sidebar-dom-harness';
import type { StyleProps } from '../../src/features/editor/components/sidebar/style/useStyleProps';
import type { StyleMap } from '../../src/features/editor/components/sidebar/style/styleModel';
import type { EditorContextType } from '../../src/features/editor/context/EditorContext';
import type { FrameElement } from '../../src/types/elements/elements';

export type Call = [string, ...unknown[]];

export function makeSp(over: Partial<StyleProps> = {}): { sp: StyleProps; calls: Call[] } {
  const calls: Call[] = [];
  const defaultElement: FrameElement = {
    id: 'el-1',
    type: 'Frame',
    content: '',
    pageId: 'page-1',
    name: 'Box',
    styles: {},
    tailwindStyles: '',
    elements: [],
  };
  const sp: StyleProps = {
    element: defaultElement,
    breakpoint: 'default',
    values: {} as StyleMap,
    inherited: {} as StyleMap,
    disabled: false,
    replace: (next, dropClass) => void calls.push(['replace', next, dropClass]),
    set: (k, v) => void calls.push(['set', k, v]),
    setMany: (p) => void calls.push(['setMany', p]),
    clear: (keys) => void calls.push(['clear', keys]),
    ...over,
  };
  return { sp, calls };
}

export function editorValue(over: { isReadOnly?: boolean; isLocked?: boolean } = {}): EditorContextType {
  return {
    projectId: 'proj-1',
    userId: 'user-1',
    editor: {
      currentView: 'desktop',
      setCurrentView() {},
      isDraggingOver: false,
      isLoading: false,
      selectedElement: undefined,
      handleDrop() {},
      handleDragOver() {},
      handleDragLeave() {},
      addNewSection() {},
      isReadOnly: false,
      isLocked: false,
      permissions: {
        canCreateElements: true,
        canEditElements: true,
        canDeleteElements: true,
        canReorderElements: true,
      },
      ...over,
    },
    mode: 'editor',
    setMode() {},
    editingMode: 'visual',
    setEditingMode() {},
    pageId: 'page-1',
  };
}

export function withEditor(
  ctx: EditorContextType,
  child: React.ReactElement,
  EditorContext: React.Context<EditorContextType | undefined>,
) {
  return React.createElement(EditorContext.Provider, { value: ctx }, child);
}
