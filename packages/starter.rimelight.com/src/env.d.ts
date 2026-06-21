/// <reference path="../../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

type ENV = {
  ChatRoom: import("@cloudflare/workers-types").DurableObjectNamespace;
  MY_RATE_LIMITER: {
    limit: (options: { key: string }) => Promise<{ success: boolean }>;
  };
};

declare global {
    namespace App {
        interface Locals {
            user: import("better-auth").User | null;
            session: import("better-auth").Session | null;
            runtime: import("@astrojs/cloudflare").Runtime<ENV>;
        }
    }
    var DB: any;
    var BLOB: any;
}

export {};

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}
