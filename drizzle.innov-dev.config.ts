import { defineConfig } from "drizzle-kit";
import applicationConfig from "./drizzle.config";

export default defineConfig({
  ...applicationConfig,
  schema: "./shared/innovDevDatabaseSchema.ts",
  tablesFilter: ["innov_dev_sites", "innov_dev_replit_connections"],
  strict: true,
  verbose: true,
});
