# `@rimelight/cms`

Enterprise Content Management, Block Rendering, Page Properties, Draft Checkout Locks, and Wiki Engine for the Rimelight Ecosystem.

## Features

- **PostgreSQL Infrastructure (Drizzle ORM `pg-core`)**: Managed schema with JSONB support, relational page versions, review comments, multi-approver threshold tracking, Perforce-style draft checkout locks, and locale-aware search indexing (`tsvector` + GIN).
- **Astro SSR Zero-JS Reader Engine**: Server-rendered pure Astro components with server-side stripping of unauthorized blocks before HTML rendering.
- **Client Split-Pane Editor Suite**: Custom Elements split-pane editor with live preview, local undo/redo stack (`Ctrl+Z`), debounced autosave status indicator, `sortablejs` block reordering, and pure vanilla TypeScript `contenteditable` inline AST controller.
- **Perforce-Style Draft Checkout Locking**: Authors explicitly check out drafts, holding exclusive edit locks with automated heartbeat keepalives.
- **Role-Locked Templates & Propagation Engine**: Structural template locks (`isTemplated: true`), property-level locks (`templatedProps`), and background worker positional template update propagation.
- **`better-auth` Dual-Mode Security & Server Diff Guards**: Reader payload stripping and server API tree diff validators preventing unauthorized block deletions or property mutations.
- **Multi-Tier Edge Cache Invalidation**: Cloudflare CDN Cache-Tag and URL purging adapters.

## Usage

```typescript
import { pages, pageDrafts, filterBlocksForReader } from "@rimelight/cms"
```
