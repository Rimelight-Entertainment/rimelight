/// <reference path="../.astro/types.d.ts" />

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
declare module "turndown";
declare module "turndown-plugin-gfm";
