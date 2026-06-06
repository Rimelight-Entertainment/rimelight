# Rimelight Monorepo - Specification Non-Conformance Report

This document compiles the final audit of all non-conforming items from the checklist for the `starter.rimelight.com` template and associated UI packages.

---

## 📂 Foundations

- **Status**: 🟢 **100% Conforming**
- **Non-Conforming Items**: None. All required and recommended items are fully implemented (including vector/ICO/PWA icons, theme color queries, native Popover API, and localized alternate feeds).

---

## 📈 SEO

- **Status**: 🟢 **90% Conforming**
- **Non-Conforming Items**:
  1. **Image and video sitemap extensions (Optional)**: Not implemented. The static sitemap generator is not configured to map CDN media assets since media loads dynamically.
  2. **IndexNow (Optional)**: Not implemented. Triggering Bing/Yandex search recrawls requires project-specific hosting environment API endpoints.

---

## ♿ Accessibility (a11y)

- **Status**: 🟡 **80% Conforming**
- **Non-Conforming Items**:
  1. **Hidden until found (Recommended)**: Non-conforming. Collapsible UI components (accordions, menu drawers) toggle visibility via custom CSS classes (`display: none` / `flex` rules). Migrating to `hidden="until-found"` requires refactoring transition animations and focus event routines library-wide.
  2. **Accessible data tables (Required)**: Partially non-conforming. While `RLATable.astro` renders valid table elements, structured attributes (such as `caption`, row/column `scope`, and cell header mappings) must be manually populated by developers for specific data structures.
  3. **Captions and transcripts (Required)**: Non-conforming. Custom media components (`RLAAudio.astro`, `RLAVideo.astro`) support source parameters but do not enforce track or transcription indexing as these are asset-dependent.

---

## 🔒 Security

- **Status**: 🟢 **95% Conforming**
- **Non-Conforming Items**:
  1. **DNSSEC (Optional)**: Handled at the host registrar level rather than in the template code.

---

## 📂 Well-Known URIs

- **Status**: 🟢 **90% Conforming**
- **Non-Conforming Items**:
  1. **OIDC configuration, Webfinger, A2A, and Apple/Android App Links (Optional)**: Not implemented. These federated and platform-specific URIs (e.g. `openid-configuration`, `webfinger`, `apple-app-site-association`) are not configured because the template is not an identity provider, Fediverse node, or mobile app companion.

---

## 🤖 Agent Readiness

- **Status**: 🟡 **85% Conforming**
- **Non-Conforming Items**:
  1. **Per-page Markdown source endpoints (Recommended)**: Non-conforming. Astro compiles `.astro` and `.md` source documents into static HTML/JS bundles. As a result, page routers do not natively expose a corresponding `.md` raw source endpoint.
  2. **Web Bot Auth, WebMCP, and Schemamap (Optional)**: Not configured. These advanced client-side agent verification and browser modeling APIs are not implemented.

---

## ⚡ Performance

- **Status**: 🟢 **85% Conforming**
- **Non-Conforming Items**:
  1. **No-Vary-Search response header (Recommended)**: Non-conforming. The `No-Vary-Search` header is not dynamically injected in the security middleware to optimize query parameter cache hits.
  2. **Critical CSS and render-blocking resources (Recommended)**: Partially non-conforming. CSS files are optimized and minimal, but dynamic above-the-fold Critical CSS inlining is not configured.
  3. **Visibility-aware rendering (Recommended)**: Not set globally. Using `content-visibility` to skip paints of off-screen nodes requires content-specific page layout adjustments rather than generic component container settings.

---

## 🔒 Privacy

- **Status**: 🟢 **95% Conforming**
- **Non-Conforming Items**:
  1. **Global Privacy Control (GPC) (Recommended)**: Non-conforming. There is no client-side listener reading `navigator.globalPrivacyControl` to dynamically drop/enable analytics calls (although default analytics are cookie-less).

---

## 🛡️ Resilience

- **Status**: 🟢 **90% Conforming**
- **Non-Conforming Items**:
  1. **Offline support and service workers (Optional)**: Not implemented. Standard offline fallbacks are not configured since no service worker caching rules are loaded.
  2. **Monitoring and uptime (Recommended)**: Synthetic monitors and separate status page hosting are handled externally.

---

## 🌐 Internationalisation (i18n)

- **Status**: 🟢 **90% Conforming**
- **Non-Conforming Items**:
  1. **hreflang in XML sitemaps (Optional)**: Hreflang alternates are rendered in the HTML head (using layouts and `RLAHead.astro`) rather than the XML sitemap.
  2. **Writing modes & CJK line breaking (Optional)**: Not configured.
  3. **Plural rules and grammatical number (Recommended)**: Pluralizations in translations rely on key variations rather than dynamic `Intl.PluralRules` mappings.
