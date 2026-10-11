import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // src/lib/env.ts validates on import, so tests need a complete environment.
    env: {
      NEXT_PUBLIC_API_URL: "http://localhost:3000",
      NEXT_PUBLIC_WS_URL: "ws://localhost:3000",
      NEXT_PUBLIC_MAP_STYLE_URL: "https://tiles.openfreemap.org/styles/positron",
    },
  },
});
