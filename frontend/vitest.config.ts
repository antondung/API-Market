import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  test: {
    env: { VITE_API_BASE_URL: "" },
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 15000,
  },
});
