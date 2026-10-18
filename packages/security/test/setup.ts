import { beforeEach, vi } from "vite-plus/test";
import type { Context, Next } from "hono";

vi.mock("virtual:rimelight-security", () => ({
  config: {},
}));

vi.mock("../src/middleware", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../src/middleware")>();
  const { activeConfig } = await import("../src/runtime");

  const defaults = {
    strictDynamic: true,
    enforceTls: true,
    devOnly: true,
    crossOriginResourcePolicy: "same-origin" as const,
    crossOriginOpenerPolicy: "same-origin" as const,
    crossOriginEmbedderPolicy: "credentialless" as const,
    stripHeaders: ["x-powered-by", "server", "x-aspnet-version", "public-key-pins"],
    manifest: {},
    ratelimit: { bindingName: "MY_RATE_LIMITER", retryAfter: 60 },
    construction: {
      constructionPath: "/construction",
      cookieName: "rimelight-construction-guest",
      cookieMaxAge: 604800,
    },
  };

  return {
    ...actual,
    security: () => {
      const mw = actual.security();
      return async (c: Context, next: Next) => {
        for (const [k, v] of Object.entries(defaults)) {
          if (!(k in activeConfig)) {
            (activeConfig as Record<string, unknown>)[k] =
              typeof v === "object" && !Array.isArray(v) ? { ...v } : v;
          } else if (
            (k === "ratelimit" || k === "construction") &&
            typeof (activeConfig as Record<string, unknown>)[k] === "object" &&
            (activeConfig as Record<string, unknown>)[k] !== null
          ) {
            (activeConfig as Record<string, unknown>)[k] = {
              ...(v as object),
              ...((activeConfig as Record<string, unknown>)[k] as object),
            };
          }
        }

        const req = c.req as unknown as Record<string, unknown>;
        const raw = req["raw"] as { url?: string; headers?: Headers } | undefined;
        const pathStr = typeof req["path"] === "string" ? req["path"] : "/";
        req["url"] ??= raw?.url ?? `http://localhost${pathStr}`;
        const origHeader = req["header"] as ((n: string) => string | undefined) | undefined;
        req["header"] = (n: string) => origHeader?.(n) ?? raw?.headers?.get?.(n) ?? undefined;
        req["query"] ??= (k: string) =>
          new URL(req["url"] as string, "http://localhost").searchParams.get(k) ?? undefined;

        if (!raw || typeof (raw as Request).clone !== "function") {
          const headers = new Headers(raw?.headers);
          for (const h of ["content-type", "cookie", "x-forwarded-proto", "CF-Connecting-IP"]) {
            const val = (req["header"] as (n: string) => string | undefined)(h);
            if (val && !headers.has(h)) headers.set(h, val);
          }
          req["raw"] = {
            headers,
            clone: () => ({
              formData: () =>
                (req["formData"] as (() => Promise<FormData>) | undefined)?.() ??
                (req["parseBody"] as (() => Promise<FormData>) | undefined)?.() ??
                Promise.resolve(new FormData()),
              json: () =>
                (req["json"] as (() => Promise<unknown>) | undefined)?.() ?? Promise.resolve({}),
            }),
          };
        }

        const ctxRec = c as unknown as Record<string, unknown>;
        ctxRec["text"] ??= (text: string, status = 200) => new Response(text, { status });
        ctxRec["redirect"] ??= (location: string, status = 302) =>
          Response.redirect(location, status);

        let downstream: unknown;
        const res = await mw(c, async () => {
          downstream = await next();
        });
        if (res) c.res = res;
        return res ?? c.res ?? downstream;
      };
    },
  };
});

beforeEach(async () => {
  const { activeConfig } = await import("../src/runtime");
  Object.assign(activeConfig, {
    strictDynamic: true,
    enforceTls: true,
    devOnly: true,
    crossOriginResourcePolicy: "same-origin",
    crossOriginOpenerPolicy: "same-origin",
    crossOriginEmbedderPolicy: "credentialless",
    stripHeaders: ["x-powered-by", "server", "x-aspnet-version", "public-key-pins"],
    ratelimit: { bindingName: "MY_RATE_LIMITER", retryAfter: 60 },
    construction: {
      constructionPath: "/construction",
      cookieName: "rimelight-construction-guest",
      cookieMaxAge: 604800,
    },
  });
});
