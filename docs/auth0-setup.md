# Auth0 setup for Rimelight

How the Auth0 tenant is configured for the website and the Rimelight client API (`/api/v1/*`, used
by the UE5 client). Follow it to set up a new environment, or to check an existing one. The design
is in [RFC-0001](../rfc/0001-ue5-game-accounts-and-settings-api.md).

Use placeholders in any notes you write. Never commit a client secret, a test password, or an
access token.

## 1. Tenant

Dashboard: `https://manage.auth0.com/dashboard/eu/<tenant>`. The tenant is `rimelight` (EU region).

- **Settings → General → Default Directory:** `Username-Password-Authentication`. Without it, the
  password grant fails with `Authorization server not configured with default connection`.

## 2. Database connection

Dashboard → **Authentication → Database → Username-Password-Authentication**.

- **Requires email verification:** on. Auth0 blocks password login for unverified accounts, and
  the Worker relies on that instead of checking `email_verified` itself.
- Enable the connection on the `rimelight.com` application (see §3).
- Turn off social connections for this application.

## 3. Web application (`rimelight.com`)

Dashboard → **Applications → Applications → rimelight.com**. This one application serves both the
website login and the headless login used by the game.

Settings:

- **Application type:** Regular Web Application.
- **Callback URLs:** `http://localhost:4321/api/auth/callback`, `https://rimelight.com/api/auth/callback`.
- **Allowed logout URLs:** `http://localhost:4321/`, `https://rimelight.com/`.
- **Allowed web origins:** `http://localhost:4321`, `https://rimelight.com`.
- **Grant types:** `authorization_code`, `implicit`, `refresh_token`, `client_credentials`, and
  `password`. The `password` grant is required for `POST /api/auth/login`.
- **Refresh token rotation:** on.
- **Token endpoint authentication:** `client_secret_post`.
- **Connections:** `Username-Password-Authentication` enabled.

The `password` grant is the only change from a default website setup. Keep it on this application
only.

## 4. API (`https://api.rimelight.com`)

Dashboard → **Applications → APIs → Create API**.

- **Name:** Rimelight API.
- **Identifier:** `https://api.rimelight.com`. This must match `AUTH0_AUDIENCE` exactly.
- **Signing algorithm:** RS256.
- **JSON Web Token (JWT) Profile:** Auth0. Not RFC 9068.
- **JSON Web Encryption (JWE):** off.
- **Allow offline access:** on, so refresh tokens are issued for this API.
- **Token lifetime:** the RFC (§3.3.2) says 15 minutes (900 seconds). The API is currently at
  86400 seconds. Change it to match the RFC before production.
- **Allow skipping user consent:** on, for this first-party application.

Access tokens for this API are plain RS256 JWTs. A `dir`/`A256GCM` token means the token is being
encrypted, so check the API's JWE toggle first.

## 5. Login Action

Dashboard → **Actions → Library → Build Custom**.

- **Name:** `rimelight-claims`.
- **Trigger:** Login / Post Login.
- **Code:**

  ```js
  exports.onExecutePostLogin = async (event, api) => {
    const ns = "https://rimelight.com/";
    // Players are "user". Staff are marked "employee" in app_metadata.
    const userType = event.user.app_metadata?.user_type || "user";

    api.accessToken.setCustomClaim(ns + "user_type", userType);
    api.accessToken.setCustomClaim(ns + "email", event.user.email);
    api.idToken.setCustomClaim(ns + "user_type", userType);
  };
  ```

Attach it: **Actions → Flows → Login**. Drag `rimelight-claims` between **Start** and **Complete**,
then click **Apply**.

Without this Action, the game middleware returns 403 for every account, because the
`user_type` claim is missing.

To mark a staff account, edit the user's `app_metadata` in the dashboard and set
`{ "user_type": "employee" }`.

## 6. Secrets in the Worker

Set these for local development in `apps/rimelight.com/.dev.vars`:

| Variable              | Value                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| `AUTH0_DOMAIN`        | The tenant domain, for example `rimelight.eu.auth0.com`. No `https://`.                                |
| `AUTH0_CLIENT_ID`     | The `rimelight.com` application's Client ID.                                                           |
| `AUTH0_CLIENT_SECRET` | The `rimelight.com` application's Client Secret.                                                       |
| `AUTH0_AUDIENCE`      | `https://api.rimelight.com`                                                                            |
| `AUTH0_SECRET`        | Required. A random 32-byte hex string, for example `openssl rand -hex 32`. Signs website session cookies; sign-in fails when it is unset. |

Production uses the same names. They're declared as secrets in `cloudflare.config.ts`, so set them
in the Cloudflare dashboard or with `wrangler secret put`, not in a file.

Changing `AUTH0_SECRET` signs out every existing website session. There is no fallback value.

## 7. Test account

For local testing, create a user in **User Management → Users → Create User** on the
`Username-Password-Authentication` connection. Mark the email as verified. Leave `app_metadata`
empty, so the Login Action treats the account as a player.

Check the login with a `POST` to `/api/auth/login` with `{"email": ..., "password": ...}`. The
response's `access_token` is the bearer for `/api/v1/*`. Decode its header to confirm `alg` is
`RS256`, and decode its payload to confirm `aud` is `https://api.rimelight.com` and that the
`https://rimelight.com/user_type` and `https://rimelight.com/email` claims are present.

## 8. Troubleshooting

- **`Grant type 'password' not allowed for the client`:** step 3, Grant types.
- **`Authorization server not configured with default connection`:** step 1, Default Directory.
- **Access token is `alg: dir` / `enc: A256GCM`:** the app is loading an old build of
  `packages/auth`. Rebuild it with `vp pack` in `packages/auth`, then restart the dev server. The
  `dist` folder is gitignored, so every environment has to build it.
- **403 on `/api/v1/*` for a valid login:** step 5, the Login Action isn't attached or isn't
  deployed.
- **409 on `/api/v1/*`:** the email already belongs to another `users` row with a different
  `auth0_id`. Investigate it by hand; do not merge.
