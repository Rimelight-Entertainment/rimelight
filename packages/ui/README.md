# Rimelight UI (@rimelight/ui)

[![Built with Solid](https://img.shields.io/badge/SolidJS-2c4f7c?style=for-the-badge&logo=solid&logoColor=white)](https://www.solidjs.com) &nbsp;
[![PLAYGROUND](https://img.shields.io/badge/PLAYGROUND-A682FF?style=for-the-badge&logo=astro&logoColor=white)](https://playground.rimelight.com/ui) &nbsp;
[![DOCUMENTATION](https://img.shields.io/badge/DOCUMENTATION-A682FF?style=for-the-badge&logo=astro&logoColor=white)](https://rimelight.com/company/docs/packages/rimelight-ui/) &nbsp;

[![NPM Version](https://img.shields.io/npm/v/@rimelight/ui?style=for-the-badge&logo=npm&logoColor=white&color=A682FF)](https://www.npmjs.com/package/@rimelight/ui) &nbsp;
[![NPM Downloads](https://img.shields.io/npm/dt/@rimelight/ui?style=for-the-badge&color=A682FF&logo=npm&logoColor=white)](https://www.npmjs.com/package/@rimelight/ui) &nbsp;
[![View on npmx](https://img.shields.io/badge/VIEW%20ON%20NPMX-A682FF?style=for-the-badge&logo=npm&logoColor=white)](https://npmx.dev/package/@rimelight/ui) &nbsp;
[![pkg.pr.new](https://pkg.pr.new/badge/Rimelight-Entertainment/rimelight)](https://pkg.pr.new/~/Rimelight-Entertainment/rimelight) &nbsp;

Rimelight UI is a comprehensive SolidJS component library used and maintained by [Rimelight Entertainment](https://rimelight.com).
It offers a full suite of accessible, reactive, and highly performant components for [SolidJS](https://www.solidjs.com) and [Astro](https://astro.build) (via `@astrojs/solid-js` islands and SSR), and is available as a free and open source project for anyone to use.

## Features

- **Pure SolidJS**: Reactive, zero-virtual-DOM performance with fine-grained reactivity.
- **Astro Island & SSR Ready**: Seamlessly server-rendered and hydrated in Astro applications.
- **Accessible**: All components are WAI-ARIA compliant and include keyboard navigation, focus management, and screen reader support.
- **Customizable**: Create your own design system by overriding styles and variants globally or per instance via UnoCSS.
- **Performant**: Fully type-safe, modern and lean dependencies, and blazing fast.

For a complete list of available components, refer to the [documentation](https://rimelight.com/company/docs/packages/rimelight-ui/).

## Installation

```bash
# vp
vp install @rimelight/ui solid-js

# pnpm
pnpm add @rimelight/ui solid-js

# npm
npm install @rimelight/ui solid-js
```

## Usage

### In SolidJS

```tsx
import { RLButton } from "@rimelight/ui/components";

export default function MyComponent() {
  return <RLButton label="Click Me" color="primary" variant="solid" />;
}
```

### In Astro (as Islands or Static SSR)

```astro
---
import { RLButton } from "@rimelight/ui/components"
---

<!-- Static SSR -->
<RLButton label="Static Action" color="primary" />

<!-- Interactive Island -->
<RLButton client:load label="Interactive Island" color="secondary" />
```

## Frequently Asked Questions

<details>
  <summary><b>Is Rimelight UI free to use?</b></summary>
    Yes. Rimelight UI is a completely free and open source package under the <a href="./LICENSE">MIT License</a>.
</details>

<details>
  <summary><b>Can I use Rimelight UI without Astro?</b></summary>
    Yes! Rimelight UI is a standard SolidJS component library and can be used in any SolidJS, SolidStart, or Vite project.
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

- [Starter Project](https://starter.rimelight.com)
- [Playground](https://playground.rimelight.com/ui)
- [Documentation](https://rimelight.com/company/docs/packages/rimelight-ui/)
- [Changelog](https://rimelight.com/company/docs/packages/rimelight-ui/changelog/)

## Contributing

We welcome contributions to this project and its documentation. If you are interested in contributing, please refer to our [contribution guidelines](https://rimelight.com/company/docs/contributing/).

## Support

If you have any questions or need assistance, please feel free to reach out to us at [support@rimelight.com](mailto:support@rimelight.com).

## License

MIT
