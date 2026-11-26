import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { useCanvasController } from '../../apps/editor/src/features/editor/components/canvas/useCanvasController';
import { EditorFlagsProvider } from '../../apps/editor/src/features/editor/components/context/EditorFlagsContext';
import { ElementLabel } from '../../apps/editor/src/features/editor/components/resizehandler/ElementLabel';
import { ElementRefInput } from '../../apps/editor/src/features/interactions/components/ElementRefInput';
import { useSelectionStore } from '../../apps/editor/src/features/editor/store/selection-store';
import { CollaboratorRole } from '../../apps/editor/src/features/collaboration';
import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';
import '../../apps/editor/src/app/globals.css';

const element = { id: 'source', type: 'div', styles: { default: {} }, settings: { interactions: { ix_aaaaaaaa: { on: 'click', do: [] } } } } as unknown as EditorElement;
const queryClient = new QueryClient();
const iframeRef: React.RefObject<HTMLIFrameElement | null> = { current: null };

/** Site root harness: the same controller handlers CanvasStage spreads onto the site iframe. */
function SiteRootHarness({ onDown, onClick }: { onDown: () => void; onClick: () => void }): React.ReactElement {
  const [siteRoot, setSiteRoot] = useState<HTMLDivElement | null>(null);
  const { picking, siteHandlers } = useCanvasController({
    siteRoot,
    stageEl: null,
    iframeRef,
    canEdit: true,
    canCreate: true,
    queryClient,
    projectId: 'fixture-project',
    userId: null,
  });
  return (
    <div ref={setSiteRoot} id="wb-site-root" data-picking={picking || undefined} {...siteHandlers}>
      <style>{'#wb-site-root[data-picking], #wb-site-root[data-picking] * { cursor: crosshair !important; }'}</style>
      <div data-element-id="target" draggable onMouseDown={onDown} onClick={onClick} style={{ height: 100, width: 200 }}><span>Target element</span></div>
    </div>
  );
}

function App(): React.ReactElement {
  const [value, setValue] = useState<string | number>('');
  const [withInteraction, setWithInteraction] = useState(true);
  const [downs, setDowns] = useState(0);
  const [clicks, setClicks] = useState(0);
  const selected = useSelectionStore(s => s.selectedElementId);
  return <main>
    <ElementRefInput value={value} onChange={setValue} elements={[{id:'target',name:'Target'}]} ctx={{variables:[],stepIds:[],elements:[]}} aria-label="Target" />
    <output data-testid="picked">{value}</output><output data-testid="selected">{selected}</output>
    <output data-testid="downs">{downs}</output><output data-testid="clicks">{clicks}</output>
    <button onClick={() => setWithInteraction(v => !v)}>Toggle marker</button>
    <div style={{ position:'relative', marginTop:50 }}><ElementLabel element={withInteraction ? element : { ...element, settings: {} } as EditorElement} showSpacingInfo={false} onToggleSpacing={() => {}} /></div>
    <EditorFlagsProvider isReadOnly={false} isLocked={false} permissionsRole={CollaboratorRole.VIEWER} canEdit canCreate>
      <SiteRootHarness onDown={() => setDowns(n => n + 1)} onClick={() => setClicks(n => n + 1)} />
    </EditorFlagsProvider>
  </main>;
}
useSelectionStore.setState({selectedElementId:'source'});
createRoot(document.getElementById('root')!).render(<App />);
