import { createServer } from 'vite';
import { createHarnessConfig } from './harness.config';

const PORT = 3200;

const server = await createServer(createHarnessConfig({ port: PORT, strictPort: true }));
await server.listen();
console.log(`harness: http://127.0.0.1:${PORT}/  (scenarios are listed on the index page, open /?scenario=<name>)`);

const stop = (): void => {
  void server.close().finally(() => process.exit(0));
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
