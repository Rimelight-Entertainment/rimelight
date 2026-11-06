import { Hono } from "hono";
import { t } from "@rimelight/i18n";
import { isTitleSlug } from "../titles";
import type { GameServerVariables } from "./v1/game-server-auth";
import { estateServerRoutes } from "./v1/estate";
import { ledgerServerRoutes } from "./v1/ledger";
import { mailServerRoutes } from "./v1/mail";

/**
 * The game server's API, version 1. Mounted at `/server/v1`, outside the client router, so no player bearer token reaches these
 * routes. Each route checks the `X-Game-Server` credential itself and names the player it writes for in its body.
 */
const serverV1 = new Hono<{ Bindings: Env; Variables: GameServerVariables }>();

serverV1.use("/titles/:title/*", async (c, next) => {
  if (!isTitleSlug(c.req.param("title"))) {
    return c.json({ error: "Not Found", message: t("api.message.unknown-title") }, 404);
  }
  return next();
});

serverV1.route("/", estateServerRoutes);
serverV1.route("/", ledgerServerRoutes);
serverV1.route("/", mailServerRoutes);

export default serverV1;
