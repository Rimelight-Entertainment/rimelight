export * from "./types"
export * from "./adapters/cf-access"
export * from "./adapters/auth0"
export * from "./adapters/mock"
export * from "./permissions/index"
export * from "./plugins/reserved-usernames/index"
export * from "./plugins/construction-guest/index"
export * from "./middleware/index"
export * from "./client/index"
export * from "./vite"

import type { AuthAdapter } from "./types"
import { createCfAccessFromEnv } from "./adapters/cf-access"
import { createAuth0FromEnv } from "./adapters/auth0"

let _defaultAuth: AuthAdapter | null = null

function getDefaultAuth(): AuthAdapter {
  if (!_defaultAuth) {
    const isAuth0 =
      (typeof process !== "undefined" && Boolean(process.env?.["AUTH0_DOMAIN"])) ||
      (typeof import.meta !== "undefined" && Boolean((import.meta as any).env?.["AUTH0_DOMAIN"]))
    _defaultAuth = isAuth0 ? createAuth0FromEnv({ devFallback: true }) : createCfAccessFromEnv()
  }
  return _defaultAuth
}

export const auth: AuthAdapter = {
  name: "auto",
  async getSession(req: Request) {
    return getDefaultAuth().getSession(req)
  },
  handleUnauthorized(req: Request) {
    return (
      getDefaultAuth().handleUnauthorized?.(req) ??
      new Response("Unauthorized", { status: 401 })
    )
  }
}

export const authAdapter = auth
export default auth



