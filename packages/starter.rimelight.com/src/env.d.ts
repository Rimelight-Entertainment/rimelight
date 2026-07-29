/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module "*.astro" {
  import type { AstroComponentFactory } from "astro/runtime/server";
  const AstroComponent: AstroComponentFactory;
  export default AstroComponent;
}

declare namespace App {
  interface Locals {
    user: import("better-auth").User | null;
    session: import("better-auth").Session | null;
    runtime: import("@astrojs/cloudflare").Runtime<Env>;
  }
}

declare var DB: any;
declare var BLOB: any;
declare var ChatRoom: any;

declare module "cloudflare:workers" {
  export const env: Env;
}