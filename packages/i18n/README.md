# @rimelight/i18n

Locale-aware translation for Vite + Hono apps: JSON dictionaries, a synchronous `t()`, locale URLs and
per-request locale resolution, with typed keys generated from your base locale.

## Setup

Translations live in one JSON file per locale, in `src/i18n` by default:

```
src/i18n/en.json   # base locale: defines every key
src/i18n/pt.json
```

**Vite plugin.** Loads the files and generates the typed keys. Add `types` to choose where the typed keys go:

```ts
// vite.config.ts
import { i18n } from "@rimelight/i18n/plugin";

export default defineConfig({
  plugins: [i18n({ types: ".cloudflare/types/i18n.d.ts" })],
});
```

**Server middleware.** Mount it in your Hono app. It resolves the locale per request and redirects to the
locale-prefixed URL:

```ts
import { i18n } from "@rimelight/i18n/middleware";

app.use(i18n());
```

Calling `i18n()` is what makes `getCurrentLocale()` return the request's locale on the server.

## Usage

```ts
import { t, getLocaleUrl, getCurrentLocale, getLocaleInfo } from "@rimelight/i18n";

t("nav.home"); // "Home"
t("auth.welcome", { name: "Ana" }); // "Welcome, Ana!"
t("modals.items", { count: 3 }); // picks the plural branch for `count`
t.localize({ en: "Hello", pt: "Olá" }); // resolves a content object for the current locale
t.raw("some.namespace"); // untyped lookup of any value, objects included

getLocaleUrl("/about"); // "/pt/about" when pt is current
getCurrentLocale(); // "pt"
getLocaleInfo().tag; // "pt-BR", for <html lang>
```

Locale-aware helpers:

- `getLocales()`, `getDefaultLocale()`, `getCurrentLocale()`, `setCurrentLocale(code)`
- `getLocaleUrl(path, locale?)`: prefixes internal paths; external, hash, and file paths are returned unchanged
- `getLocaleInfo(code?)`: `{ code, tag, label, dir }`, derived with `Intl` unless configured
- `getLocaleAsset(assets, locale?)`: picks a value keyed by locale, falling back to the default locale
- `t.array`, `t.plural`: arrays and plural category lookups, for the cases `t()` doesn't cover

## Typed keys

The plugin generates an augmentation of `TranslationRegistry` from the base locale, so `t()` is typed:

- Unknown keys fail to compile.
- Keys with `{placeholders}` require those params.
- Plural keys require `count`.
- `t.raw` stays untyped, for dynamic keys.

The generated file has to be part of your TypeScript program. Add its folder to `tsconfig.json`
`include` if it isn't already covered. Keys are generated when Vite starts or builds, and again whenever a
base-locale file changes.

Only literal keys are typed. A key built at runtime, such as `t(\`page.${id}\`)`, falls back to `t.raw`.

## Plugin options

| Option                | Default                                   | Description                                                            |
| --------------------- | ----------------------------------------- | ---------------------------------------------------------------------- |
| `dir`                 | `src/i18n`                                | Directory holding `<locale>.json`, relative to the project root        |
| `types`               | `node_modules/.rimelight/types/i18n.d.ts` | Typed-keys output. `false` disables it                                 |
| `translations`        |                                           | Inline dictionaries, keyed by locale, instead of reading `dir`         |
| `locales`             | from the files                            | Locale codes, or an object overriding `tag`, `label`, `dir` per locale |
| `defaultLocale`       | `en`                                      | Base locale, and the fallback for missing keys                         |
| `prefixDefaultLocale` | `true`                                    | Whether the default locale also gets a URL prefix                      |
| `skipPaths`           | `/api`, `/_`, `/.well-known`, `/cdn-cgi`  | Paths the middleware leaves alone                                      |

## Game clients and other external consumers

The middleware serves each dictionary as JSON at `/locales/<locale>.json`, with a one-hour cache.

## CLI

`rimelight-i18n` checks and generates translations outside the Vite build:

```sh
rimelight-i18n check            # missing, stale, empty, and mismatched keys across locales
rimelight-i18n check --fix      # prunes stale keys and adds missing skeletons from the base locale
rimelight-i18n types            # writes the typed-keys file
rimelight-i18n types --config vite.config.ts   # same, using the i18n plugin settings from your Vite config
```

| Flag                  | Description                                                                                 |
| --------------------- | ------------------------------------------------------------------------------------------- |
| `-d, --dir <path>`    | Locale directory (default `src/i18n`)                                                       |
| `-b, --base <locale>` | Base locale (default `en`)                                                                  |
| `-o, --out <path>`    | Typed-keys output for `types` (default `node_modules/.rimelight/types/i18n.d.ts`)           |
| `-c, --config <file>` | With `types`: run the plugin from this Vite config, so its `types` and `dir` settings apply |
| `-t, --types`         | Also write the typed-keys file during `check`                                               |
| `--casing <casing>`   | `kebab-case` (default), `camelCase`, `snake_case`, or `any`                                 |
| `--allow-flat`        | Permit underscores in key names                                                             |
| `--allow-empty`       | Don't treat empty strings as errors                                                         |

`check` exits non-zero when anything is wrong, so it works in CI.

## Client route loading (Solid)

Each page loads only the translations it uses. Client navigation needs one wrapper around the router's children, inside a `Loading` boundary. It holds the page until the next URL's translations have loaded:

```tsx
import { RLI18n } from "@rimelight/i18n/solid";

<Loading fallback={<main>Loading.</main>}>
  <RLI18n pathname={props.location.pathname}>{props.children}</RLI18n>
</Loading>;
```

The gate is async like any other Solid data: a navigation keeps the previous page on screen until the next one is ready, and a failed load reaches the nearest error boundary. Pages already loaded render at once.

`solid-js` is a peer dependency. The server and the first load need no wrapper: the config already holds what they need.
