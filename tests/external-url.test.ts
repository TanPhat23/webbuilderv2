import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { isExternalLink, isExternalMedia } from '../src/features/editor/components/sidebar/configurations/_shared/externalUrl';

test('external URL checks preserve link and media protocol rules', () => {
  for (const url of ['http://example.com', 'https://example.com']) {
    assert.equal(isExternalLink(url), true);
    assert.equal(isExternalMedia(url), true);
  }
  assert.equal(isExternalLink('//example.com'), true);
  assert.equal(isExternalMedia('//example.com'), false);
  for (const url of ['', '/local', 'mailto:test@example.com', 'HTTP://example.com']) {
    assert.equal(isExternalLink(url), false);
    assert.equal(isExternalMedia(url), false);
  }
});
