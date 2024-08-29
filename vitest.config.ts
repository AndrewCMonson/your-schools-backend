import { configDefaults, defineConfig } from "vitest/config";
import { config } from "dotenv";

export default defineConfig({
  test: {
    exclude: [...configDefaults.exclude, "packages/template/*"],
    env: {
      ...config({ path: ".env" }).parsed,
    },
  },
});
