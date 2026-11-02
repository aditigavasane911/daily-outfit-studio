import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig(({ command }) => ({
  plugins: [
    tanstackStart({
      server: { entry: "server" },
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
    command === "build" ? nitro({ defaultPreset: "node-server" }) : null,
  ].filter(Boolean),
  server: {
    port: 3001,
    proxy: {
      "/api/ollama": {
        target: "http://127.0.0.1:11434",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/ollama/, ""),
      },
      "/api": {
        target: (process.env["BACKEND_URL"] as string | undefined) || "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
}));
