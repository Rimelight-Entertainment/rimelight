# RFC: Nuxt UI to Rimelight UI Migration Guide

* **Title**: Nuxt UI to Rimelight UI Migration Guide
* **Author**: Daniel Marchi & Rimelight Team
* **Status**: Implemented
* **Created**: 2026-05-25

---

## 1. Abstract

This document details the usage of Nuxt UI components (imported from `@rimelight/ui/nuxt`) within the `rimelight.com` project and specifies the required substitutions to transition entirely to native, high-performance Rimelight UI components.

## 2. Overview

The goal is to completely remove Nuxt UI from the project and library, replacing it with the locally developed Rimelight UI components located in `packages/ui`.

## 3. Component Mapping & Instances

### 1. Blog Components
Currently used in `src/pages/[locale]/index.astro`.

| Nuxt UI Component | Substitution | Notes |
| :--- | :--- | :--- |
| `BlogPosts` | None (Local RLA alternative needed) | Currently imported as `import { BlogPosts } from "@rimelight/ui/nuxt"`. No `RLABlogPosts` exists. |
| `BlogPost` | None (Local RLA alternative needed) | Currently imported as `import { BlogPost } from "@rimelight/ui/nuxt"`. No `RLABlogPost` exists. |

**Instance:**
- `rimelight.com/src/pages/[locale]/index.astro` (lines 10, 246, 249)

---

### 2. Layout Components
Used in global app components.

| Nuxt UI Component | Substitution | Notes |
| :--- | :--- | :--- |
| `FooterColumns` | `RLAFooter` (slots) | `FooterColumns` is used inside `AppFooter.astro`. `RLAFooter` exists but may need slot adjustments. |
| `NavigationMenu` | `RLANavigationMenu` | Used in `AppHeaderNavigationMenu.vue`. Note: Current `RLANavigationMenu` is Astro-only. |

**Instances:**
- `rimelight.com/src/components/app/AppFooter.astro` (line 6)
- `rimelight.com/src/components/app/AppHeaderNavigationMenu.vue` (line 2)

---

### 3. Form Components (Vue)
Extensively used in authentication forms.

| Nuxt UI Component | Substitution | Notes |
| :--- | :--- | :--- |
| `Form` | `RLAForm`? | No `RLVForm` (Vue) exists yet. `RLAForm` is Astro-only. |
| `FormField` | `RLAFormField`? | No `RLVFormField` (Vue) exists yet. `RLAFormField` is Astro-only. |
| `Input` | `RLAInput`? | No `RLVInput` (Vue) exists yet. `RLAInput` is Astro-only. |
| `Button` | `RLVButton` | `RLVButton.vue` exists in `packages/ui/src/components/vue`. |
| `Checkbox` | `RLACheckbox`? | No `RLVCheckbox` (Vue) exists yet. `RLACheckbox` is Astro-only. |
| `Progress` | `RLAProgress`? | No `RLVProgress` (Vue) exists yet. `RLAProgress` is Astro-only. |
| `Icon` | `RLVIcon` | `RLVIcon.vue` exists in `packages/ui/src/components/vue`. |

**Instances:**
- `rimelight.com/src/components/auth/AuthSignInForm.vue`
- `rimelight.com/src/components/auth/AuthSignUpForm.vue`
- `rimelight.com/src/components/auth/ConstructionSignIn.vue`

---

### 4. General Components
Used across various pages and documentation examples.

| Nuxt UI Component | Substitution | Notes |
| :--- | :--- | :--- |
| `Card` | `RLACard` | Exists in `packages/ui/src/components/astro/RLACard.astro`. |
| `Badge` | `RLABadge` | Exists in `packages/ui/src/components/astro/RLABadge.astro`. |
| `Accordion` | `RLAAccordion` | Exists in `packages/ui/src/components/astro/RLAAccordion.astro`. |
| `Button` (Astro) | `RLAButton` | Exists in `packages/ui/src/components/astro/RLAButton.astro`. |

**Instances:**
- `rimelight.com/src/content/docs/...` (Various documentation files)
- `rimelight.com/src/components/auth/ConstructionSignIn.vue`

---

### 5. Composables
Used for UI interactions.

| Nuxt UI Composable | Substitution | Notes |
| :--- | :--- | :--- |
| `useToast` | None (Local alternative needed) | `packages/ui/src/composables` only contains `useScrollToTop`. |

**Instances:**
- `rimelight.com/src/content/docs/en/company/docs/packages/rimelight-ui/composables/usetoast.mdx`

## 4. Action Items for Library Development

1.  **Develop Vue Components (`RLV*`)**: Many core components (`Input`, `Form`, `Checkbox`, `NavigationMenu`) only exist as Astro components (`RLA*`). For use in `.vue` files (especially Auth forms), Vue versions need to be created in `packages/ui/src/components/vue`.
2.  **Blog Components**: Create `RLABlogPosts` and `RLABlogPost` in Astro to replace the ones currently re-exported from Nuxt UI.
3.  **Toast System**: Implement a native Rimelight toast system and `useToast` composable.
4.  **Parity Audit**: Ensure `RLV*` components support the same props and slots as the Nuxt UI components they replace to minimize friction during migration.
