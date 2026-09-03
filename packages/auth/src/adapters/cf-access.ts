import type { AuthAdapter, UserSessionContext } from "../types"
import { createRemoteJWKSet, jwtVerify } from "jose"

export interface CfAccessAdapterOptions {
  aud?: string | undefined
  teamDomain?: string | undefined
  defaultRole?: string | undefined
  adminEmails?: string[] | undefined
  verifyJwt?: boolean | undefined
  loginUrl?: string | undefined
}

export function cfAccessAuth(options: CfAccessAdapterOptions = {}): AuthAdapter {
  const {
    aud,
    teamDomain,
    defaultRole = "admin",
    adminEmails = [],
    verifyJwt = false,
    loginUrl
  } = options

  let jwks: ReturnType<typeof createRemoteJWKSet> | null = null
  if (teamDomain && verifyJwt) {
    const certsUrl = new URL(
      `https://${teamDomain.replace(/^https?:\/\//, "")}/cdn-cgi/access/certs`
    )
    jwks = createRemoteJWKSet(certsUrl)
  }

  return {
    name: "cf-access",
    options,
    async getSession(req: Request): Promise<UserSessionContext | null> {
      const emailHeader = req.headers.get("cf-access-authenticated-user-email")
      const jwtAssertion = req.headers.get("cf-access-jwt-assertion")

      if (!emailHeader && !jwtAssertion) {
        return null
      }

      let email = emailHeader?.toLowerCase().trim()
      let name: string | undefined
      let customClaims: Record<string, any> = {}

      if (jwtAssertion && jwks) {
        try {
          const verifyOpts: { audience?: string | string[]; issuer?: string } = {}
          if (aud) verifyOpts.audience = aud
          if (teamDomain) {
            verifyOpts.issuer = `https://${teamDomain.replace(/^https?:\/\//, "")}`
          }

          const { payload } = await jwtVerify(jwtAssertion, jwks, verifyOpts)
          if (payload.email && typeof payload.email === "string") {
            email = payload.email.toLowerCase().trim()
          }
          if (payload.name && typeof payload.name === "string") {
            name = payload.name
          }
          customClaims = payload
        } catch {
          return null
        }
      }

      const userEmail = email || "cf-access-user"
      const isAdmin =
        adminEmails && adminEmails.length > 0
          ? adminEmails.map((e) => e.toLowerCase()).includes(userEmail)
          : true

      return {
        userId: userEmail,
        email: userEmail,
        name: name || userEmail.split("@")[0],
        roles: isAdmin ? [defaultRole] : ["viewer"],
        permissions: isAdmin ? ["*"] : [],
        userType: "employee",
        metadata: customClaims
      }
    },
    handleUnauthorized(req?: Request) {
      if (loginUrl) {
        try {
          if (req && req.url) {
            const origin = new URL(req.url).origin
            const fullUrl = new URL(loginUrl, origin).toString()
            return Response.redirect(fullUrl, 302)
          }
        } catch {}
        try {
          return Response.redirect(loginUrl, 302)
        } catch {
          return new Response(null, {
            status: 302,
            headers: { Location: loginUrl }
          })
        }
      }
      return new Response("Unauthorized Cloudflare Access Identity", { status: 401 })
    }
  }
}
