# Rimelight Entertainment Monorepo

## Overview

The repository for web packages and apps developed by Rimelight Entertainment.

## Technology Stack

- **Runtime:** `node.js`
- **Toolchain:** `vite-plus`
- **Package Manager:** `pnpm`
-

## Local Development

### Prerequisites

### Initial Setup

1. **Clone the repository:**

   ```bash
   git clone <repo-url> rimelight
   cd rimelight
   git pull
   ```

2. **Open in Rider or Visual Studio:**
   Open `GrandTale.sln` or `GrandTale.uproject` directly in your IDE.

3. Install Dependencies
   ```sh
   pnpm install
   ```

The repository `prepare` lifecycle hook runs `vp config` automatically to initialize the Vite+ toolchain and git commit hooks.

---

## 4. Development Workflows & Scripts

Run commands from the monorepo root:

| Command      | Action                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| `vp install` | Install all workspace dependencies across apps and packages            |
| `vpr build`  | Build every package and application with a build target                |
| `vpr test`   | Run Vitest test suites across all workspaces                           |
| `vpr check`  | Format, lint, and type check across the entire repo (`vp check --fix`) |

### Working on a Specific Application or Package

Filter commands to target individual packages:

```sh
# Start development server for rimelight.com
pnpm --filter rimelight-dot-com dev

# Run UI component test suite
pnpm --filter @rimelight/ui test

# Regenerate design tokens
pnpm --filter @rimelight/design generate
```

## 5. Repository Structure

```
rimelight/
├── apps/
│   └── rimelight.com/           # Company website & UE5 game client API
├── packages/
│   ├── cms/                     # @rimelight/cms — content delivery & block registry
│   ├── config/                  # @rimelight/config — shared strict TypeScript configs
│   ├── design/                  # @rimelight/design — design tokens & multi-target generator
│   ├── i18n/                    # @rimelight/i18n — typed translations & chunk loading
│   ├── security/                # @rimelight/security — CSP, SRI, rate limits, Turnstile
│   ├── seo/                     # @rimelight/seo — metadata, sitemaps, JSON-LD, RSS
│   └── ui/                      # @rimelight/ui — accessible SolidJS 2.0 component library
├── .github/workflows/           # CI pipelines (pkg.pr.new previews, tests, checks)
├── AGENTS.md                    # Specific AI agent rules & toolchain instructions
├── README.md                    # Project overview & quickstart (this file)
└── PROJECT.md                   # Comprehensive project manual & technical specs
```

- **Web Apps:** `apps/rimelight.com` (company site, docs, store, franchise hub, and game API).
- **Core Packages:** Content delivery (`@rimelight/cms`), design tokens (`@rimelight/design`), internationalization (`@rimelight/i18n`), edge security (`@rimelight/security`), SEO metadata (`@rimelight/seo`), UI components (`@rimelight/ui`), and shared TypeScript configuration (`@rimelight/config`).
- **Game Backend API:** Headless Auth0 ROPC authentication and title settings persistence for Unreal Engine 5 clients (including _Grand Tale_).
-

## License

Proprietary. Copyright (c) 2026 Rimelight Entertainment. All rights reserved.

See the `LICENSE.md` file for more details.
