/**
 * Auth0 flows for the Rimelight website and the game's headless login. Verification of incoming
 * tokens lives in `@rimelight/cms/identity`; this module only talks to the tenant.
 */

export interface Auth0Config {
  domain: string;
  clientId: string;
  clientSecret: string;
  audience: string;
  rolesClaim: string;
  userTypeClaim: string;
  permissionsClaim: string;
  defaultRole: string;
  sessionCookieName: string;
  sessionSecret: string;
}

export interface Auth0TokenResponse {
  access_token: string;
  id_token?: string | undefined;
  token_type: string;
  expires_in: number;
  refresh_token?: string | undefined;
  scope?: string | undefined;
}

export interface UserSession {
  userId: string;
  roles: string[];
  permissions: string[];
  email?: string | undefined;
  name?: string | undefined;
  avatar?: string | undefined;
  userType?: string | undefined;
  metadata?: Record<string, any> | undefined;
}

/**
 * Process and Vite environment, `process.env` taking precedence. Used where no Worker bindings
 * are available at module load time.
 */
export function ambientEnv(): Record<string, string | undefined> {
  const fromVite = ((import.meta as any).env ?? {}) as Record<string, string | undefined>;
  const fromProcess =
    typeof process !== "undefined" ? (process.env as Record<string, string | undefined>) : {};
  const merged: Record<string, string | undefined> = { ...fromVite };
  for (const [key, value] of Object.entries(fromProcess)) {
    if (value) merged[key] = value;
  }
  return merged;
}

/** Reads the Auth0 settings from the Worker environment. Missing values fall back to defaults. */
export function getAuth0Config(env: Record<string, string | undefined>): Auth0Config {
  return {
    domain: env["AUTH0_DOMAIN"] || "rimelight.eu.auth0.com",
    clientId: env["AUTH0_CLIENT_ID"] || "",
    clientSecret: env["AUTH0_CLIENT_SECRET"] || "",
    audience: env["AUTH0_AUDIENCE"] || "",
    rolesClaim: env["AUTH0_ROLES_CLAIM"] || "https://rimelight.com/roles",
    userTypeClaim: env["AUTH0_USER_TYPE_CLAIM"] || "https://rimelight.com/user_type",
    permissionsClaim: "permissions",
    defaultRole: "user",
    sessionCookieName: "rimelight_session",
    sessionSecret: env["AUTH0_SECRET"] || "",
  };
}

function cleanDomain(domain: string): string {
  return domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

async function postToken(domain: string, body: Record<string, string>, label: string) {
  const response = await fetch(`https://${cleanDomain(domain)}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Auth0 ${label} failed (${response.status}): ${await response.text()}`);
  }
  return (await response.json()) as Auth0TokenResponse;
}

/** Browser login URL. `screen_hint=signup` opens the sign-up form. */
export function createAuthorizeUrl(options: {
  domain: string;
  clientId: string;
  redirectUri: string;
  audience?: string | undefined;
  scope: string;
  state?: string | undefined;
  screenHint?: string | undefined;
}): string {
  const url = new URL(`https://${cleanDomain(options.domain)}/authorize`);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", options.clientId);
  url.searchParams.set("redirect_uri", options.redirectUri);
  url.searchParams.set("scope", options.scope);
  if (options.audience) url.searchParams.set("audience", options.audience);
  if (options.state) url.searchParams.set("state", options.state);
  if (options.screenHint) url.searchParams.set("screen_hint", options.screenHint);
  return url.toString();
}

export function createLogoutUrl(options: { domain: string; clientId: string; returnTo: string }) {
  const url = new URL(`https://${cleanDomain(options.domain)}/v2/logout`);
  url.searchParams.set("client_id", options.clientId);
  url.searchParams.set("returnTo", options.returnTo);
  return url.toString();
}

export function exchangeCode(options: {
  domain: string;
  clientId: string;
  clientSecret?: string | undefined;
  code: string;
  redirectUri: string;
}): Promise<Auth0TokenResponse> {
  return postToken(
    options.domain,
    {
      grant_type: "authorization_code",
      client_id: options.clientId,
      code: options.code,
      redirect_uri: options.redirectUri,
      ...(options.clientSecret ? { client_secret: options.clientSecret } : {}),
    },
    "token exchange",
  );
}

/** Resource Owner Password grant, used by the headless game client. */
export function loginWithPassword(options: {
  domain: string;
  clientId: string;
  clientSecret?: string | undefined;
  username: string;
  password: string;
  audience?: string | undefined;
  scope: string;
}): Promise<Auth0TokenResponse> {
  return postToken(
    options.domain,
    {
      grant_type: "password",
      client_id: options.clientId,
      username: options.username,
      password: options.password,
      scope: options.scope,
      ...(options.clientSecret ? { client_secret: options.clientSecret } : {}),
      ...(options.audience ? { audience: options.audience } : {}),
    },
    "password login",
  );
}

export function refreshAccessToken(options: {
  domain: string;
  clientId: string;
  clientSecret?: string | undefined;
  refreshToken: string;
}): Promise<Auth0TokenResponse> {
  return postToken(
    options.domain,
    {
      grant_type: "refresh_token",
      client_id: options.clientId,
      refresh_token: options.refreshToken,
      ...(options.clientSecret ? { client_secret: options.clientSecret } : {}),
    },
    "token refresh",
  );
}

/** Maps verified Auth0 claims onto the website's session shape. */
export function mapClaimsToSession(
  payload: Record<string, any>,
  config: Pick<Auth0Config, "rolesClaim" | "userTypeClaim" | "permissionsClaim" | "defaultRole">,
): UserSession {
  const roles: string[] = Array.isArray(payload[config.rolesClaim])
    ? payload[config.rolesClaim]
    : Array.isArray(payload["roles"])
      ? payload["roles"]
      : [config.defaultRole];

  const permissions: string[] = Array.isArray(payload[config.permissionsClaim])
    ? payload[config.permissionsClaim]
    : Array.isArray(payload["permissions"])
      ? payload["permissions"]
      : [];

  const isStaff = roles.some((r) =>
    ["owner", "admin", "editor", "employee", "superadmin"].includes(r.toLowerCase()),
  );
  const userType: string =
    payload[config.userTypeClaim] || payload["user_type"] || (isStaff ? "employee" : "user");

  return {
    userId: payload["sub"] || "anonymous",
    email: payload["email"],
    name: payload["name"] || payload["nickname"] || payload["email"]?.split("@")[0] || "User",
    avatar: payload["picture"],
    roles,
    permissions,
    userType,
    metadata: payload,
  };
}
