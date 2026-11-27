import { StageHost } from '../stage';
import { seedEditor } from '../seed';
import { edgeToEdgeCardTree } from '../trees';
import type { Scenario } from '../scenario';

export const edgeCard: Scenario = {
  name: 'edge-card',
  description: 'Section "Menu" > card Frame > cover Frame > caption Text, each child exactly filling its parent. Try the label Select parent button, right-click > Select layer, and Ctrl/Cmd+click.',
  seed: () => seedEditor({ elements: edgeToEdgeCardTree() }),
  render: () => <StageHost />,
};
