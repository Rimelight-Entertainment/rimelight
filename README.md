# Rimelight Entertainment Monorepo

> **Source for Rimelight Entertainment's web applications, headless game APIs, and shared packages.**  
> Built with SolidJS 2.0, served serverless from Cloudflare Workers, and orchestrated via [Vite+](https://viteplus.dev/guide/) (`vp`).

---

## 1. Monorepo Overview

This repository houses all public web services, client documentation, design tokens, and game backend APIs for Rimelight Entertainment:

- **Web Apps:** `apps/rimelight.com` (company site, docs, store, franchise hub, and game API).
- **Core Packages:** Content delivery (`@rimelight/cms`), design tokens (`@rimelight/design`), internationalization (`@rimelight/i18n`), edge security (`@rimelight/security`), SEO metadata (`@rimelight/seo`), UI components (`@rimelight/ui`), and shared TypeScript configuration (`@rimelight/config`).
- **Game Backend API:** Headless Auth0 ROPC authentication and title settings persistence for Unreal Engine 5 clients (including _Grand Tale_).

---

## 2. Standard Documentation Suite

Our monorepo adheres to the standardized 4-file documentation architecture:

| Document                                                                       | Purpose                                                                                                                         |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| [**README.md**](file:///C:/Users/idant/WebstormProjects/rimelight/README.md)   | Simple overview of the monorepo with local development and build instructions.                                                  |
| [**PROJECT.md**](file:///C:/Users/idant/WebstormProjects/rimelight/PROJECT.md) | Comprehensive description: complete package catalog, application breakdown, game API specs, and deployment topology.            |
| [**PLAN.md**](file:///C:/Users/idant/WebstormProjects/rimelight/PLAN.md)       | Progress tracker: live package maturity matrix, game API verification status, and active backlog.                               |
| [**AGENTS.md**](file:///C:/Users/idant/WebstormProjects/rimelight/AGENTS.md)   | Specific agent instructions: Vite+ unified toolchain (`vp`), strict coding rules, debugging workflows, and testing constraints. |

---

## 3. Getting Started

### Prerequisites

- **Node.js:** `26.13.1` (managed via `.node-version`)
- **Package Manager:** `pnpm@12.16.1+` (defined in `packageManager`)
- **Toolchain:** `vite-plus` (`vp`)

### Initial Installation

```sh
pnpm install
```

The repository `prepare` lifecycle hook runs `vp config` automatically to initialize the Vite+ toolchain and git commit hooks.

---

## 4. Development Workflows & Scripts

Run commands from the monorepo root:

| Command        | Action                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| `pnpm install` | Install all workspace dependencies across apps and packages            |
| `pnpm build`   | Build every package and application with a build target                |
| `pnpm test`    | Run Vitest test suites across all workspaces                           |
| `pnpm check`   | Format, lint, and type check across the entire repo (`vp check --fix`) |

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

---

## 5. Repository Layout

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
├── PROJECT.md                   # Comprehensive project manual & technical specs
└── PLAN.md                      # Milestone progress tracker & active backlog
```

---

## 6. License

MIT. Copyright (c) 2026 Rimelight Entertainment.
