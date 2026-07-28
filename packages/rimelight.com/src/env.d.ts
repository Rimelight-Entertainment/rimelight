/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference path="../node_modules/@rimelight/ui/src/env.d.ts" />

declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<object, object, any>
  export default component
}

type ENV = {
    DB?: any;
    BLOB?: any;
    EMAIL?: any;
    TURNSTILE_SITE_KEY?: string;
    TURNSTILE_SECRET_KEY?: string;
}

declare namespace App {
    interface Locals {
        user: import("better-auth").User | null;
        session: import("better-auth").Session | null;
        runtime?: import("@astrojs/cloudflare").Runtime<ENV>;
    }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}

declare module '*.astro' {
  import type { AstroComponentFactory } from 'astro/runtime/server';
  const AstroComponent: AstroComponentFactory;
  export default AstroComponent;
}

declare module "virtual:rimelight-ui-docs-meta" {
  import type { ComponentMetaMap } from "@rimelight/docs"
  const meta: ComponentMetaMap
  export default meta
}
