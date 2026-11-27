import type { ReactElement } from 'react';
import { Toaster } from '../../../apps/editor/src/components/ui/sonner';
import { useAiChat } from '../../../apps/editor/src/providers/aiprovider';
import { useEditorChromeStore } from '../../../apps/editor/src/features/editor/store/editor-chrome-store';
import { StageHost } from '../stage';
import { seedEditor } from '../seed';
import { SECTION_GRID_CSS, sectionGridTree } from '../trees';
import type { Scenario } from '../scenario';

/** Makes the effects of menu actions observable: the queued Ask AI prompt, the open rail panel and toasts. */
function MenuObservers(): ReactElement {
  const { pendingRequest } = useAiChat();
  const activePanel = useEditorChromeStore((s) => (s.panelOpen ? s.activePanel : 'closed'));
  return (
    <>
      <output data-testid="ai-pending">{pendingRequest ? JSON.stringify(pendingRequest) : ''}</output>
      <output data-testid="rail-panel">{activePanel}</output>
      <Toaster />
    </>
  );
}

export const contextMenu: Scenario = {
  name: 'context-menu',
  description: 'The canvas tree with the real EditorContextMenu enabled and the AI chat provider present. Right-click a Text or select it and press Shift+F10.',
  seed: () => seedEditor({ elements: sectionGridTree(), project: { header: { cssStyles: SECTION_GRID_CSS } }, selectedElementId: undefined }),
  render: () => (
    <>
      <StageHost />
      <MenuObservers />
    </>
  ),
};
