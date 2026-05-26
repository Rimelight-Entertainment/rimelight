You can copy and save the content below as migration-expressive-code.md at the root of your project directory. This document is formatted exactly for an automated agent or developer to execute the migration safely without breaking your strict CSP.

Markdown
# Implementation Plan: Migrate from Prism to CSP-Compliant Expressive Code + Shiki

This document details the migration path from Prism to `astro-expressive-code` utilizing Shiki's CSS variables theme engine. This configuration guarantees full compatibility with the existing strict Content Security Policy (`style-src 'self'` without `unsafe-inline`).

---

## Step 1: Install Dependencies

Execute the installation command within the repository root:

```bash
npm install astro-expressive-code shiki
Step 2: Update astro.config.mjs
Below is the rewritten, full configuration.

Critical Changes Made:
Removed Prism: markdown.syntaxHighlight has been changed from "prism" to false so Astro releases control of code block handling.

Added Shiki Generator: Imported createCssVariablesTheme from shiki/core to construct a pure CSS variable mapping theme (csp-theme).

Configured Expressive Code Integration: - emitExternalStylesheet: true outputs structural panel framing CSS to /_astro/ec.{hash}.css.

Registered myCspCompliantTheme to eliminate raw element inline styles (style="color:... hex mappings).

Updated Configuration:
JavaScript
import { visualizer } from "rollup-plugin-visualizer"
import nanostoresI18n from "astro-nanostores-i18n"
import en from "./src/translations/en.json"
import es from "./src/translations/es.json"
import pt from "./src/translations/pt.json"
import sitemap from "@astrojs/sitemap"
import mdx from "@astrojs/mdx"
import { ui } from "@rimelight/ui/integrations"
import { sri } from "@rimelight/ui/integrations"
import cloudflare from "@astrojs/cloudflare"
import { defineConfig, fontProviders, memoryCache, svgoOptimizer } from "astro/config"

// 1. IMPORT EXPRESSIVE CODE & THE SHIKI CORE INTEGRATIONS
import astroExpressiveCode from "astro-expressive-code"
import { createCssVariablesTheme } from "shiki/core"

// 2. CONSTRUCT A PURE CLASS/VARIABLE THEME FOR COMPLETELY SEVERING INLINE MARKUP STYLES
const myCspCompliantTheme = createCssVariablesTheme({
  name: "csp-theme",
  variablePrefix: "--shiki-",
  fontStyle: true
})

export default defineConfig({
  experimental: {
    contentIntellisense: true,
    queuedRendering: {
      enabled: true,
      contentCache: true
    },
    cache: {
      provider: memoryCache()
    },
    routeRules: {
      "/api/[...path]": {
        swr: 600
      },
      "/[...path]": {
        maxAge: 300
      }
    },
    clientPrerender: true,
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
    })
  },

  vite: {
    plugins: [
      visualizer({
        emitFile: true,
        filename: "stats.html"
      })
    ]
  },

  site: "[https://idantity.me](https://idantity.me)",
  prefetch: {
    prefetchAll: true
  },

  output: "server",
  adapter: cloudflare(),

  security: {
    checkOrigin: true,
    allowedDomains: [
      {
        hostname: "**.idantity.me",
        protocol: "https"
      }
    ],
    csp: {
      algorithm: "SHA-384",
      directives: [
        "default-src 'none'",
        "img-src 'self' [https://cdn.idantity.me](https://cdn.idantity.me) [https://i3.ytimg.com](https://i3.ytimg.com) [https://www.youtube.com](https://www.youtube.com) [https://www.youtube-nocookie.com](https://www.youtube-nocookie.com)",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "frame-src [https://www.youtube.com](https://www.youtube.com) [https://www.youtube-nocookie.com](https://www.youtube-nocookie.com) [https://challenges.cloudflare.com](https://challenges.cloudflare.com)",
        "upgrade-insecure-requests",
        "base-uri 'self'",
        "form-action 'self'"
      ],
      scriptDirective: {
        resources: [
          "'self'",
          "[https://challenges.cloudflare.com](https://challenges.cloudflare.com)",
          "[https://betterlytics.io/analytics.js](https://betterlytics.io/analytics.js)"
        ]
      },
      styleDirective: {
        // PERMITS STATIC EMITTED CSS FILES SOURCED FROM DOMAIN
        resources: ["'self'"]
      }
    }
  },

  i18n: {
    locales: ["en", "pt", "es"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true
    }
  },

  fonts: [
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
  ],

  markdown: {
    // 3. DISABLE THE BUILT-IN PRISM SYSTEM WHOLLY
    syntaxHighlight: false
  },

  integrations: [
    // 4. LOAD THE CSP-COMPLIANT EXPRESSIVE CODE CORE AHEAD OF MARKDOWN COMPLIERS
    astroExpressiveCode({
      emitExternalStylesheet: true,
      themes: [myCspCompliantTheme],
      themeCssRoot: ":root"
    }),

    nanostoresI18n({
      translationLoader: "./src/i18n/loader.ts",
      addMiddleware: true,
      translations: {
        "en": en,
        "es": es,
        "pt-br": pt
      }
    }),
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: {
          en: "en-US",
          pt: "pt-BR",
          es: "es-ES"
        }
      }
    }),

    mdx(),

    ui({
      logos: {
        logomark: "/favicon.svg"
      }
    }),

    sri()
  ]
})
Step 3: Global Stylesheet Definition
Because the CSS Variables theme emits raw tokens rather than static hex color strings, you must explicitly configure your global theme values inside your existing style layer (e.g., src/styles/global.css or equivalent). Since this stylesheet is bundled into a static .css file on your domain, it fulfills style-src 'self'.

Append the following lines to your global CSS bundle:

CSS
:root {
  /* Frame Colors */
  --shiki-foreground: #e1e4e8;
  --shiki-background: #1f2428;

  /* Syntax Component Highlighting Mappings */
  --shiki-token-keyword: #f97583;       /* function, const, import, class */
  --shiki-token-string: #9ecbff;        /* literals, "text variables" */
  --shiki-token-comment: #6a737d;       /* inline code comments documentation */
  --shiki-token-function: #b392f0;      /* declarations, operational methods */
  --shiki-token-constant: #79b8ff;      /* numeric states, structures, booleans */
  --shiki-token-parameter: #ffab70;     /* functional parameters passed down */
  --shiki-token-punctuation: #e1e4e8;   /* operational scopes, brackets, endings */
}
Step 4: Add a Search Sandbox Verification Page
To confirm that the integration operates properly and does not throw browser console exceptions due to the strict Content Security Policy, construct a test suite route.

Create a new file at src/pages/csp-test.astro:

Code snippet
---
// src/pages/csp-test.astro
// This handles an entirely standalone checking layout executing both MDX components and standard fenced notation
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Expressive Code CSP Verification Suite</title>
</head>
<body>
  <main style="max-width: 800px; margin: 40px auto; padding: 0 20px; font-family: sans-serif;">
    <h1>Expressive Code + Shiki CSP Diagnostic Page</h1>
    <p>Use this page to verify compliance with strict <code>style-src 'self'</code> layers.</p>

    <h2>Test Block 1: Basic JavaScript Fenced Code Block</h2>
    
    ```javascript title="src/utils/math.js" {2}
    // This sample verifies frame creation, line highlight, and variable highlighting
    function calculateTotal(subtotal, tax) {
      const total = subtotal * (1 + tax);
      return total;
    }
    console.log(calculateTotal(100, 0.08));
    ```

    <h2>Test Block 2: CSS Token Diagnostics</h2>
    
    ```css title="src/styles/theme.css"
    @media (prefers-color-scheme: dark) {
      body {
        background-color: var(--shiki-background);
        color: var(--shiki-foreground);
      }
    }
    ```

    <div style="margin-top: 40px; padding: 20px; background: #f0f0f0; border-radius: 8px;">
      <h3>Automated Integration Check List</h3>
      <ul style="line-height: 1.8;">
        <li><strong>Terminal Chrome Check:</strong> Does the code block render wrapped inside a terminal chrome display containing a tab called <code>src/utils/math.js</code>? If missing, layout styles are being blocked.</li>
        <li><strong>Syntax Highlighting Check:</strong> Are keywords like <code>function</code> and strings colored? If they render default white/black, the CSS tokens or attributes are failing validation.</li>
        <li><strong>Line Highlighting Check:</strong> Is line 3 of the JavaScript sample distinctively highlighted?</li>
        <li><strong>Browser Console Audit:</strong> Open DevTools (F12) and inspect the <strong>Console</strong>. Confirm there are exactly <strong>zero</strong> exceptions originating from <code>Content Security Policy directive: "style-src..."</code>.</li>
      </ul>
    </div>
  </main>
</body>
</html>