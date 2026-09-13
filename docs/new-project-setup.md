# New Project Setup Checklist

This document serves as a standardized checklist for onboarding and configuring new web projects and domains across the Rimelight ecosystem.

---

## 1. Cloudflare & Edge Configuration

- [ ] **Zone & DNS Setup**
  - [ ] Add domain zone to Cloudflare.
  - [ ] Configure DNS records (A/AAAA/CNAME) pointing to the hosting provider / Cloudflare Pages / origin.
  - [ ] Ensure SSL/TLS encryption mode is set to **Full (strict)**.
  - [ ] Enable Automatic HTTPS Rewrites and Always Use HTTPS.

- [ ] **AI & Agent Accessibility (Markdown for Agents)**
  - [ ] In Cloudflare Dashboard, navigate to the domain zone.
  - [ ] Under **Quick Actions** (or **AI & Agents** settings), enable **Markdown for Agents**.
    - _What this does:_ Automatically converts HTML responses to structured Markdown on-the-fly when AI crawlers and agents send `Accept: text/markdown` request headers.
    - _Code changes required:_ **None** on the origin application for serving content — Cloudflare handles content negotiation and conversion at the edge.
  - [ ] Review and configure **Content Signals** policies (`content-signal` headers for training/search/input permissions).

- [ ] **Feature Flags & Progressive Delivery (Cloudflare Flagship)**
  - [ ] In Cloudflare Dashboard, create or configure a **Flagship** app for the project.
  - [ ] Configure Flagship binding in `wrangler.jsonc` (or `wrangler.toml`) for edge evaluation:
    ```jsonc
    {
      "flagship": [
        {
          "binding": "FLAGS",
          "app_id": "<APP_ID>"
        }
      ]
    }
    ```
  - [ ] Standardize evaluation via native bindings (`env.FLAGS`) or OpenFeature provider (`@cloudflare/flagship/server` and `@openfeature/server-sdk`):
    - _Worker binding access:_ `await env.FLAGS.getBooleanValue('flag-key', false, context)`
    - _OpenFeature provider:_ `new FlagshipServerProvider({ binding: env.FLAGS })`
  - [ ] For browser-side flag evaluations, configure `@cloudflare/flagship` client provider with appropriate caching/TTL.
  - [ ] Define targeting rules and percentage rollouts to maximize release safety and minimize blast radius.

- [ ] **Security & Bot Management**
  - [ ] Configure Bot Fight Mode / AI crawler access rules based on project requirements.
  - [ ] Set up Web Application Firewall (WAF) rules and rate limiting if applicable.
  - [ ] Configure Security Headers (HSTS, Content Security Policy, X-Frame-Options).

- [ ] **Caching & Performance**
  - [ ] Configure caching rules for static assets (`/assets/*`, `/_astro/*`, images, fonts).
  - [ ] Enable Brotli and Early Hints where supported.

---

## 2. Repository & Development Toolchain

- [ ] **Toolchain & Dependencies**
  - [ ] Verify Node.js version in `.node-version`.
  - [ ] Install dependencies with `pnpm install` (or `vp install` if using Vite+).
  - [ ] Verify formatting, linting, and type checking (`vp check`, `pnpm check`, or equivalent).

- [ ] **Environment Configuration**
  - [ ] Create `.env.example` documenting all required environment variables.
  - [ ] Set up local development environment variables (`.env`).
  - [ ] Configure secrets and environment variables in deployment environments (CI/CD, Cloudflare Pages/Workers, or hosting provider).

---

## 3. SEO, Metadata & Discovery

- [ ] **Search Engines & AI Discovery**
  - [ ] Configure `robots.txt` and sitemap generation (`sitemap.xml`).
  - [ ] Optional: Add `llms.txt` or `llms-full.txt` if specific agent guides/summaries are provided.
  - [ ] Configure standard metadata (title, description, OpenGraph, Twitter cards, canonical URLs).
  - [ ] Set up `.well-known` endpoints if required (`security.txt`, `api-catalog`).

---

## 4. Analytics & Monitoring

- [ ] **Analytics & Observability**
  - [ ] Enable Cloudflare Web Analytics or Cloudflare Radar bot/agent tracking.
  - [ ] Configure error monitoring / logging (e.g., Sentry, Logflare) if needed.
