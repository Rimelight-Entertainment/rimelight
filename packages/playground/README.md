# Rimelight UI Playground

Minimal Astro project for testing components in `@rimelight/ui`.

## Usage

1. Install dependencies from the root:

   ```bash
   pnpm install
   ```

2. Start the dev server:
   ```bash
   pnpm --filter @rimelight/playground dev
   ```

## Development

Components from `@rimelight/ui` can be imported directly:

```astro
---
import Button from '@rimelight/ui/components/button/Button.astro';
---

<Button variant="primary">Hello World</Button>
```
