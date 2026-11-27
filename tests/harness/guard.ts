/**
 * Fails every request that is not a same-origin GET (vite modules and assets). Real APIs are
 * never reachable from the harness, so anything else is a missing stub and must be loud.
 */
const loud = (target: string): Error => {
  const error = new Error(`harness: unstubbed request to ${target}`);
  console.error(error.message);
  return error;
};

const isAllowed = (url: URL, method: string): boolean => url.origin === location.origin && method.toUpperCase() === 'GET';

export function installNetworkGuard(): void {
  const realFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const request = new Request(input, init);
    if (!isAllowed(new URL(request.url, location.href), request.method)) return Promise.reject(loud(request.url));
    return realFetch(input, init);
  };

  const realOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function open(this: XMLHttpRequest, method: string, url: string | URL, ...rest: [boolean?, string?, string?]): void {
    if (!isAllowed(new URL(url, location.href), method)) throw loud(String(url));
    realOpen.call(this, method, url, ...(rest as [boolean, string?, string?]));
  };

  navigator.sendBeacon = (url: string | URL): boolean => { loud(String(url)); return false; };
}
