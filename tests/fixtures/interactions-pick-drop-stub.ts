import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';

/** The pick fixture never drops sidebar elements; this keeps the project API (server fns) out of the browser bundle. */
export function resolveInsertedElement(): EditorElement | undefined { return undefined; }
