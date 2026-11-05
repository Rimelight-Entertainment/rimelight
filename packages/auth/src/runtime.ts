import type { AccessIdentity, AuthAdapter } from "./types";
import { getDefaultAuth } from "./default";

/**
 * Auth for server-side handlers and the CMS, using the deployment's single provider
 * (see `getDefaultAuth`).
 */
export const auth: AuthAdapter = {
  name: "auto",
  async getSession(req: Request) {
    return getDefaultAuth().getSession(req);
  },
  async identify(req: Request): Promise<AccessIdentity | null> {
    const adapter = getDefaultAuth();
    return adapter.identify ? adapter.identify(req) : null;
  },
  handleUnauthorized(req: Request) {
    return (
      getDefaultAuth().handleUnauthorized?.(req) ?? new Response("Unauthorized", { status: 401 })
    );
  },
};
