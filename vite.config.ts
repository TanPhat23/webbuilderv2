import { defineConfig, type Plugin } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

const serverOnlyModules = [
  path.resolve(__dirname, "src/lib/prisma.ts"),
  path.resolve(__dirname, "src/generated/client.ts"),
];

const serverOnlyPackages = [
  "@prisma/client",
  "@prisma/adapter-pg",
  "pg",
  "pg-native",
  "pgpass",
  "pg-connection-string",
  "split2",
];

function serverOnlyStubPlugin(): Plugin {
  return {
    name: "server-only-stub",
    enforce: "pre",
    resolveId(id, importer, options) {
      if (options?.ssr) return null;
      if (serverOnlyPackages.some((pkg) => id === pkg || id.startsWith(pkg + "/"))) {
        return { id: "\0server-only-stub", external: false };
      }
      return null;
    },
    load(id, options) {
      if (options?.ssr) return null;
      if (id === "\0server-only-stub") {
        return "export default {}; export const PrismaClient = class {};";
      }
      const normalized = id.split("?")[0];
      if (serverOnlyModules.includes(normalized)) {
        return "export default {}; export const PrismaClient = class {};";
      }
      return null;
    },
    transform(code, id, options) {
      if (options?.ssr) return null;
      const normalized = id.split("?")[0];
      if (serverOnlyModules.includes(normalized)) {
        return { code: "export default {}; export const PrismaClient = class {};", map: null };
      }
      return null;
    },
  };
}

export default defineConfig({
  server: {
    port: 3000,
  },
  optimizeDeps: {
    exclude: serverOnlyPackages,
  },
  ssr: {
    external: serverOnlyPackages,
  },
  plugins: [
    tailwindcss(),
    serverOnlyStubPlugin(),
    tsconfigPaths(),
    tanstackStart({
      srcDirectory: "src",
      router: {
        routesDirectory: "app",
      },
    }),
    viteReact(),
  ],
});