---
title: Rimelight CMS
description: Overview of the Rimelight CMS — the built-in content management layer for Rimelight projects.
---

Rimelight CMS is a powerful, self-hosted Content Management System built specifically for Astro. It provides a headless API, a visual admin panel, and robust content modeling capabilities.

## Key Features

- **Schema-First Modeling** — Define your content structures using a simple TypeScript-based configuration.
- **Visual Admin Panel** — A beautiful, fast interface for managing content, assets, and users.
- **Multilingual Support** — Built-in support for translations with localized routes and fields.
- **Cloudflare D1/SQLite** — Designed to run on Cloudflare Workers with D1, or locally with SQLite.
- **Type-Safe API** — Automatically generates TypeScript types and client for your specific CMS configuration.
- **AI-Powered Features** — Intelligent assistance for SEO, alt-text generation, and translations.

## Architecture

Rimelight CMS is provided as an Astro integration (`@rimelight/cms`). When added to your project, it:

1.  **Injects Routes** — Dynamically adds admin and API routes to your project.
2.  **Generates Code** — Creates a tailored API client and database schemas based on your `cms.config.ts`.
3.  **Syncs Database** — Manages database migrations and schema pushes automatically during development.

## Next Steps

- **[Getting Started](/rimelight-cms/getting-started/)** — Set up the CMS in a new or existing project.
- **[Content Modeling](/rimelight-cms/content-modeling/)** — Learn how to define collections and fields.
- **[API Reference](/rimelight-cms/api-reference/)** — How to consume content from your frontend.
