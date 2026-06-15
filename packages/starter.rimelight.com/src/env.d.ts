/// <reference path="../../.astro/types.d.ts" />
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
        }
    }
    var DB: any;
    var BLOB: any;
}

export {};


