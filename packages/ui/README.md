# Rimelight UI (@rimelight/ui)

[![Built with Astro](https://astro.badg.es/v2/built-with-astro/small.svg)](https://astro.build) &nbsp;

[![PLAYGROUND](https://img.shields.io/badge/PLAYGROUND-A682FF?style=for-the-badge&logo=astro&logoColor=white)](https://playground.rimelight.com/ui) &nbsp;
[![DOCUMENTATION](https://img.shields.io/badge/DOCUMENTATION-A682FF?style=for-the-badge&logo=astro&logoColor=white)](https://rimelight.com/company/docs/packages/rimelight-ui/) &nbsp;

[![NPM Version](https://img.shields.io/npm/v/@rimelight/ui?style=for-the-badge&logo=npm&logoColor=white&color=A682FF)](https://www.npmjs.com/package/@rimelight/ui) &nbsp;
[![NPM Downloads](https://img.shields.io/npm/dt/@rimelight/ui?style=for-the-badge&color=A682FF&logo=npm&logoColor=white)](https://www.npmjs.com/package/@rimelight/ui) &nbsp;
[![View on npmx](https://img.shields.io/badge/VIEW%20ON%20NPMX-A682FF?style=for-the-badge&logo=npm&logoColor=white)](https://npmx.dev/package/@rimelight/ui) &nbsp;
[![pkg.pr.new](https://pkg.pr.new/badge/Rimelight-Entertainment/rimelight)](https://pkg.pr.new/~/Rimelight-Entertainment/rimelight) &nbsp;

Rimelight UI is a comprehensive component library for [Astro](https://astro.build) websites used and maintained by [Rimelight Entertainment](https://rimelight.com).
It offers a suite of accessible and highly performant components as [Astro Components](https://docs.astro.build/basics/astro-components/) and [Vue Components](https://vuejs.org), and is available as a free and open source project for any to use.

## Features

- **Multiple Frameworks**: Astro, Vue, and more with a unified usage pattern - use what suits your project best.
- **Intuitive**: Simple APIs, comprehensive documentation, and convenient integrations.
- **Accessible**: All components are WAI-ARIA compliant and include keyboard navigation, focus management, and
  screen reader support.
- **Customizable**: Create your own design system by overriding styles and variants globally or per instance.
- **Performant**: Fully type-safe, SEO-friendly, modern and lean dependencies, and blazing fast.

For a complete list of available components, refer to the [documentation](https://rimelight.com/company/docs/packages/rimelight-ui/).

## Installation

To use Rimelight UI in an Astro project, you need to install the package and add the integration.

1. Install the package into your project:

```bash
# vp
vp install @rimelight/ui

# npm
npm install @rimelight/ui

# pnpm
pnpm add @rimelight/ui

# yarn
yarn add @rimelight/ui

# deno
deno add npm:@rimelight/ui

# bun
bun add @rimelight/ui
```

2. Add the Rimelight UI Astro integration to your Astro configuration:

```typescript
// astro.config.ts
import { ui } from "@rimelight/ui"
import { defineConfig } from "astro/config"

export default defineConfig({
  integrations: [
    ui({
      // Optional: Provide global UI overrides
      components: {
        themes: {
          button: {
            defaultVariants: { variant: "primary" }
          }
        }
      }
    })
  ]
})
```

## Usage

### Astro Components

```astro
---
// component.astro
import RLAButton from "@rimelight/ui/components/button/RLAButton.astro";
---

<RLAButton label="Click Me" />
```

### Vue Components

```vue
<!-- component.vue -->
<script setup lang="ts">
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"
</script>

<template>
  <RLVButton label="Click Me" />
</template>
```

For mixed usage please refer to the [Astro documentation on using front-end frameworks](https://docs.astro.build/en/guides/framework-components/).

## Frequently Asked Questions

<details>
  <summary><b>Is Rimelight UI free to use?</b></summary>
    Yes. Rimelight UI is a completely free and open source package under the <a href="./LICENSE">MIT License</a>.
</details>

<details>
  <summary><b>Can I use Rimelight UI without Astro?</b></summary>
    For the time being, no. The library is strictly distributed as an Astro integration. However, in theory, it could be modularized enough to be usable as a Vite plugin, and we are open to contributions on this topic.
</details>

<details>
  <summary><b>Are other front-end frameworks supported?</b></summary>
     For the time being, no. The library currently only offers Astro and Vue components, but in theory could support other front-end frameworks, and we welcome community contributions to expand this.
</details>

<details>
  <summary><b>Is Rimelight UI customizable?</b></summary>
    Yes. All components can have their styles overridden per slot and per variant, either globally via your <code>astro.config.ts</code> configuration or locally on an individual instance using the <code>ui</code> prop.
</details>

<details>
  <summary><b>Is Rimelight UI accessible?</b></summary> 
    Yes. All components provide automatic ARIA attributes, keyboard navigation, focus management, and screen reader support out of the box.
</details>

## Useful Links

- [Starter Project](https://starter.rimelight.com)
- [Playground](https://playground.rimelight.com/ui)
- [Documentation](https://rimelight.com/company/docs/packages/rimelight-ui/)
- [Changelog](https://rimelight.com/company/docs/packages/rimelight-ui/changelog/)

## Contributing

We welcome contributions to this project and its documentation. If you are interested in contributing, please refer to our [contribution guidelines](https://rimelight.com/company/docs/contributing/).

If you would like to financially support this project, please consider [sponsoring us](https://rimelight.com/company/docs/contributing/sponsoring/).

## Support

If you have any questions or need assistance, please feel free to reach out to us at [support@rimelight.com](mailto:support@rimelight.com).

## License

MIT
