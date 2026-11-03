import { createMiddleware } from "hono/factory";
import { t } from "@rimelight/i18n";

/**
 * Compares two strings without leaking where they first differ. The length check is not secret: the token's length is fixed.
 */
function sameSecret(given: string, expected: string): boolean {
  if (given.length !== expected.length) return false;
  let difference = 0;
  for (let i = 0; i < given.length; i++) {
    difference |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return difference === 0;
}

/**
 * Lets only the Unreal game server through to the estate's write routes. The server sends `Authorization: Server <token>`,
 * where the token is GT_ESTATE_SERVER_TOKEN, the same value it is configured with. Refused when the token is not set.
 */
export const requireGameServer = createMiddleware<{ Bindings: Env }>(async (c, next) => {
  const expected = c.env.GT_ESTATE_SERVER_TOKEN;
  if (!expected) {
    console.error("[estate] GT_ESTATE_SERVER_TOKEN is not set; refusing estate server requests");
    return c.json(
      { error: "Internal Server Error", message: t("api.message.server-misconfigured") },
      500,
    );
  }

  const header = c.req.header("Authorization") ?? "";
  const given = header.startsWith("Server ") ? header.slice(7) : "";
  if (!given || !sameSecret(given, expected)) {
    return c.json(
      { error: "Unauthorized", message: t("api.message.estate-server-unauthorized") },
      401,
    );
  }
  return next();
});
