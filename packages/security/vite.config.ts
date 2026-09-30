import { defineConfig } from "vite-plus";

export default defineConfig({
  pack: {
    entry: ["src/**/*.ts"],
    dts: true,
    deps: {
      // `virtual:sri-manifest` and `virtual:rimelight-security-config` are
      // supplied at app build time by this package's own Vite plugin, so those
      // ids have to survive into the published output as external imports
      // rather than be resolved by the bundler.
      neverBundle: [/^(?:virtual|cloudflare):/],
      // Be explicit so the bundler does not emit its "onlyBundle" hint.
      onlyBundle: false,
    },
  },
});
