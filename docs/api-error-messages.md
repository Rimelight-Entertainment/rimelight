# API error messages: stop returning raw i18n keys

Status: proposal, not started. Owner: rimelight.com API. Related: `rfc/0001-ue5-game-accounts-and-settings-api.md` (status section).

## The problem

Error responses from `/api/*` contain the i18n key instead of text:

```json
{ "error": "Unauthorized", "message": "api.message.bearer-missing" }
```

Players see this when the game shows the `message` field, so it's a user-facing bug, not only a cosmetic one.

## Why it happens

The i18n package (`packages/i18n`) builds translations as chunks, one or more per route bucket. A chunk is loaded when a page for that URL renders, through the page's `loadLocale`/payload path. API routes never render a page, so the chunk that holds `api.message.*` is never loaded.

`t()` in `packages/i18n/src/runtime.ts` then does:

1. `lookup(locale, key)` finds nothing, because the dictionary for that locale has no entry.
2. `resolved = value ?? key`, so the key is returned.

Nothing fails. In production the key is returned silently. In dev the server logs:

```
[i18n] "api.message.bearer-missing" is read in "en", which isn't loaded. Await loadLocale("en") first.
```

The warning is printed only when `devServer` is on, and only once per key, so it's easy to miss.

The keys affected are the 14 `t("api.message.*")` calls in:

- `src/api/routes/auth.ts` (4)
- `src/api/routes/v1/index.ts` (5)
- `src/api/routes/v1/middleware.ts` (5)

## Who reads these responses

The design has to fit each of these, not only the website:

| Consumer                          | Locale available?                                                          | What it needs                                            |
| --------------------------------- | -------------------------------------------------------------------------- | -------------------------------------------------------- |
| Game client (UE5, `GrandTale`)    | No locale header today. The game has its own language setting and `FText`. | A stable code it can map to its own strings.             |
| Website `fetch` calls (browser)   | Yes, the browser sends `Accept-Language`.                                  | Text in the visitor's language, or a code the page maps. |
| Logs, monitoring, support tooling | Usually English only.                                                      | A stable English message and a code to group on.         |
| Future clients (mobile, tools)    | Unknown.                                                                   | Same as the game: codes first.                           |

The i18n package was designed for web pages only. The points below need tweaking for the other consumers:

1. **No per-request locale on the API.** `getCurrentLocale()` falls back to `resolveRequestLocale`, then the default. A game request has no locale to resolve, so it always gets the default.
2. **Chunks are per URL.** A server-side API dictionary would need its own bucket and must be loaded eagerly in the Worker, which adds to the Worker bundle for every request.
3. **The dev warning is the only signal.** Production gives no error, so a regression would not be caught.
4. **`t()` is used for messages that are also API contracts.** A translated string changes whenever the copy changes, so clients that match on it break. Codes do not change.

## Options

**A. Load the API dictionary on the server and localize with `Accept-Language`.**
Make an `api` bucket eager and read the locale from the request.

- Keeps the current response shape.
- Needs the i18n package changes in point 1 and 2 above, and a bundle cost on every request.
- Game clients still get text in the wrong language unless they send a locale header.

**B. Return stable codes, with an English message that is never translated (recommended for now).**
Errors become `{ "error": "Unauthorized", "code": "bearer-missing", "message": "Missing bearer token." }`. `message` is a fixed English string for logs and developers. Clients localize `code` themselves.

- No `t()` on the API, so the chunk problem disappears.
- Codes are a contract, so they can be matched and tested.
- Needs a change in the game: show `FText` for the code, not `message`.

**C. B now, and A later for browser clients that want server text.**
Same as B. If a browser consumer needs translated text, add the `Accept-Language` path for that consumer only, after an `api` bucket exists.

Recommendation: **B**. It fixes the bug for every consumer and does not depend on the i18n package. A is only worth doing if a consumer needs server-side text, and none does today.

## Proposed shape

```ts
// src/api/errors.ts
export const API_ERROR_CODES = {
  "bearer-missing": { status: 401, error: "Unauthorized", message: "Missing bearer token." },
  "token-invalid": { status: 401, error: "Unauthorized", message: "Invalid token." },
  "token-no-email": { status: 401, error: "Unauthorized", message: "Token has no email claim." },
  "player-account-required": {
    status: 403,
    error: "Forbidden",
    message: "Player account required.",
  },
  "server-misconfigured": {
    status: 500,
    error: "Internal Server Error",
    message: "Server is missing its Auth0 audience configuration.",
  },
  // ...the other 9 keys, one per current api.message.* entry
} as const;

export type ApiErrorCode = keyof typeof API_ERROR_CODES;

export function apiError(c: Context, code: ApiErrorCode) {
  const { status, error, message } = API_ERROR_CODES[code];
  return c.json({ error, code, message }, status);
}
```

Every route replaces `c.json({ error, message: t("api.message.x") }, status)` with `apiError(c, "x")`. The `error` field stays so existing consumers keep working.

Notes on the shape:

- `status` lives in the registry so a code always maps to one status. Check each call site when moving it, because the same condition is not guaranteed to return the same status everywhere. For example, `server-misconfigured` returns 500 in every current call site, but the registry should still be the single source.
- `message` is English and never goes through `t()`. It exists for logs and developers, not for players.
- The `t()` import leaves the API routes entirely.

## Steps

1. **Inventory.** List every `api.message.*` key, its status, and its call site. The inventory above has 14. Confirm the status for each.
2. **Add `src/api/errors.ts`** with the registry and `apiError()`.
3. **Convert the routes** listed above to `apiError()`. No behaviour change except the `code` field and the removed translation.
4. **Remove the `api.message` block** from `src/i18n/en.json`, `es.json` and `pt.json`, and regenerate `.cloudflare/types/i18n.d.ts`. Run `vp check` (it includes i18n type checks). The unused-keys check in the i18n CLI should then report nothing from `api.*`.
5. **Tests** in `apps/rimelight.com/test/`:
   - each code returns the registered status and the `code` field;
   - no response body contains a string that starts with `api.`;
   - the registry and the call sites agree (a test that greps the route files for `apiError(c, "…")` and checks each code exists).
6. **Game side (GrandTale repo).** `UGTRimelightAuthProvider` and `UGTRimelightSettingsBackend` read `message` today. Change them to read `code` and map it to `FText` in the game's localization table. Keep `message` as the fallback when the code is unknown.
7. **Verify live.** With the dev Worker running: no token → `{"error":"Unauthorized","code":"bearer-missing","message":"Missing bearer token."}`. Confirm the dev log has no `[i18n]` warnings from API routes.

## Scenarios this has to cover

- **Unknown code from a newer server.** The game must not crash. It shows `message` (English) and logs the code.
- **Locale-specific clients.** They translate from the code, so they do not need `Accept-Language`.
- **Monitoring.** Group by `code`. Do not group by `message`, which may change.
- **Rate limit responses (429).** The rate limiter in `packages/security` returns its own text. Give it a code as well, or document that it is outside this scheme.
- **Errors from Hono itself** (404 for unknown routes, body parsing). These do not go through `apiError()`. Decide whether to wrap them.
- **Errors thrown but not caught** return a 500 with a plain-text body (`Internal Server Error`), which is not JSON and breaks clients that parse responses. Out of scope here, but worth a follow-up so clients never see a non-JSON error.

## Decisions to confirm

1. Option B (codes plus fixed English) for all API errors, or only for the game?
2. Keep the `error` field, which duplicates the HTTP reason phrase? Recommended: keep it for compatibility.
3. Should browser clients get translated text at all? If no, the `Accept-Language` path (option A) is not needed.
4. Who owns the code-to-text table for the game: the game repo (recommended) or the website's i18n files?

## Acceptance

- No response from `/api/*` contains an i18n key.
- Every error response has `error`, `code` and `message`, with `code` from the registry.
- The `api.message` block is gone from all three locale files.
- The game shows localized text for each code it can receive, with an English fallback.
- `vp check` and `vp test` pass in `apps/rimelight.com`.
