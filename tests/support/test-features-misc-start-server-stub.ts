/** Controllable `@tanstack/react-start/server` for server-function tests. */
export const responseHeaders: Record<string, string> = {};
export const requestHeaders: Record<string, string> = {};
export const setResponseHeader = (name: string, value: string): void => {
  responseHeaders[name] = value;
};
export const appendResponseHeader = (name: string, value: string): void => {
  responseHeaders[name] = responseHeaders[name]
    ? `${responseHeaders[name]}, ${value}`
    : value;
};
export const getRequestHeader = (name: string): string | undefined =>
  requestHeaders[name.toLowerCase()];
export const getRequestProtocol = (): string => "https";
