import { defineConfig } from "vite-plus";
import solid from "@solidjs/vite-plugin";
import { ui } from "@rimelight/ui/plugin";
import { cms } from "@rimelight/cms/plugin";

// Kept apart from vite.config.ts: that file loads the Cloudflare and SEO plugins, which tests
// don't need, and it auto-migrates the database. Tests here render the site's CMS block
// components in happy-dom. The UI and CMS plugins supply the `virtual:rimelight-*` modules
// that the packages' runtimes import.
export default defineConfig({
  plugins: [solid(), ui({}), cms({ autoMigrate: false })],
  test: {
    environment: "happy-dom",
    include: ["test/**/*.test.{ts,tsx}"],
  },
});
