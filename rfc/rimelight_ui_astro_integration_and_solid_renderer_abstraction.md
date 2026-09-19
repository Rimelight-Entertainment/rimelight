# RFC-0005: `@rimelight/ui` as an Astro Integration & Solid Renderer Abstraction

- **Status**: **Draft**
- **Author(s)**: Rimelight Architecture Team
- **Created**: 2026-09-19
- **Last Updated**: 2026-09-19
- **Discussion/PR**: [Link to PR/Issue]

---

## 1. Summary

This proposal transforms `@rimelight/ui` from a loose collection of Vite plugins and Astro components into a first-class **Astro Integration**. By declaring `@astrojs/solid-js`, `solid-js`, `@unocss/vite`, and `unocss` as direct `dependencies` of `@rimelight/ui` and registering the Solid.js renderer automatically during Astro's config lifecycle, consuming packages and applications will no longer need to manually install or manage `@astrojs/solid-js`, `solid-js`, or `unocss` in their own `package.json` files.

At the same time, this design preserves Astro's strict island tree-shaking guarantees: routes and pages that do not use interactive client islands ship **0 bytes** of Solid.js runtime to the browser.

---

## 2. Motivation

### Current Pain Points

1. **Redundant Boilerplate Across Apps**: Every consuming app (`rimelight.com`, `starter.rimelight.com`, `idantity.me`, `queerkit.com`, `marcelocfilho.com`, `personal.idantity.me`, `thrift.idantity.me`, `octavianmironescu.com`) has had to manually declare:
   - `@astrojs/solid-js`
   - `solid-js`
   - `unocss`
2. **Leaky Abstraction**: While developers configure high-level options like `rimelightAstroConfig({ ui: true, solid: true })`, the underlying architecture required consumer repositories to manage low-level engine peer dependencies.
3. **Version Drift**: Upgrading Solid or UnoCSS across the monorepo required updating 8+ independent `package.json` files and running synchronization scripts, risking version mismatches.

### Goals

- **Zero-Config Consumer Setup**: Installing `@rimelight/ui` (or enabling `ui: true` in `@rimelight/config/astro`) brings in all necessary runtime and styling dependencies automatically.
- **Out-of-the-Box Island Hydration**: Components like `<RLAToaster client:load />`, `<RLAShortcuts client:load />`, and custom `.tsx` Solid components work without explicit renderer configuration.
- **Zero Bundle Bloat**: Keep browser bundles strictly pay-for-what-you-use. If a route renders static HTML, 0 KB of Solid is shipped.

### Non-Goals

- Forcing client-side JavaScript on static pages.
- Deprecating pure `.astro` static components.

---

## 3. Detailed Design

### 3.1. Proposed API & Developer Experience

#### Consuming Application `package.json` (Before vs After)

```diff
  "dependencies": {
    "@rimelight/config": "workspace:*",
    "@rimelight/ui": "workspace:*",
-   "@astrojs/solid-js": "7.0.2",
-   "solid-js": "1.9.15",
-   "unocss": "66.10.5"
  }
```

#### Consuming Application `astro.config.ts`

```typescript
import { defineConfig } from "astro/config"
import { rimelightAstroConfig } from "@rimelight/config/astro"

export default defineConfig(
  rimelightAstroConfig({
    domain: "example.com",
    ui: true // Automatically mounts UnoCSS + Solid island renderer
  })
)
```

#### Using Components in `.astro` Layouts & Pages

```astro
---
import RLAToaster from "@rimelight/ui/components/toaster/RLAToaster.astro"
import RLAShortcuts from "@rimelight/ui/components/shortcuts/RLAShortcuts.astro"
import CustomCounter from "../components/CustomCounter.tsx" // Solid component
---

<!-- Hydrates via automatically registered @astrojs/solid-js -->
<RLAToaster client:idle />
<RLAShortcuts client:idle />
<CustomCounter client:visible />
```

---

### 3.2. Architecture & Integration Lifecycle

```mermaid
flowchart TD
    AppConfig[Consumer astro.config.ts] -->|rimelightAstroConfig| ConfigPkg[@rimelight/config]
    ConfigPkg -->|Loads| UIIntegration[@rimelight/ui Integration]

    subgraph "@rimelight/ui Integration"
        UIIntegration -->|Registers| SolidRenderer[Solid.js Astro Renderer]
        UIIntegration -->|Attaches| UnoPlugin[UnoCSS Vite Plugin]
        UIIntegration -->|Injects| Presets[Wind4 + Typography + Icons Presets]
    end

    subgraph "Compilation & Island Hydration"
        SolidRenderer -->|Compiles| TSXFiles[Solid .tsx Islands]
        SolidRenderer -->|Injects Client Runtime Only When| ClientDirectives[client:* Directives Present]
        UnoPlugin -->|Extracts Utility Classes| StaticCSS[Generated Atomic CSS]
    end

    ClientDirectives -->|Bundled to Browser| ClientBundle[Client JS Bundle]
    TSXFiles -->|SSR Rendered| HTMLStream[Static HTML Output]
```

---

### 3.3. `@rimelight/ui` Integration Definition

In `packages/ui/src/integration.ts`:

```typescript
import type { AstroIntegration } from "astro"
import solid from "@astrojs/solid-js"
import UnoCSS from "@unocss/vite"
import { rimelightUiPreset } from "./preset.js"
import type { UIConfig } from "./types.js"

export function rimelightUi(config: UIConfig = {}): AstroIntegration {
  const { unocss = {}, solid: solidOptions, ...cfg } = config

  return {
    name: "@rimelight/ui",
    hooks: {
      "astro:config:setup": ({ updateConfig, addRenderer }) => {
        const solidIntegration = solid(
          typeof solidOptions === "object"
            ? solidOptions
            : { include: ["**/solid/**", "**/*.tsx", "**/*.jsx"] }
        )

        updateConfig({
          vite: {
            plugins: [
              UnoCSS({
                ...unocss,
                presets: [rimelightUiPreset(cfg), ...(unocss.presets || [])],
                content: {
                  ...unocss.content,
                  pipeline: unocss.content?.pipeline !== false && {
                    ...unocss.content?.pipeline,
                    include: [
                      /\.(astro|html|js|jsx|json|md|mdx|ts|tsx)$/,
                      ...[unocss.content?.pipeline?.include]
                    ]
                  }
                }
              })
            ]
          }
        })

        // Delegate renderer registration to @astrojs/solid-js
        if (solidIntegration.hooks["astro:config:setup"]) {
          solidIntegration.hooks["astro:config:setup"]({
            addRenderer,
            updateConfig
            // Pass standard Astro setup context
          } as any)
        }
      }
    }
  }
}

export default rimelightUi
```

---

## 4. Tree-Shaking & Performance Guarantees

A key requirement is ensuring that making Solid and UnoCSS direct dependencies does **not** bloat applications that do not use interactive client islands.

| Scenario                                                | Server Bundle (`dist/server`)          | Client Bundle (`dist/client`)                           |
| :------------------------------------------------------ | :------------------------------------- | :------------------------------------------------------ |
| **Static `.astro` pages only**                          | Pure HTML string templates             | **0 bytes** JS                                          |
| **Solid component with SSR only (no `client:*`)**       | Solid SSR renderer (~2 KB) executed    | **0 bytes** JS                                          |
| **Solid component with `<Component client:visible />`** | Solid SSR renderer executed            | Hydration chunk loaded **only when element is visible** |
| **Disabled Solid (`solid: false`)**                     | Gated integration; 0 Solid code loaded | **0 bytes** JS                                          |

---

## 5. Drawbacks & Trade-offs

1. **Direct Dependency Size in `node_modules`**:
   `node_modules/@rimelight/ui` will contain `solid-js` and `@astrojs/solid-js`. In modern package managers (pnpm), content-addressable storage shares these bytes across all workspace apps with 0 disk penalty.
2. **Pinned Framework Version**:
   All consuming apps inherit the Solid.js and UnoCSS versions specified by `@rimelight/ui`. In the Rimelight ecosystem, this is a deliberate benefit ensuring consistency across all web products.

---

## 6. Alternatives Considered

### Option A: Status Quo (Optional Peer Dependencies)

- **Downside**: Requires every single app and new site to manually add `solid-js`, `@astrojs/solid-js`, and `unocss` to `package.json`, creating maintenance friction and drift.

### Option B: Bundle via `@rimelight/config` Alone

- **Downside**: Separates the UI framework configuration from the UI component library (`@rimelight/ui`), creating a split responsibility where `@rimelight/ui` components depend on setup performed by `@rimelight/config`.

---

## 7. Adoption & Migration Strategy

1. **Update `@rimelight/ui`**:
   - Move `@astrojs/solid-js` and `solid-js` from `peerDependencies` to `dependencies`.
   - Export `rimelightUi` Astro integration.
2. **Update `@rimelight/config/astro`**:
   - Invoke `rimelightUi()` when `options.ui` is present.
3. **Clean Consumer `package.json` Files**:
   - Remove `@astrojs/solid-js` and `solid-js` from consumer apps.

---

## 8. Verification & Testing Plan

1. **Automated Tests**:
   - Verify `@rimelight/ui` unit and integration tests with `vp test`.
   - Test that components render correctly in both SSR and hydration contexts.
2. **Bundle Verification**:
   - Inspect `dist/client` across built apps to confirm zero client JS is emitted for static pages.
   - Test client interactivity for `<RLAToaster client:idle />` and `<RLAShortcuts client:idle />`.

---

## 9. Unresolved Questions

1. Should `@rimelight/ui` support optional custom JSX pragma configuration for consumers writing Solid `.tsx` alongside other frameworks, or should standard `solid-js` pragma remain the universal default? (Recommendation: Keep Solid as default).
