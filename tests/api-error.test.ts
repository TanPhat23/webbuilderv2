import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  ApiError, errorMessage, isRetryable, networkError, parseErrorResponse,
} from '../src/services/api-error';
import { classifyClose, handleServerError } from '../src/features/collaboration/lib/yjs/connectionErrors';

test('parses the Go error shape', () => {
  const e = parseErrorResponse(403, JSON.stringify({ error: 'Access denied', requestId: 'r1' }));
  assert.equal(e.kind, 'forbidden');
  assert.equal(e.message, 'Access denied');
  assert.equal(e.requestId, 'r1');
});

test('validation errors keep per-field messages', () => {
  const e = parseErrorResponse(422, JSON.stringify({
    error: 'Validation failed',
    fields: [{ field: 'Name', tag: 'required', message: 'Name is required' }, { nope: 1 }],
  }));
  assert.equal(e.kind, 'validation');
  assert.deepEqual(e.fields, [{ field: 'Name', message: 'Name is required', tag: 'required' }]);
  assert.equal(errorMessage(e), 'Name is required');
});

test('5xx never exposes the raw server message', () => {
  const e = parseErrorResponse(500, JSON.stringify({ error: 'Failed to create project', message: 'ERROR: column "x" does not exist', requestId: 'abc' }));
  assert.equal(e.kind, 'server');
  assert.ok(!e.message.includes('column'));
  assert.equal(e.requestId, 'abc');
});

test('non-JSON and empty bodies fall back by status', () => {
  assert.equal(parseErrorResponse(502, '<html>Bad gateway</html>').kind, 'server');
  assert.equal(parseErrorResponse(401, '').message, 'Your session has expired. Please sign in again.');
  assert.equal(parseErrorResponse(404, 'null').kind, 'not_found');
});

test('retry only for network, timeout and 5xx', () => {
  assert.equal(isRetryable(networkError(new TypeError('fetch failed'))), true);
  assert.equal(isRetryable(networkError(new DOMException('t', 'TimeoutError'))), true);
  assert.equal(isRetryable(parseErrorResponse(503, '')), true);
  assert.equal(isRetryable(parseErrorResponse(501, '')), false);
  assert.equal(isRetryable(parseErrorResponse(404, '')), false);
  assert.equal(isRetryable(parseErrorResponse(422, '')), false);
  assert.equal(isRetryable(new Error('x')), false);
  assert.equal(new ApiError('m', 0, 'network').status, 0);
});

test('errorMessage handles plain errors and junk', () => {
  assert.equal(errorMessage(new Error('boom')), 'boom');
  assert.equal(errorMessage('nope', 'fb'), 'fb');
});

test('close codes: transient vs fatal', () => {
  for (const c of [1000, 1001, 1006, 1011, 1012, 1013]) assert.equal(classifyClose(c).fatal, false);
  assert.deepEqual(classifyClose(1008).fatal && (classifyClose(1008) as { reason: string }).reason, 'forbidden');
  assert.equal((classifyClose(4401) as { reason: string }).reason, 'auth');
  assert.equal((classifyClose(4404) as { reason: string }).reason, 'not_found');
});

test('server error codes map to actions', () => {
  assert.equal(handleServerError('JOIN_REQUIRED').rejoin, true);
  assert.equal(handleServerError('NOT_FOUND').blocking, true);
  assert.equal(handleServerError('VALIDATION_ERROR', 'bad').message, 'bad');
  assert.equal(handleServerError('PROCESS_ERROR').blocking, false);
});
