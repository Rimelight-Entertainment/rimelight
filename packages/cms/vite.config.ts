import { defineConfig } from "vite-plus";
import solid from "@solidjs/vite-plugin";
import { ui } from "@rimelight/ui/plugin";
import { i18n } from "@rimelight/i18n/plugin";
const setupFiles = ["./test/setup.ts"];

export default defineConfig({
  test: {
    setupFiles,
    // Two projects: logic tests run on Solid's server build (its reactive writes are not batched,
    // which the editor tests rely on); renderer tests get the browser build, JSX transform and the
    // UI plugin that supplies `virtual:rimelight-ui`.
    projects: [
      {
        extends: true,
        plugins: [i18n({ dir: "test/fixtures/i18n", types: false })],
        test: {
          name: "logic",
          include: ["test/**/*.test.ts"],
          environment: "happy-dom",
          environmentOptions: { happyDOM: { settings: { disableIframePageLoading: true } } },
        },
      },
      {
        plugins: [solid(), ui({}), i18n({ dir: "test/fixtures/i18n", types: false })],
        test: {
          name: "render",
          include: ["test/**/*.test.tsx"],
          environment: "happy-dom",
          environmentOptions: { happyDOM: { settings: { disableIframePageLoading: true } } },
        },
      },
    ],
  },
  pack: {
    entry: [
      "src/index.ts",
      "src/plugin.ts",
      "src/schema/index.ts",
      "src/schema/sqlite.ts",
      "src/services/index.ts",
      "src/storage/index.ts",
      "src/middleware/index.ts",
      "src/identity/index.ts",
      "src/server/index.ts",
      "src/migrator/index.ts",
      "src/migrator/cli.ts",
      "src/cron/scheduled.ts",
      "src/mcp/index.ts",
      "src/docs/index.ts",
    ],
    dts: { generator: "oxc" },
    deps: {
      neverBundle: [/^virtual:/],
    },
  },
});
