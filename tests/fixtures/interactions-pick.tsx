import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CanvasInteractionLayer } from '../../src/features/editor/components/canvas/CanvasInteractionLayer';
import { EditorFlagsProvider } from '../../src/features/editor/components/context/EditorFlagsContext';
import { ElementLabel } from '../../src/features/editor/components/resizehandler/ElementLabel';
import { ElementRefInput } from '../../src/features/interactions/components/ElementRefInput';
import { useSelectionStore } from '../../src/features/editor/store/selection-store';
import { CollaboratorRole } from '../../src/features/collaboration';
import type { EditorElement } from '../../src/types/global.type';
import '../../src/app/globals.css';

const element = { id: 'source', type: 'div', styles: { default: {} }, settings: { interactions: { ix_aaaaaaaa: { on: 'click', do: [] } } } } as unknown as EditorElement;
function App() {
  const [value, setValue] = useState<string | number>('');
  const [withInteraction, setWithInteraction] = useState(true);
  const selected = useSelectionStore(s => s.selectedElementId);
  return <main>
    <ElementRefInput value={value} onChange={setValue} elements={[{id:'target',name:'Target'}]} ctx={{variables:[],stepIds:[],elements:[]}} aria-label="Target" />
    <output data-testid="picked">{value}</output><output data-testid="selected">{selected}</output>
    <button onClick={() => setWithInteraction(v => !v)}>Toggle marker</button>
    <div style={{ position:'relative', marginTop:50 }}><ElementLabel element={withInteraction ? element : { ...element, settings: {} } as EditorElement} showSpacingInfo={false} onToggleSpacing={() => {}} /></div>
    <EditorFlagsProvider isReadOnly={false} isLocked={false} permissionsRole={CollaboratorRole.VIEWER} canEdit canCreate>
      <CanvasInteractionLayer><div data-element-id="target" draggable onMouseDown={() => { (window as any).downs++; }} onClick={() => { (window as any).clicks++; }} style={{height:100,width:200}}><span>Target element</span></div></CanvasInteractionLayer>
    </EditorFlagsProvider>
  </main>;
}
(window as any).clicks = 0; (window as any).downs = 0;
useSelectionStore.setState({selectedElementId:'source'});
createRoot(document.getElementById('root')!).render(<App />);
