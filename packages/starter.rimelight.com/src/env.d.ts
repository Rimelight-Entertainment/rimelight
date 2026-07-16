/// <reference path="../../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

declare global {
    type ENV = {
      DB: any;
      BLOB: any;
      ChatRoom: import("@cloudflare/workers-types").DurableObjectNamespace;
      MY_RATE_LIMITER: {
        limit: (options: { key: string }) => Promise<{ success: boolean }>;
      };
    };
    namespace App {
        interface Locals {
            user: typeof import("./auth/auth").auth.$Infer.Session.user | null;
            session: typeof import("./auth/auth").auth.$Infer.Session.session | null;
            runtime: import("@astrojs/cloudflare").Runtime<ENV>;
        }
    }
    var DB: any;
    var BLOB: any;
    var ChatRoom: any;
}

declare module "cloudflare:workers" {
  export const env: ENV;
}

export {};

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}
