import type {
  AuthMiddlewareOptions,
  AuthPluginConfig,
  RoleGuard,
  UserSessionContext,
} from "../types";
import type { AuthAdapter } from "../types";
import { createCfAccessFromEnv } from "../adapters/cf-access";
import { createAuth0FromEnv } from "../adapters/auth0";
import { config as pluginConfig } from "virtual:rimelight-auth";

function isConfigRecord(obj: unknown): obj is AuthPluginConfig {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

const defaultPluginConfig: AuthPluginConfig = isConfigRecord(pluginConfig) ? pluginConfig : {};

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

const STATIC_ASSET_REGEX =
  /\.(css|js|map|png|jpg|jpeg|gif|svg|webp|woff|woff2|ttf|ico|json|webmanifest)$/i;

const DEFAULT_IGNORED_ROUTES = ["/docs/"];
const DEFAULT_PROTECTED_ROUTES = ["/internal"];
const DEFAULT_GUEST_ONLY_ROUTES = ["/auth/sign-in", "/auth/sign-up"];

function matchesPattern(
  path: string,
  pattern: string | RegExp | ((path: string) => boolean),
): boolean {
  if (typeof pattern === "function") return pattern(path);
  if (typeof pattern === "string") return path.startsWith(pattern) || path.includes(pattern);
  return pattern.test(path);
}

/**
 * Universal Authentication & Authorization middleware for web applications. Automatically uses the
 * default auth adapter (CF Access or Auth0 based on env) if `auth` is not provided.
 *
 * @example
 *   import { auth } from "@rimelight/auth/middleware"
 *
 *   app.use(auth())
 */
export function auth(options: AuthMiddlewareOptions = {}) {
  const authAdapterInstance = options.auth ?? defaultPluginConfig.auth ?? getDefaultAuth();
  const skipStaticAssets = options.skipStaticAssets ?? defaultPluginConfig.skipStaticAssets ?? true;
  const ignoredRoutes =
    options.ignoredRoutes ?? defaultPluginConfig.ignoredRoutes ?? DEFAULT_IGNORED_ROUTES;

  const protectedRoutes =
    options.protectedRoutes ?? defaultPluginConfig.protectedRoutes ?? DEFAULT_PROTECTED_ROUTES;
  const roleGuards = {
    ...defaultPluginConfig.roleGuards,
    ...options.roleGuards,
  };
  const guestOnlyRoutes =
    options.guestOnlyRoutes ?? defaultPluginConfig.guestOnlyRoutes ?? DEFAULT_GUEST_ONLY_ROUTES;
  const authRedirectUrl =
    options.authRedirectUrl ?? defaultPluginConfig.authRedirectUrl ?? "/auth/sign-in";
  const signInUrl = options.signInUrl ?? defaultPluginConfig.signInUrl ?? "/auth/sign-in";
  const homeUrl = options.homeUrl ?? defaultPluginConfig.homeUrl ?? "/";
  const onUnauthorized = options.onUnauthorized ?? defaultPluginConfig.onUnauthorized;
  const onForbidden = options.onForbidden ?? defaultPluginConfig.onForbidden;

  return async (c: any, next: () => Promise<any>): Promise<any> => {
    const rawUrl = c?.req?.url || "http://localhost/";
    const url = new URL(rawUrl);
    const pathname = url.pathname;
    const isApi = pathname.startsWith("/api/");

    // 1. Skip static assets
    if (skipStaticAssets) {
      const isStatic =
        pathname.startsWith("/assets/") ||
        pathname === "/favicon.ico" ||
        pathname.startsWith("/open-graph/") ||
        STATIC_ASSET_REGEX.test(pathname);

      if (isStatic) {
        return await next();
      }
    }

    // 2. Check if path is in ignoredRoutes
    const isIgnored =
      typeof ignoredRoutes === "function"
        ? ignoredRoutes(pathname)
        : ignoredRoutes.some((pattern) => matchesPattern(pathname, pattern));

    if (isIgnored) {
      if (typeof c?.set === "function") {
        c.set("user", null);
        c.set("session", null);
      }
    } else {
      // 3. Resolve session from adapter or custom resolver
      let sessionCtx: UserSessionContext | null = null;
      if (authAdapterInstance) {
        try {
          if (typeof authAdapterInstance === "function") {
            sessionCtx = await authAdapterInstance(c);
          } else if (typeof authAdapterInstance.getSession === "function") {
            const req =
              c.req?.raw instanceof Request ? c.req.raw : new Request(c.req?.url || rawUrl);
            sessionCtx = await authAdapterInstance.getSession(req);
          }
        } catch (err) {
          console.error("[auth] Failed to resolve session:", err);
        }
      }

      const user: UserSessionContext | null = sessionCtx;
      const session = sessionCtx
        ? {
            id: sessionCtx.userId,
            userId: sessionCtx.userId,
            roles: sessionCtx.roles,
            userType: sessionCtx.userType,
          }
        : null;

      if (typeof c?.set === "function") {
        c.set("user", user);
        c.set("session", session);
      }
    }

    const session = typeof c?.get === "function" ? c.get("session") : null;
    const user: UserSessionContext | null = typeof c?.get === "function" ? c.get("user") : null;

    // 4. Handle direct /auth path
    if (pathname === "/auth") {
      return c.redirect(authRedirectUrl);
    }

    // 5. Guest-only routes: redirect if already signed in
    const isGuestOnly = guestOnlyRoutes.some((route) => matchesPattern(pathname, route));
    if (isGuestOnly && session) {
      return c.redirect(homeUrl);
    }

    // 7. Protected routes: ensure session exists
    const isProtected =
      typeof protectedRoutes === "function"
        ? protectedRoutes(pathname)
        : protectedRoutes.some((pattern) => matchesPattern(pathname, pattern));

    if (isProtected && !session) {
      if (onUnauthorized) {
        return onUnauthorized(c, { isApi, path: pathname });
      }
      if (isApi) {
        if (typeof c.json === "function") {
          return c.json({ error: "Unauthorized", message: "Authentication required." }, 401);
        }
        return new Response(
          JSON.stringify({ error: "Unauthorized", message: "Authentication required." }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }
      return c.redirect(signInUrl);
    }

    // 8. Role / Permission Guards
    for (const [guardPath, guardConfig] of Object.entries(roleGuards)) {
      if (matchesPattern(pathname, guardPath)) {
        if (!session) {
          if (onUnauthorized) {
            return onUnauthorized(c, { isApi, path: pathname });
          }
          if (isApi) {
            if (typeof c.json === "function") {
              return c.json({ error: "Unauthorized", message: "Authentication required." }, 401);
            }
            return new Response(
              JSON.stringify({ error: "Unauthorized", message: "Authentication required." }),
              { status: 401, headers: { "Content-Type": "application/json" } },
            );
          }
          return c.redirect(signInUrl);
        }

        let isAllowed = false;
        const userRoles = (user?.roles || []).map((r) => r.toLowerCase());
        const userType = user?.userType;

        if (Array.isArray(guardConfig)) {
          const allowedRoles = guardConfig.map((r) => r.toLowerCase());
          isAllowed = userRoles.includes("*") || allowedRoles.some((r) => userRoles.includes(r));
        } else if (typeof guardConfig === "object" && guardConfig !== null) {
          const { roles, userTypes, check } = guardConfig as RoleGuard;

          if (check) {
            isAllowed = await check(user, c);
          } else {
            const roleMatch = roles
              ? userRoles.includes("*") || roles.some((r) => userRoles.includes(r.toLowerCase()))
              : true;

            const typeMatch = userTypes ? (userType ? userTypes.includes(userType) : false) : true;

            isAllowed = roleMatch && typeMatch;
          }
        }

        if (!isAllowed) {
          if (onForbidden) {
            const requiredRoles = Array.isArray(guardConfig)
              ? guardConfig
              : (guardConfig as RoleGuard).roles;
            return onForbidden(c, { isApi, path: pathname, requiredRoles });
          }
          if (isApi) {
            if (typeof c.json === "function") {
              return c.json(
                { error: "Forbidden", message: "Forbidden: insufficient permissions." },
                403,
              );
            }
            return new Response(
              JSON.stringify({
                error: "Forbidden",
                message: "Forbidden: insufficient permissions.",
              }),
              { status: 403, headers: { "Content-Type": "application/json" } },
            );
          }
          return c.redirect(homeUrl);
        }
      }
    }

    return await next();
  };
}
