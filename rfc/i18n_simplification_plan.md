# i18n Simplification RFC & Standardization Plan

## Executive Summary & Target Pattern

All Rimelight applications (`starter.rimelight.com`, `rimelight.com`) are standardized on a single, clean i18n pattern using direct `t("namespace.key")` calls and centralized JSON translation dictionaries.

---

## Standard i18n Architectural Principles

### 1. Direct `t("namespace.key")` Usage

- **No `useI18n()` / `useI18nAsync()` or `messages` proxy objects**: Do not instantiate `const messages = useI18n(...)` in pages or components.
- **Clean `t("namespace.key")` Signature**: Import `{ t }` from `@rimelight/i18n` and call `t("namespace.key")` directly in templates, props, and frontmatter script blocks. There is no need to pass `Astro` as a parameter.
- **Component Usage**: Components (e.g., forms, headers, footers) call `t("namespace.key")` directly for default prop values or inline labels rather than accepting a raw `messages` object prop or hardcoding `?? "string"` fallbacks.

```astro
---
import { t } from '@rimelight/i18n';
---

<AppLayout title={t("page_about.title")} description={t("page_about.description")}>
  <h1>{t("page_about.hero_title")}</h1>
</AppLayout>
```

### 2. Centralized Dictionaries (`translations/*.json`)

- **No Inline Fallback Objects**: Never supply inline fallback objects as 3rd arguments or hardcoded template strings. All user-facing text belongs in `translations/*.json`.
- **Strict Alphabetical Order for Top-Level Namespaces**: Top-level namespace keys in `translations/en.json` (and all translation files) MUST be sorted in **strict alphabetical order**. Inner keys maintain logical order.

Example `translations/en.json`:

```json
{
  "app_footer": {
    "links_resources_label": "Resources"
  },
  "app_header": {
    "links_home_label": "Home"
  },
  "app_layout": {
    "skipToContent": "Skip to main content"
  },
  "blog": {
    "title": "Blog",
    "lastUpdatedOn": "Last updated on"
  },
  "branding": {
    "title": "Branding"
  },
  "cookie_notice": {
    "title": "Cookie Notice"
  },
  "dashboard": {
    "meta_title": "Dashboard"
  },
  "errors": {
    "notFound": "Page Not Found"
  },
  "legal": {
    "title": "Legal"
  },
  "page_about": {
    "title": "About Rimelight"
  }
}
```

### 3. Locale-Aware Utility Functions & Email Messages

- Helper functions (e.g. `getEmailMessages(locale)`) must accept a `locale` argument, import translation JSON modules, and resolve keys dynamically with English fallback.

---

## Migration Checklist for `rimelight.com`

When applying this RFC to `rimelight.com` or any additional package, follow these exact steps:

1. **Extract & Centralize Strings**:
   - Collect all hardcoded strings and inline `useI18n` fallback objects into `src/translations/en.json`.
   - Ensure all top-level namespace keys in `en.json` are sorted in **alphabetical order**.

2. **Replace `useI18n` with `t("namespace.key")`**:
   - In all Astro layouts (`AppLayout.astro`, `DashboardLayout.astro`, `DocsLayout.astro`), replace `useI18n` with `t("namespace.key")`.
   - In all pages (`src/pages/[locale]/**/*.astro`), import `{ t } from '@rimelight/i18n'` and replace `messages.key` with `t("namespace.key")`.
   - In error pages (`404.astro`, `500.astro`), use `t("errors.notFound")`, etc.
   - In blog/legal slug pages, replace `useI18n` with `t("blog.lastUpdatedOn")` / `t("legal.lastUpdatedOn")`.

3. **Refactor Auth & UI Components**:
   - Update components (e.g., `AuthSignInForm.astro`, `AuthSignUpForm.astro`, `ConstructionSignIn.astro`, `AppHeader.astro`, `AppFooter.astro`) to call `t("namespace.key")` directly instead of accepting `messages` props or holding `??` fallbacks.

4. **Clean Imports & Audit**:
   - Remove unused `useI18n` / `useI18nAsync` imports.
   - Run `vp check` to verify linting, formatting, and type-checking across the workspace.
