# UE5 Game Auth Architecture — Discussion & Conclusions

**Status:** For further consideration (open design discussion, not yet decided)
**Topic:** Headless authentication for an Unreal Engine 5 client backed by Auth0, Cloudflare Workers, and PlanetScale.

---

## Overview

Design discussions around how the UE5 game client authenticates players (and employees) while keeping a unified identity across the website (which uses Auth0) and the game backend (Cloudflare Worker monolith + PlanetScale Postgres).

### Reference Architecture

```
+-------------------------+      +---------------------------+
|  Unreal Engine 5 Client |      |      Website Frontend     |
+------------+------------+      +-------------+-------------+
             |                                 |
             +-----------------+---------------+
                               | 1. Authenticate (Login / Password)
                               v
               +-------------------------------+
               |           Auth0 IdP           |
               | (Issues JWT with Role/Sub)    |
               +---------------+---------------+
                               | 2. API Request + Bearer Token (JWT)
                               v
               +-------------------------------+
               |    Cloudflare Worker Monolith |
               |    (Validates Token & Routes) |
               +---------------+---------------+
                               | 3. SQL Query via Hyperdrive
                               v
               +-------------------------------+
               |   PlanetScale Postgres DB     |
               |   [players] & [employees]     |
               +-------------------------------+
```

### 1. The Client Tier (UE5 Game Client & Website Frontend)

Presentation layer where players and staff interact with the ecosystem.

- **Unreal Engine 5 Client:** Communicates via secure HTTPS REST API calls directly to the Cloudflare Worker backend. Handles player inputs, displays game UIs (account management panels, inventory screens), and securely attaches bearer tokens to requests.
- **Website Frontend (CF Worker/Static Assets):** Serves web-based player account panels and internal employee tools. Uses standard browser-based auth patterns.

### 2. The Authentication Layer (Auth0 IdP)

Auth0 acts as the centralized, secure identity broker for the entire organization and player base.

- **Database Connections:** Standard Auth0 internal database connections securely store and hash credentials for both employees and players.
- **Role/Claim Injection (Auth0 Actions):** On successful login, an Auth0 Action stamps custom claims into the JWT (e.g., `role: "player"` or `role: "employee"`) based on how the user authenticated.
- **Token Issuance:** Returns a cryptographically signed JWT containing the user's immutable unique ID (`sub` claim) and role claim.

### 3. The Application & API Tier (Cloudflare Worker Monolith)

A single Cloudflare Worker acts as the edge-computed backend monolith.

- **Unified API Routing:** Manages website and UE5 client traffic under a single codebase (e.g., `/api/player/*`, `/api/internal/*`).
- **Token Validation Middleware:** Intercepts requests, validates JWT signature against Auth0's public keys (JWKS), parses `sub` and `role` claims.
- **Database Routing:** Directs execution to player or employee datasets based on the validated `role` claim.

### 4. The Persistence Tier (PlanetScale Postgres & Hyperdrive)

Permanent data store, kept strictly isolated from direct client exposure.

- **Cloudflare Hyperdrive:** Pools and accelerates connections from serverless Workers to PlanetScale Postgres.
- **Strict Schema Segregation:**
  - `players` table: game progression, purchase history, public profile metadata — indexed by Auth0 `sub` ID.
  - `employees` table: staff access privileges and admin metadata — indexed by its own Auth0 `sub` ID.
- **Security Boundary:** Direct DB access from UE5 or the browser is prohibited; only the Cloudflare Worker reads/writes PlanetScale.

---

## Key Conclusions

### The headless worker approach wins big

- **Immersive In-Engine UX:** Login flow stays inside custom UE5 UMG widgets — no jarring browser pop-ups, redirects, or broken custom URL schemes.
- **Total API Control:** The Worker is a clean abstraction layer; identity is handled uniformly whether login came from the website or the game.
- **Custom MFA Handling:** Step-up auth responses can be managed by the Worker, enabling a slick 6-digit code entry screen inside the game UI.

### Critical trade-offs to keep in mind

1. **The Social Login Problem:** PC/console players expect Steam, Epic Games, Google, or Apple login. A pure username/password headless flow cannot handle third-party social OAuth redirects natively. Social login later requires an OAuth Device Authorization Grant (RFC 8628) or external browser flows.
2. **Edge Security and Rate Limiting:** The Worker receives raw password payloads directly from the game client, making `/api/auth/login` a prime target for credential stuffing and brute-force. Aggressive rate limiting at the Cloudflare edge (KV or WAF rules) is required.

**Verdict:** If the game relies strictly on email/password accounts, the headless Cloudflare Worker pattern is the best path forward.

---

## Earlier Notes Considered (Context)

- **Native UE5 auth UX:** Auth0 relies on browser flows (Authorization Code + PKCE); email/password inside a native UMG widget is an anti-pattern. Recommend OAuth2 Authorization Code Flow with PKCE via default browser + custom URL scheme (`mygame://auth-callback`) if going the browser route.
- **Token lifetimes / refresh tokens:** Access tokens should be short (e.g., 15 min); clients must handle refresh tokens via OS credential stores so long play sessions don't get booted to login.
- **DB indexing & multi-tenancy:** `sub` should be a unique index in both tables; the Worker must verify the JWT role matches the table being queried (employee role must never hit player routes unless authorized, and vice versa).

## Alternatives Evaluated

### Option 1: Auth0 Password Grant (ROPC)

- UE5 posts username/password to Auth0's token endpoint (`grant_type=password`) and gets back a JWT.
- **Catch:** Discouraged (client handles raw credentials); disabled by default on new Auth0 applications — must be manually toggled.

### Option 2: Handle Auth directly in the Cloudflare Worker (Recommended)

Step-by-step:

1. **In-Game UI:** UE5 sends `POST /api/login` with username/password directly to the Cloudflare Worker.
2. **Worker Validation:** Looks up the user in PlanetScale, compares against a secure hash (Argon2 or Bcrypt).
3. **Token Issuance:** Worker signs its own internal JWT using a secret env var stored in Cloudflare, embedding the player's `sub` and `role`.
4. **Subsequent Requests:** UE5 uses the token as a Bearer for all gameplay API requests.

Why Option 2 fits the stack best:

- **Zero Browser Friction:** Total control over the UE5 UI.
- **Simplicity:** Cuts out an extra third-party network hop to Auth0 per game login.
- **No Auth0 Restrictions:** Avoids fighting Auth0's deprecation policies around direct password grants for native apps.

**Note:** Auth0 can still be used purely for the Website/employee dashboard where web-based login is acceptable.

### Identity-fragmentation concern

A completely separate custom login backend risks fragmented identities — one account on the website (Auth0 `sub`) and a disconnected account in the game. To keep Auth0 as the single source of truth:

- Keep Auth0, but use the Password Grant (ROPC) from UE5 directly (`POST /oauth/token`) so the same Auth0 user store backs both web and game; `sub` stays identical.
- Enable the Password grant under Auth0 Application > Advanced Settings (default off).
- Accept the security trade-off: ROPC means the client handles raw credentials in memory; acceptable when not exposing third-party social logins.
- **MFA Limitation:** Direct password grants make MFA trickier inside a custom game UI.

### Final recommended pattern: Headless Authentication (direct API-driven identity management)

Treat Auth0 (or the DB) strictly as a backend identity store/engine while UE5 talks to the Cloudflare Worker via native JSON APIs.

1. **In-Game UI:** Player types username/password into a UE5 UMG menu.
2. **Direct API Call to Edge:** `POST /api/auth/login` with a JSON body.
3. **Worker Handles Identity Logic:** Queries Auth0's Management/Authentication API server-to-server, OR checks PlanetScale directly (Argon2-hashed).
4. **MFA Challenge Handling:** Worker can respond with `{ "status": "mfa_required", "mfa_token": "..." }`; UE5 prompts for a 6-digit code and sends it back in a follow-up request — no browser required.
5. **Token Issuance:** Worker mints and returns the game's native JWT to UE5.

Why this fixes the pain points:

- **Zero Browser Overhead:** Player stays 100% immersed in the game client UI.
- **MFA Support:** Full programmatic control over response steps → clean in-game TOTP prompts.
- **Unified Database:** Website keeps standard Auth0 Universal Login; the Worker bridges/validates the same identities against PlanetScale.

---

## Open Questions

- Will the game support third-party platform logins (Steam / Epic / Google / Apple) down the line, or strictly email/password?
- Player identities: should they live in Auth0 as the single source of truth, or in PlanetScale (hashed) with Auth0 only for the website?
- Is in-game MFA a requirement, or can it wait?
