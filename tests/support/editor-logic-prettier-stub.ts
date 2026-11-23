/** Stands in for `prettier/standalone` and `prettier/parser-babel`. */
export const state: { mode: 'ok' | 'identity' | 'throws' | 'no-format'; lastOptions?: unknown } = { mode: 'ok' };
export const parser = { name: 'babel-parser-stub' };

const standalone = {
  format(source: string, options: unknown) {
    state.lastOptions = options;
    if (state.mode === 'throws') throw new Error('syntax error');
    if (state.mode === 'identity') return source;
    return Promise.resolve('formatted: ' + source);
  },
};

export default new Proxy(parser as Record<string, unknown>, {
  get(target, key) {
    if (key === 'format') return state.mode === 'no-format' ? undefined : standalone.format;
    return target[key as string];
  },
});
export const format = (source: string, options: unknown) => standalone.format(source, options);
