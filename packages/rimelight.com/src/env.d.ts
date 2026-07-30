/// <reference path="../.astro/types.d.ts" />

// Enables importing `.astro` components inside `.ts` files (e.g., email rendering)
declare module "*.astro" {
  export default {} as import("astro/runtime/server").AstroComponentFactory;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "virtual:rimelight-ui-docs-meta" {
  const meta: Record<string, any>;
  export default meta;
}

