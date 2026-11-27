import type { ReactElement } from 'react';
import CanvasStage from '../../apps/editor/src/features/editor/components/canvas/CanvasStage';

const params = new URLSearchParams(location.search);
const size = (key: string, fallback: number): number => Number(params.get(key) ?? fallback);

/** The real canvas stage in a fixed-size host; `?w=` and `?h=` size the host (default 800x700). */
export function StageHost(): ReactElement {
  return (
    <div data-testid="stage-host" style={{ width: size('w', 800), height: size('h', 700), position: 'relative' }}>
      <CanvasStage />
    </div>
  );
}
