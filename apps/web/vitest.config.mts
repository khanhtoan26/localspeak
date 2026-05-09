import path from "path";
import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "e2e/**"],
    setupFiles: ["./test/setup.ts"],
  },
});
