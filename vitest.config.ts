import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: "forks",
  },
  resolve: {
    alias: {
      "@shared": "/shared",
      "@": "/client/src",
    },
  },
  esbuild: {
    target: "es2022",
  },
});
