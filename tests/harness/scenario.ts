import type { ReactNode } from 'react';

/** One mountable editor UI state. Scenarios live in `scenarios/<name>.tsx` and are listed in `scenarios/index.ts`. */
export interface Scenario {
  /** Used as `?scenario=<name>`. */
  readonly name: string;
  readonly description: string;
  /** Puts every store the scenario needs into a known state. Called on load and on `__harness.reset()`. */
  seed(): void;
  /** The real component under test. The shell supplies the providers it needs. */
  render(): ReactNode;
}
