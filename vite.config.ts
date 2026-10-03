import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  test: {
    projects: ["packages/*/vite.config.ts"],
  },
  run: {
    cache: true,
    tasks: {
      audit: {
        command: "pnpm audit",
        cache: {
          input: [
            "pnpm-lock.yaml",
            "pnpm-workspace.yaml",
            "package.json",
            "apps/*/package.json",
            "packages/*/package.json",
          ],
        },
      },
      build: {
        command: 'vp run -F "./apps/*" build',
      },
      check: {
        dependsOn: [
          "audit",
          "@rimelight/auth#check",
          "@rimelight/cli#check",
          "@rimelight/cms#check",
          "@rimelight/config#check",
          "@rimelight/i18n#check",
          "@rimelight/security#check",
          "@rimelight/seo#check",
          "@rimelight/ui#check",
          "rimelight-dot-com#check",
          "starter-dot-rimelight-dot-com#check",
        ],
        command: 'node -e "process.exit(0)"',
      },
    },
  },
});
