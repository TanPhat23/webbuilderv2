import { StageHost } from '../stage';
import { seedEditor } from '../seed';
import { SECTION_GRID_CSS, sectionGridTree } from '../trees';
import type { Scenario } from '../scenario';

export const canvas: Scenario = {
  name: 'canvas',
  description: 'CanvasStage: Section > grid Frame > two Texts with responsive (md) styles. Size it with ?w=800&h=700.',
  seed: () => seedEditor({ elements: sectionGridTree(), project: { header: { cssStyles: SECTION_GRID_CSS } } }),
  render: () => <StageHost />,
};
