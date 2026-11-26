import { v7 } from 'uuid';

/** Generate a full, time-ordered ID for a persistent entity. */
export function newEntityId(): string {
  return v7();
}
