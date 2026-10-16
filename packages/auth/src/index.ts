export type {
  UserType,
  AuthSession,
  AuthEnv,
  UserSessionContext,
  AuthAdapter,
  RoleGuard,
  AuthMiddlewareOptions,
  AuthConfig,
  AuthPluginConfig,
} from "./types";

export type { AuthClientSession, AuthClientOptions, AuthClient } from "./client/index";

export { hasRole, hasPermission, evaluateAccess } from "./permissions/index";

export {
  normalizeUsername,
  DEFAULT_RESTRICTED_KEYWORDS,
  createRestrictedUsernameSet,
  RESTRICTED_SET,
} from "./plugins/reserved-usernames/index";

export { createAuthClient, authClient } from "./client/index";

export { auth, authAdapter } from "./runtime";
