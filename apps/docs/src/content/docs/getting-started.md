---
title: Getting Started
description: Learn how to get started with Rimelight.
---

Welcome to the Getting Started guide! This page will walk you through the basics of setting up Rimelight.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** v25 or later
- **pnpm** v10 or later
- **Wrangler CLI** for Cloudflare Workers

## Installation

Clone the repository and install dependencies:

```bash
pnpm install
```

## Running the Starter App

Navigate to the starter app and start the development server:

```bash
pnpm --filter @rimelight/starter dev
```

This will start the development server at `http://localhost:4321`.

## Project Structure

Rimelight is organized as a monorepo:

```
rimelight/
├── apps/
│   ├── starter/      # Base Astro + Cloudflare template
│   ├── docs/         # This documentation site
│   └── rimelight.com # Main website (coming soon)
└── packages/
    ├── ui/           # Shared UI component library
    ├── cli/          # CLI tools (coming soon)
    └── cms/          # CMS integration (coming soon)
```

## Next Steps

- Explore the [UI Components](/ui-components/) documentation
- Learn about [configuration](/configuration/)
- Check out the [deployment guide](/deployment/)
