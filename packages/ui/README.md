# @rimelight/ui

[![Built with Solid](https://img.shields.io/badge/SolidJS-2c4f7c?style=for-the-badge&logo=solid&logoColor=white)](https://www.solidjs.com) &nbsp;
[![PLAYGROUND](https://img.shields.io/badge/PLAYGROUND-A682FF?style=for-the-badge&logoColor=white)](https://playground.rimelight.com/ui) &nbsp;
[![DOCUMENTATION](https://img.shields.io/badge/DOCUMENTATION-A682FF?style=for-the-badge&logoColor=white)](https://rimelight.com/company/docs/packages/rimelight-ui/) &nbsp;

[![NPM Version](https://img.shields.io/npm/v/@rimelight/ui?style=for-the-badge&logo=npm&logoColor=white&color=A682FF)](https://www.npmjs.com/package/@rimelight/ui) &nbsp;
[![NPM Downloads](https://img.shields.io/npm/dt/@rimelight/ui?style=for-the-badge&color=A682FF&logo=npm&logoColor=white)](https://www.npmjs.com/package/@rimelight/ui) &nbsp;
[![View on npmx](https://img.shields.io/badge/VIEW%20ON%20NPMX-A682FF?style=for-the-badge&logo=npm&logoColor=white)](https://npmx.dev/package/@rimelight/ui) &nbsp;
[![pkg.pr.new](https://pkg.pr.new/badge/Rimelight-Entertainment/rimelight)](https://pkg.pr.new/~/Rimelight-Entertainment/rimelight) &nbsp;

Rimelight UI is a component library for SolidJS 2.0, used and maintained by [Rimelight Entertainment](https://rimelight.com). It provides accessible, fine-grained reactive components and is free and open source for anyone to use.

## Features

- **Pure SolidJS 2.0**: native fine-grained reactivity and signal primitives, with no virtual DOM.
- **SSR and islands**: server-rendered and hydrated across Vite, SolidStart, and full-stack runtimes.
- **Accessible**: components are WAI-ARIA compliant, with keyboard navigation, focus management, and screen reader support.
- **Customizable**: override styles and variants globally or per instance through UnoCSS.
- **Typed and lean**: fully type-safe, memoized theme classes, and few dependencies.

For the full component list, see the [documentation](https://rimelight.com/company/docs/packages/rimelight-ui/).

## Installation

```bash
# vp
vp install @rimelight/ui solid-js

# pnpm
pnpm add @rimelight/ui solid-js

# npm
npm install @rimelight/ui solid-js
```

### Peer dependencies

| Package           | Version           |
| ----------------- | ----------------- |
| `@solidjs/router` | `>=2.0.0-next.42` |
| `@solidjs/web`    | `>=2.0.0-rc.18`   |
| `solid-js`        | `>=2.0.0-rc.18`   |
| `vite-plus`       | `^1.0.0`          |

## Usage

Add the Vite plugin. It configures UnoCSS and, optionally, your logos:

```ts
// vite.config.ts
import { ui } from "@rimelight/ui/plugin";

export default defineConfig({
  plugins: [ui()],
});
```

Then import components:

```tsx
import { RLButton } from "@rimelight/ui/components";

export default function MyComponent() {
  return <RLButton label="Click Me" color="primary" variant="solid" />;
}
```

## Exports

| Import                     | Purpose                        |
| -------------------------- | ------------------------------ |
| `@rimelight/ui`            | All components                 |
| `@rimelight/ui/components` | Component exports              |
| `@rimelight/ui/plugin`     | Vite plugin (UnoCSS and logos) |
| `@rimelight/ui/client`     | Client-side entry              |
| `@rimelight/ui/preset`     | UnoCSS preset                  |
| `@rimelight/ui/resolver`   | Component resolver             |
| `@rimelight/ui/runtime`    | Runtime configuration          |
| `@rimelight/ui/shortcuts`  | UnoCSS shortcuts               |
| `@rimelight/ui/theme`      | Theme definitions              |
| `@rimelight/ui/types`      | Public type definitions        |
| `@rimelight/ui/icons`      | Icon helpers                   |
| `@rimelight/ui/fonts`      | Font configuration             |

## Frequently Asked Questions

<details>
  <summary><b>Is Rimelight UI free to use?</b></summary>
    Yes. Rimelight UI is a completely free and open source package under the <a href="./LICENSE">MIT License</a>.
</details>

<details>
  <summary><b>Which version of SolidJS is supported?</b></summary>
    Rimelight UI is built exclusively for SolidJS 2.0+ with modern reactivity primitives and signals.
</details>

<details>
  <summary><b>Is Rimelight UI customizable?</b></summary>
    Yes. All components can have their styles overridden per slot and per variant, either globally via your UI configuration or locally on an individual instance using the <code>ui</code> prop.
</details>

<details>
  <summary><b>Is Rimelight UI accessible?</b></summary>
    Yes. All components provide automatic ARIA attributes, keyboard navigation, focus management, and screen reader support out of the box.
</details>

## Useful Links

- [Starter project](https://starter.rimelight.com)
- [Playground](https://playground.rimelight.com/ui)
- [Documentation](https://rimelight.com/company/docs/packages/rimelight-ui/)
- [Changelog](https://rimelight.com/company/docs/packages/rimelight-ui/changelog/)

## Development

This package lives in the [Rimelight monorepo](../../README.md). From the monorepo root:

```sh
pnpm install
pnpm --filter @rimelight/ui test
pnpm --filter @rimelight/ui build
pnpm --filter @rimelight/ui check
```

## Contributing

We welcome contributions to this project and its documentation. See our [contribution guidelines](https://rimelight.com/company/docs/contributing/).

## Support

For questions or help, contact [support@rimelight.com](mailto:support@rimelight.com).

## License

MIT. See [LICENSE](../../LICENSE).
