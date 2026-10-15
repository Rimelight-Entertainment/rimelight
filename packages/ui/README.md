# Rimelight UI (@rimelight/ui)

[![Built with Solid](https://img.shields.io/badge/SolidJS-2c4f7c?style=for-the-badge&logo=solid&logoColor=white)](https://www.solidjs.com) &nbsp;
[![PLAYGROUND](https://img.shields.io/badge/PLAYGROUND-A682FF?style=for-the-badge&logo=astro&logoColor=white)](https://playground.rimelight.com/ui) &nbsp;
[![DOCUMENTATION](https://img.shields.io/badge/DOCUMENTATION-A682FF?style=for-the-badge&logo=astro&logoColor=white)](https://rimelight.com/company/docs/packages/rimelight-ui/) &nbsp;

[![NPM Version](https://img.shields.io/npm/v/@rimelight/ui?style=for-the-badge&logo=npm&logoColor=white&color=A682FF)](https://www.npmjs.com/package/@rimelight/ui) &nbsp;
[![NPM Downloads](https://img.shields.io/npm/dt/@rimelight/ui?style=for-the-badge&color=A682FF&logo=npm&logoColor=white)](https://www.npmjs.com/package/@rimelight/ui) &nbsp;
[![View on npmx](https://img.shields.io/badge/VIEW%20ON%20NPMX-A682FF?style=for-the-badge&logo=npm&logoColor=white)](https://npmx.dev/package/@rimelight/ui) &nbsp;
[![pkg.pr.new](https://pkg.pr.new/badge/Rimelight-Entertainment/rimelight)](https://pkg.pr.new/~/Rimelight-Entertainment/rimelight) &nbsp;

Rimelight UI is a comprehensive, 100% SolidJS 2.0 component library used and maintained by [Rimelight Entertainment](https://rimelight.com).
It offers a full suite of accessible, fine-grained reactive, and highly performant components built exclusively for [SolidJS](https://www.solidjs.com) 2.0, and is available as a free and open source project for anyone to use.

## Features

- **Pure SolidJS 2.0**: Native fine-grained reactivity and signal primitives with zero virtual DOM overhead.
- **SSR & Island Ready**: Server-rendered and client hydrated seamlessly across modern Vite, SolidStart, and full-stack runtimes.
- **Accessible**: All components are WAI-ARIA compliant and include keyboard navigation, focus management, and screen reader support.
- **Customizable**: Create your own design system by overriding styles and variants globally or per instance via UnoCSS.
- **Performant**: Fully type-safe, memoized theme classes, modern and lean dependencies, and blazing fast.

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

```tsx
import { RLButton } from "@rimelight/ui/components";

export default function MyComponent() {
  return <RLButton label="Click Me" color="primary" variant="solid" />;
}
```

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
