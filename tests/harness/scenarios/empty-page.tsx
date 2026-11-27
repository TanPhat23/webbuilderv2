import { StageHost } from '../stage';
import { seedEditor } from '../seed';
import type { Scenario } from '../scenario';

export const emptyPage: Scenario = {
  name: 'empty-page',
  description: 'CanvasStage on a page with no elements: the empty-page state.',
  seed: () => seedEditor({ elements: [] }),
  render: () => <StageHost />,
};
