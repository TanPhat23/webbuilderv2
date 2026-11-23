/**
 * Minimal `createServerFn` stand-in: `.validator(fn).handler(fn)` yields a plain
 * async function taking `{ data }`, which is what the real one looks like to callers.
 */
export function createServerFn(_options?: unknown) {
  let validate: (data: unknown) => unknown = (data) => data;
  const builder = {
    validator(fn: (data: never) => unknown) {
      validate = fn as (data: unknown) => unknown;
      return builder;
    },
    handler<T>(fn: (ctx: { data: never }) => Promise<T>) {
      return async (input?: { data?: unknown }): Promise<T> =>
        fn({ data: validate(input?.data) as never });
    },
  };
  return builder;
}
