import { canvas } from './canvas';
import { contextMenu } from './context-menu';
import { emptyPage } from './empty-page';
import type { Scenario } from '../scenario';

/** Register a new scenario here; the index page and `?scenario=` pick it up. */
export const scenarios: ReadonlyArray<Scenario> = [canvas, contextMenu, emptyPage];

export const findScenario = (name: string | null): Scenario | undefined => scenarios.find((s) => s.name === name);
