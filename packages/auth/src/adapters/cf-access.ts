import type { AuthAdapter, UserSessionContext } from "../types";
import { verifyJwtRs256 } from "../jwt";

export interface CfAccessAdapterOptions {
  aud?: string | undefined;
  teamDomain?: string | undefined;
  defaultRole?: string | undefined;
  adminEmails?: string[] | undefined;
  verifyJwt?: boolean | undefined;
  loginUrl?: string | undefined;
}

export function cfAccessAuth(options: CfAccessAdapterOptions = {}): AuthAdapter {
  const {
    aud,
    teamDomain,
    defaultRole = "admin",
    adminEmails = [],
    verifyJwt = false,
    loginUrl
  } = options;

  const certsUrl =
    teamDomain && verifyJwt
      ? `https://${teamDomain.replace(/^https?:\/\//, "").replace(/\/$/, "")}/cdn-cgi/access/certs`
      : null;

  return {
    name: "cf-access",
    options,
    async getSession(req: Request): Promise<UserSessionContext | null> {
      const emailHeader = req.headers.get("cf-access-authenticated-user-email");
      const jwtAssertion = req.headers.get("cf-access-jwt-assertion");

      if (!emailHeader && !jwtAssertion) {
        return null;
      }

      let email = emailHeader?.toLowerCase().trim();
      let name: string | undefined;
      let customClaims: Record<string, any> = {};

      if (jwtAssertion && certsUrl) {
        try {
          const expectedIssuer = teamDomain
            ? `https://${teamDomain.replace(/^https?:\/\//, "").replace(/\/$/, "")}`
            : undefined;

          const payload = await verifyJwtRs256(jwtAssertion, certsUrl, {
            audience: aud,
            issuer: expectedIssuer
          });
          if (!payload) {
            return null;
          }
          if (payload["email"] && typeof payload["email"] === "string") {
            email = payload["email"].toLowerCase().trim();
          }
          if (payload["name"] && typeof payload["name"] === "string") {
            name = payload["name"];
          }
          customClaims = payload;
        } catch {
          return null;
        }
      }

      const userEmail = email || "cf-access-user";
      const isAdmin =
        adminEmails && adminEmails.length > 0
          ? adminEmails.map((e) => e.toLowerCase()).includes(userEmail)
          : true;

      return {
        userId: userEmail,
        email: userEmail,
        name: name || userEmail.split("@")[0],
        roles: isAdmin ? [defaultRole] : ["viewer"],
        permissions: isAdmin ? ["*"] : [],
        userType: "employee",
        metadata: customClaims
      };
    },
    handleUnauthorized(req?: Request) {
      if (loginUrl) {
        try {
          if (req && req.url) {
            const origin = new URL(req.url).origin;
            const fullUrl = new URL(loginUrl, origin).toString();
            return Response.redirect(fullUrl, 302);
          }
        } catch {}
        try {
          return Response.redirect(loginUrl, 302);
        } catch {
          return new Response(null, {
            status: 302,
            headers: { Location: loginUrl }
          });
        }
      }
      return new Response("Unauthorized Cloudflare Access Identity", { status: 401 });
    }
  };
}

function getEnv(key: string, fallback = ""): string {
  if (typeof process !== "undefined" && process.env?.[key]) return process.env[key]!;
  if (typeof import.meta !== "undefined" && (import.meta as any).env?.[key]) {
    return (import.meta as any).env[key];
  }
  return fallback;
}

/**
 * Creates a Cloudflare Access auth adapter automatically configured from environment variables.
 */
export function createCfAccessFromEnv(
  overrides: Partial<CfAccessAdapterOptions> = {}
): AuthAdapter {
  return cfAccessAuth({
    teamDomain: overrides.teamDomain || getEnv("CF_ACCESS_TEAM_DOMAIN"),
    aud: overrides.aud || getEnv("CF_ACCESS_AUD"),
    verifyJwt:
      overrides.verifyJwt ??
      (getEnv("CF_ACCESS_VERIFY_JWT") === "true" ||
        (typeof import.meta !== "undefined" &&
          (import.meta as any).env?.["CF_ACCESS_VERIFY_JWT"] === "true")),
    adminEmails:
      overrides.adminEmails ||
      (getEnv("CF_ACCESS_ADMIN_EMAILS")
        ? getEnv("CF_ACCESS_ADMIN_EMAILS")
            .split(",")
            .map((e) => e.trim())
        : []),
    defaultRole: overrides.defaultRole || "admin",
    ...overrides
  });
}
