/** Controllable `@tanstack/react-start/server` for server-function tests. */
export const responseHeaders: Record<string, string> = {};
export const setResponseHeader = (name: string, value: string) => {
  responseHeaders[name] = value;
};
