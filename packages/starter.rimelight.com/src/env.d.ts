/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}

declare module "*.astro" {
  import type { AstroComponentFactory } from "astro/runtime/server";
  const AstroComponent: AstroComponentFactory;
  export default AstroComponent;
}

interface Env {
  EMAIL: any;
  EMAIL_DOMAIN: string;
}

type ENV = {
  DB: any;
  BLOB: any;
  EMAIL: any;
  ChatRoom: import("@cloudflare/workers-types").DurableObjectNamespace;
  MY_RATE_LIMITER: {
    limit: (options: { key: string }) => Promise<{ success: boolean }>;
  };
};

declare namespace App {
  interface Locals {
    user: import("better-auth").User | null;
    session: import("better-auth").Session | null;
    runtime: import("@astrojs/cloudflare").Runtime<ENV>;
  }
}

declare var DB: any;
declare var BLOB: any;
declare var ChatRoom: any;

declare module "cloudflare:workers" {
  export const env: ENV;
}