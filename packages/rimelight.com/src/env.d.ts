/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference path="../node_modules/@rimelight/ui/src/env.d.ts" />

declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<object, object, any>
  export default component
}

declare namespace App {
    interface Locals {
        user: import("better-auth").User | null;
        session: import("better-auth").Session | null;
    }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}

declare module "virtual:rimelight-ui-docs-meta" {
  import type { ComponentMetaMap } from "@rimelight/docs"
  const meta: ComponentMetaMap
  export default meta
}
