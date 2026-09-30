import { defineConfig } from "vite-plus";
import solid from "@solidjs/vite-plugin";

export default defineConfig({
  plugins: [solid()],
  // The suite is pure SSR (`renderToString`) and guards every DOM access, so it
  // must not pull in jsdom. `@solidjs/vite-plugin` would otherwise default the
  // environment to "jsdom" and every test file would fail to start.
  test: {
    environment: "node"
  },
  pack: {
    entry: [
      // `src/index.ts` is deliberately absent. It is only the `types` side of the
      // "." export condition (the runtime side is `src/index.tsx`, shipped as raw
      // source), so bundling it would emit a `dist/index.mjs` that no export
      // condition points at. Worse, `vp pack` runs tsdown, not Vite, so the
      // `solid()` JSX transform never runs over the components it re-exports and
      // that dead bundle would be filled with untransformed JSX.
      "src/plugin.ts",
      "src/head.ts",
      "src/preset.ts",
      "src/resolver.ts",
      "src/shortcuts.ts",
      "src/types.ts",
      "src/icons.ts",
      "src/fonts.ts"
    ],
    dts: true,
    deps: {
      // `virtual:rimelight/ui` is supplied at app build time by this package's
      // own Vite plugin, so the id has to survive into the published output as
      // an external import rather than be resolved by the bundler.
      neverBundle: [/^(?:virtual|cloudflare):/],
      // Be explicit so the bundler does not emit its "onlyBundle" hint.
      onlyBundle: false
    }
  }
});
