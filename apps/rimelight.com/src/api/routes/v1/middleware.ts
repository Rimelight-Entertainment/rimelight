import { createMiddleware } from "hono/factory";
import { verifyAuth0Jwt } from "@rimelight/cms/identity";
import { getDb } from "#db";
import type { AppUser } from "#db/schema/users";
import { ProvisionConflictError, provisionUser } from "./provision";
import { t } from "@rimelight/i18n";

export type ClientVariables = { jwtPayload: Record<string, any>; user: AppUser };

export const requireClientToken = createMiddleware<{ Bindings: Env; Variables: ClientVariables }>(
  async (c, next) => {
    const header = c.req.header("Authorization") ?? "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token)
      return c.json({ error: "Unauthorized", message: t("api.message.bearer-missing") }, 401);

    // verifyJwtRs256 skips the audience check when no audience is given, so a missing binding
    // would accept a token minted for any API in the tenant. Fail closed instead.
    if (!c.env.AUTH0_AUDIENCE) {
      console.error("[client] AUTH0_AUDIENCE is not set; refusing client API requests");
      return c.json(
        { error: "Internal Server Error", message: t("api.message.server-misconfigured") },
        500,
      );
    }

    // Read these bindings directly. getAuth0ConfigFromEnv() is not used here.
    const payload = await verifyAuth0Jwt(token, {
      domain: c.env.AUTH0_DOMAIN,
      audience: c.env.AUTH0_AUDIENCE,
    });
    if (!payload?.["sub"])
      return c.json({ error: "Unauthorized", message: t("api.message.token-invalid") }, 401);

    if (payload["https://rimelight.com/user_type"] !== "user") {
      return c.json({ error: "Forbidden", message: t("api.message.player-account-required") }, 403);
    }

    const email = payload["https://rimelight.com/email"];
    if (typeof email !== "string" || !email) {
      return c.json({ error: "Unauthorized", message: t("api.message.token-no-email") }, 401);
    }

    try {
      c.set("user", await provisionUser(getDb(), { sub: payload["sub"], email }));
    } catch (err) {
      if (err instanceof ProvisionConflictError) {
        console.error("[client] provisioning conflict for sub", payload["sub"]);
        return c.json({ error: "Conflict", message: err.message }, 409);
      }
      throw err;
    }

    c.set("jwtPayload", payload);
    return await next();
  },
);
