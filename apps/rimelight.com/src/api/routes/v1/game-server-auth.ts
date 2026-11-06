import { createMiddleware } from "hono/factory";
import { and, eq, isNull } from "drizzle-orm";
import { t } from "@rimelight/i18n";
import { getDb } from "#db";
import { gameServerCredentials } from "#db/schema/game-server-credentials";
import {
  hashGameServerSecret,
  parseGameServerHeader,
  sameSecretHash,
} from "../../game-server-credentials";

export type GameServerVariables = { gameServerId: string };

/**
 * Lets only a game server through to the write routes, which are mounted at `/server/v1`, outside the client router. The server
 * sends `X-Game-Server: <id>.<secret>`. The credential must be an unrevoked row for the route's title whose secret hashes to the
 * stored hash. The player is named in the request body, so the route checks that the player exists. Sets `gameServerId`.
 */
export const requireGameServer = createMiddleware<{
  Bindings: Env;
  Variables: GameServerVariables;
}>(async (c, next) => {
  const unauthorized = () =>
    c.json({ error: "Unauthorized", message: t("api.message.estate-server-unauthorized") }, 401);

  const credential = parseGameServerHeader(c.req.header("X-Game-Server"));
  if (!credential) return unauthorized();

  const [row] = await getDb()
    .select({ id: gameServerCredentials.id, secretHash: gameServerCredentials.secretHash })
    .from(gameServerCredentials)
    .where(
      and(
        eq(gameServerCredentials.id, credential.id),
        eq(gameServerCredentials.title, c.req.param("title") ?? ""),
        isNull(gameServerCredentials.revokedAt),
      ),
    )
    .limit(1);
  if (!row || !sameSecretHash(hashGameServerSecret(credential.secret), row.secretHash)) {
    return unauthorized();
  }

  c.set("gameServerId", row.id);
  return next();
});
