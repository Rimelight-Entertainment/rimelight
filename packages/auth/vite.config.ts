import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: [
      "src/index.ts",
      "src/types.ts",
      "src/adapters/cf-access.ts",
      "src/adapters/auth0.ts",
      "src/adapters/mock.ts",
      "src/permissions/index.ts",
      "src/plugins/reserved-usernames/index.ts",
      "src/middleware/index.ts",
      "src/client/index.ts",
      "src/jwt.ts",
      "src/plugin.ts",
    ],
  },
});
