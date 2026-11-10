import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { EventTypeSchema, ActionTypeSchema } from '../src/features/eventworkflows/schema/eventSchemas';

test('event and action schemas preserve their supported vocabulary and order', () => {
  assert.deepEqual(EventTypeSchema.options, ['onClick', 'onDoubleClick', 'onMouseEnter', 'onMouseLeave', 'onMouseDown', 'onMouseUp', 'onFocus', 'onBlur', 'onChange', 'onSubmit', 'onKeyDown', 'onKeyUp', 'onScroll', 'onLoad', 'onError']);
  assert.deepEqual(EventTypeSchema.enum, Object.fromEntries(EventTypeSchema.options.map(value => [value, value])));
  assert.deepEqual(ActionTypeSchema.enum, Object.fromEntries(ActionTypeSchema.options.map(value => [value, value])));
  assert.deepEqual(ActionTypeSchema.options, ['navigate', 'showElement', 'hideElement', 'toggleElement', 'apiCall', 'setData', 'customCode', 'scrollTo', 'modal', 'submitForm', 'resetForm', 'playAnimation', 'showNotification', 'copyToClipboard', 'downloadFile', 'toggleClass', 'addClass', 'removeClass']);
});
