import type { AuthAdapter } from "./types";
import { createCfAccessFromEnv } from "./adapters/cf-access";
import { createAuth0FromEnv } from "./adapters/auth0";

let _defaultAuth: AuthAdapter | null = null;

function getDefaultAuth(): AuthAdapter {
  if (!_defaultAuth) {
    const isAuth0 =
      (typeof process !== "undefined" && Boolean(process.env?.["AUTH0_DOMAIN"])) ||
      (typeof import.meta !== "undefined" && Boolean((import.meta as any).env?.["AUTH0_DOMAIN"]));
    _defaultAuth = isAuth0 ? createAuth0FromEnv({ devFallback: true }) : createCfAccessFromEnv();
  }
  return _defaultAuth;
}

/**
 * Auto-detecting auth adapter for use in server-side route handlers and API endpoints. Selects CF
 * Access or Auth0 based on environment variables.
 *
 * For Hono middleware, use `auth` from `@rimelight/auth/middleware` instead.
 */
export const auth: AuthAdapter = {
  name: "auto",
  async getSession(req: Request) {
    return getDefaultAuth().getSession(req);
  },
  handleUnauthorized(req: Request) {
    return (
      getDefaultAuth().handleUnauthorized?.(req) ?? new Response("Unauthorized", { status: 401 })
    );
  },
};
