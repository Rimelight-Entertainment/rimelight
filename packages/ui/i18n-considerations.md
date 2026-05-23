# I18n Architecture: Nano Stores vs. Paraglide

This document summarizes the comparison between @nanostores/i18n and Paraglide JS, specifically for a Cloudflare Workers SSR environment using Astro.

## 1. Executive Comparison

| Feature | Nano Stores I18n | Paraglide JS |
| :--- | :--- | :--- |
| **Philosophy** | Reactive Store. Translations are state. | Compiler. Translations are JS functions. |
| **Type Safety** | Inferred from your base English object. | Generated .d.ts files for every message. |
| **SSR Latency** | Minimal (Initial fetch from KV). | Zero (Already bundled as code). |
| **Bundle Size** | ~1KB library + JSON chunks. | Smallest possible (Tree-shaken functions). |
| **Multi-Platform** | Easy (KV acts as a Universal API). | Moderate (Requires build-step in every app). |
| **Best For** | Flexible, Multi-Island Astro apps. | High-performance, Type-critical apps. |



## 2. Cloudflare KV Setup (Universal Truth)

To share translations across Web, Apps, and Games, use Cloudflare KV as your central database.

### The SSR Store Configuration

```javascript
// src/stores/i18n.js
import { createI18n, localeFrom, browser } from '@nanostores/i18n';

export const locale = localeFrom(
  browser({ available: ['en', 'ru', 'es'], fallback: 'en' })
);

export const i18n = createI18n(locale, {
  async get(code, components) {
    // Accessing Cloudflare KV via Astro Runtime
    const { env } = Astro.locals.runtime; 
    
    const results = await Promise.all(
      components.map(async (name) => {
        const data = await env.TRANSLATIONS_KV.get(`locale:${code}:${name}`, 'json');
        return { [name]: data || {} };
      })
    );

    return Object.assign({}, ...results);
  }
});
```
3. The Multi-Platform WorkflowTo make your English "Code-First" strings available to other platforms:  Extract: Run npm run i18n:extract to generate en.json.  Sync: Push the JSON to KV.  Consume: Other apps fetch from a simple API endpoint.  Universal API Endpoint (Astro/Worker)[CODE_FENCE]javascript// src/pages/api/v1/translations/[lang]/[id].jsexport async function GET({ params, locals }) {const { lang, id } = params;const { env } = locals.runtime;const data = await env.TRANSLATIONS_KV.get(locale:${lang}:${id});return new Response(data, {headers: {'Content-Type': 'application/json','Access-Control-Allow-Origin': '*'}});}