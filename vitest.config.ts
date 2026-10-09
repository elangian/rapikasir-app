import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Local tests must not load Supabase or other deployment environment files.
  envDir: false,
  plugins: [react()],
  test: { environment: "node" },
});
