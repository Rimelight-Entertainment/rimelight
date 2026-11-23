import { auth0Identifier } from "@rimelight/cms/identity";
import { ambientEnv, getAuth0Config } from "./auth0";

/**
 * Identity for the CMS and any route that needs the caller: the Auth0 Bearer token, or the
 * website's session cookie. Read lazily, so settings are resolved on the first request.
 */
export const identify = auth0Identifier(() => {
  const config = getAuth0Config(ambientEnv());
  return {
    domain: config.domain,
    audience: config.audience || undefined,
    rolesClaim: config.rolesClaim,
    sessionCookieName: config.sessionCookieName,
    sessionSecret: config.sessionSecret || undefined,
  };
});
