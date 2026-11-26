import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../..", "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return {
    envDir: "../..",
    resolve: { tsconfigPaths: true },
    server: {
      port: 3000,
    },
    plugins: [
      tailwindcss(),
      tanstackStart({
        srcDirectory: "src",
        router: {
          routesDirectory: "app",
        },
      }),
      nitro({
        preset: "node-server",
        traceDeps: ["isomorphic-dompurify*", "jsdom*", "cssstyle*"],
      }),
      viteReact(),
    ],
  };
});
