# RFC: Abstracting Shared Astro Configurations into a Reusable Helper

## Status
* **Proposed**: June 21, 2026
* **Author**: Antigravity (Coding Assistant)

---

## 1. Context & Objectives

Across the Rimelight ecosystem, there are currently seven projects using Astro (`csp`, `starter`, `playground`, `idantity.me`, `marcelocfilho.com`, `queerkit.com`, and `rimelight.com`). While these projects serve different domains, their configurations (`astro.config.ts`) share massive similarities and repetitive configurations:
1. **Experimental Settings**: 100% duplication of content intellisense, queued rendering, memory cache, and SVGO optimizer rules.
2. **Fonts Configuration**: Identical `@fontsource` mappings (Noto Sans, Noto Serif, and JetBrains Mono) with identical CSS variable bindings.
3. **i18n Settings**: Redundant locale arrays (`["en", "pt", "es"]`) and standard routing prefix settings.
4. **Vite & Adapter Presets**: Identical Cloudflare SSR adapters, server outputs, prefetch policies, and Rollup stats visualizer plugins.

### Objectives
* Abstract these shared boilerplate segments into declarative helpers inside `@rimelight/ui/config`.
* Implement a wrapper helper `defineAppConfig` that returns a pre-configured configuration base, reducing configurations to a single function call.
* Allow full customizability, overriding, and extension using deep-merging (`defu`).

---

## 2. Proposed API Design

We will introduce a series of modular config helpers in `packages/ui/src/config/` and re-export them from `@rimelight/ui/config`.

### 2.1. Modular Helpers

#### Fonts Helper (`defineFonts`)
```typescript
import { fontProviders } from "astro/config"

export function defineFonts(customFonts?: any[]) {
  const baseFonts = [
    {
      provider: fontProviders.fontsource(),
      name: "Noto Sans",
      cssVariable: "--font-sans",
      fallbacks: ["sans-serif"]
    },
    {
      provider: fontProviders.fontsource(),
      name: "Noto Serif",
      cssVariable: "--font-serif",
      fallbacks: ["serif"]
    },
    {
      provider: fontProviders.fontsource(),
      name: "JetBrains Mono",
      cssVariable: "--font-mono",
      fallbacks: ["monospace"]
    }
  ]
  return [...baseFonts, ...(customFonts || [])]
}
```

#### Experimental Preset (`defineExperimental`)
```typescript
import { memoryCache, svgoOptimizer } from "astro/config"

export function defineExperimental(overrides?: any) {
  return {
    contentIntellisense: true,
    queuedRendering: {
      enabled: true,
      contentCache: true
    },
    cache: {
      provider: memoryCache()
    },
    svgOptimizer: svgoOptimizer({
      plugins: [
        "preset-default",
        "removeXMLNS",
        {
          name: "removeXlink",
          params: {
            includeLegacy: true
          }
        }
      ]
    }),
    ...overrides
  }
}
```

#### i18n Preset (`defineI18n`)
```typescript
export function defineI18n(overrides?: any) {
  return {
    locales: ["en", "pt", "es"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true
    },
    ...overrides
  }
}
```

### 2.2. The Core Wrapper Configuration (`defineAppConfig`)

We combine the modular presets into a single wrapper function, utilizing **`defu`** to deep-merge custom overrides.

```typescript
import { defineConfig, type AstroUserConfig } from "astro/config"
import { defu } from "defu"
import { defineSecurity } from "./security"
import { defineFonts } from "./fonts"
import { defineExperimental } from "./experimental"
import { defineI18n } from "./i18n"
import cloudflare from "@astrojs/cloudflare"

export interface AppConfigOptions extends AstroUserConfig {
  domain: string
}

export function defineAppConfig(options: AppConfigOptions) {
  const { domain, ...customConfig } = options

  const defaults: AstroUserConfig = {
    site: `https://${domain}`,
    output: "server",
    adapter: cloudflare(),
    prefetch: {
      prefetchAll: true
    },
    experimental: defineExperimental(),
    security: defineSecurity({ domain }),
    fonts: defineFonts(),
    i18n: defineI18n()
  }

  const mergedConfig = defu(customConfig, defaults)

  return defineConfig(mergedConfig)
}
```

---

## 3. How Projects Adopt the Presets

Instead of lengthy configuration boilerplate, individual configurations become short, highly readable files.

### 3.1. Standard Adoption
For websites with standard configs, their file is reduced to:
```typescript
import { defineAppConfig } from "@rimelight/ui/config"

export default defineAppConfig({
  domain: "queerkit.com"
})
```

### 3.2. Extending Integrations or Overriding Values
If a project needs custom integrations, markdown processors, or additional security allowlists:
```typescript
import { defineAppConfig } from "@rimelight/ui/config"
import mdx from "@astrojs/mdx"

export default defineAppConfig({
  domain: "queerkit.com",
  
  // Custom integrations are deep-merged (appended)
  integrations: [
    mdx()
  ],

  // Specific values are overridden
  markdown: {
    syntaxHighlight: "prism"
  }
})
```

---

## 4. Merits & Impact
* **Maintainability**: Centralized presets mean changing font versions, security rules, experimental flags, or Cloudflare adapter configurations across all sites takes **one commit** in `@rimelight/ui`.
* **Zero Custom Lock-in**: Developers retain 100% control via standard deep overrides.
* **Developer Onboarding**: Creating a new site in the monorepo requires zero config setup friction.
