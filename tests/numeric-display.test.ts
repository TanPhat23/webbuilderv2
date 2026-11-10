import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { parseNumericDisplay } from '../src/features/editor/components/sidebar/configurations/_shared/parseNumericDisplay';

test('numeric display preserves integer prefix and fallback behavior', () => {
  for (const [input, expected] of [[undefined, '0'], ['', '0'], ['auto', '0'], ['-12.5px', '-12'], ['0', '0'], [25, '25'], ['1e3', '1']] as const) {
    assert.equal(parseNumericDisplay(input), expected);
  }
});
