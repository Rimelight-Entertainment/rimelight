# New Project Setup Checklist

This document serves as a standardized checklist for onboarding and configuring new web projects and domains across the Rimelight ecosystem.

---

## 1. Cloudflare & Edge Configuration

- [ ] **Zone & DNS Setup**
  - [ ] Add domain zone to Cloudflare.
  - [ ] Configure DNS records (A/AAAA/CNAME) pointing to the hosting provider / Cloudflare Pages / origin.
  - [ ] Ensure SSL/TLS encryption mode is set to **Full (strict)**.
  - [ ] Enable Automatic HTTPS Rewrites and Always Use HTTPS.
  - [ ] Enable **DNSSEC** (zone > DNS > Settings). This signs the zone records so resolvers can cryptographically verify them, protecting against DNS spoofing/cache poisoning. There is essentially no downside for the typical single-provider setup.
    - **Leave "Multi-signer DNSSEC" and "Multi-provider DNS" off** unless the zone is intentionally served by a second authoritative DNS provider in parallel with Cloudflare. Those options coordinate shared keys/DS records across providers and are incompatible with Cloudflare Registrar's auto-managed DNSSEC — the dashboard requires you to disable DNSSEC before either can be enabled. If you only use Cloudflare for DNS, you don't need them.

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
          "app_id": "<APP_ID>",
        },
      ],
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

- [ ] **Object Storage & Upload Performance (Cloudflare R2)**
  - [ ] Create required R2 buckets for media, assets, user uploads, or telemetry.
  - [ ] Enable **R2 Local Uploads** for buckets receiving cross-region/global writes:
    - _Dashboard:_ Navigate to **R2** > Select Bucket > **Settings** > Toggle **Local Uploads**.
    - _CLI:_ `npx wrangler r2 bucket local-uploads enable <BUCKET_NAME>`
    - _Benefits:_ Reduces upload latency (TTLB) by up to 75% for globally distributed clients by writing locally to edge storage first with immediate consistency, followed by asynchronous replication to the primary bucket region.
    - _Considerations / When NOT to use:_ Do not use if the bucket requires strict legal/regulatory jurisdiction restrictions (e.g., EU-only, FedRAMP data residency locks), as data is temporarily written close to the client before replication. Also unnecessary if all client uploads originate from the exact same region as the bucket.

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

## 3. SEO, AEO & Agent Readiness (Discovery & Diagnostics)

- [ ] **Search Engines & Core Discovery**
  - [ ] Configure `robots.txt` and XML sitemap generation (`sitemap.xml`).
  - [ ] Configure standard metadata (title, description, OpenGraph, Twitter cards, canonical URLs).
  - [ ] Optional: Add `llms.txt` or `llms-full.txt` if specific agent guides/summaries are provided.
  - [ ] Set up `.well-known` endpoints if required (`security.txt`, `api-catalog`, `oauth-authorization-server`).

- [ ] **Cloudflare Agent Readiness Diagnostics & Auditing**
  - [ ] In Cloudflare Dashboard, run the **Agent Readiness Diagnostics** scan (under Overview / Agent Readiness tab) to verify technical readiness across all tiers:
    - [ ] **Quick wins:** Verify crawler-readable `robots.txt`, valid XML sitemaps, AI-crawler access rules, and Markdown for Agents toggle.
    - [ ] **Technical groundwork:** Verify Content Signals policy headers, API catalog publishing, link headers, and agent authentication/login instructions.
    - [ ] **Advanced integration:** Check agent cards (MCP / Model Context Protocol & A2A / Agent2Agent), skills index, Web Bot Auth, and WebMCP where applicable.
    - [ ] **Commerce protocols (if e-commerce):** Verify support for emerging agent payment standards (x402, ACP, UCP, AP2).
  - [ ] Review any failed checks, apply recommended next steps / agent prompts, and re-scan to achieve green status.

- [ ] **Answer Engine Optimization (AEO) & AI Visibility**
  - [ ] Check AEO dashboard in Cloudflare (or request early access) to evaluate brand discovery and recommendation rates in leading models (Claude, GPT, etc.).
  - [ ] Track key visibility metrics:
    - _Citation Rate:_ Frequency of being cited as an authoritative source in category prompts.
    - _Prominence & Mention Rate:_ How early/substantially content appears, separating brand awareness from citation attribution.
    - _Share of Voice & Industry Fit:_ Citation share compared to competitors for category queries.

---

## 4. Analytics & Monitoring

- [ ] **Analytics & AI Operator Observability**
  - [ ] Enable Cloudflare Web Analytics or Cloudflare Radar bot/agent tracking.
  - [ ] Monitor **AI Operator Activity** in Cloudflare Dashboard:
    - [ ] Inspect crawl volume vs. referral traffic per operator (OpenAI, Google, Anthropic, etc.).
    - [ ] Identify crawl-heavy bots that generate zero referrals and adjust crawler policies if necessary.
    - [ ] Monitor bot errors (e.g., 403 Forbidden, 404 Not Found) encountered by AI crawlers.
  - [ ] Configure error monitoring / logging (e.g., Sentry, Logflare) if needed.
