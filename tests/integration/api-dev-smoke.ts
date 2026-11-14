import { strict as assert } from 'node:assert';
import { test } from 'node:test';

test('API /ws joins a page using its fixed DEV_MODE identity', async () => {
  const url = `${process.env.IT_WS_URL}/ws/proj1?token=ignored`;
  const socket = new WebSocket(url);
  try {
    const seen = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('timed out waiting for API page sync')), 5000);
      socket.onerror = () => { clearTimeout(timeout); reject(new Error('API websocket failed')); };
      socket.onopen = () => socket.send(JSON.stringify({ type: 'join', pageId: 'p30', timestamp: Date.now(), payload: {} }));
      socket.onmessage = (event) => {
        const message = JSON.parse(String(event.data));
        if (message.type === 'error') { clearTimeout(timeout); reject(new Error(JSON.stringify(message))); }
        if (message.type === 'sync:page') { clearTimeout(timeout); resolve(message); }
      };
    });
    assert.equal(seen.pageId, 'p30');
  } finally { socket.close(); }
});
