# Component Parity: Rimelight UI vs Nuxt UI

This document compares **Rimelight UI** (Astro) and **Nuxt UI v3** (Vue) component libraries.

**Note: We are migrating away from Nuxt UI entirely. Native Rimelight UI Astro components are now the primary focus.**

## Component Comparison

Core components have been aligned to match Nuxt UI slots and styling while maintaining the Rimelight factory pattern.

| Rimelight UI (Astro)                       | Nuxt UI (Vue)       | Status                   | Notes                                              |
| :----------------------------------------- | :------------------ | :----------------------- | :------------------------------------------------- |
| **Basic**                                  |                     |                          |                                                    |
| `RLAButton`                                | `Button`            | Match                    | Aligned slots (`leading`, `trailing`, `avatar`).   |
| `RLAIcon`                                  | `Icon`              | Match                    |                                                    |
| `RLABadge`                                 | `Badge`             | Match                    | Aligned slots.                                     |
| `RLAAvatar`                                | `Avatar`            | Match                    | Aligned badge/chip support.                        |
| `RLAAvatarGroup`                           | `AvatarGroup`       | Match                    |                                                    |
| `RLAKbd`                                   | `Kbd`               | Match                    | Aligned styling.                                   |
| `RLAChip`                                  | `Chip`              | Match                    | Aligned slots.                                     |
| `RLASeparator`                             | `Separator`         | Match                    | Added `label`, `icon`, `avatar` support.           |
| `RLASkeleton`                              | `Skeleton`          | Match                    | Aligned styling.                                   |
| `RLALink`                                  | `Link` / `LinkBase` | Match                    |                                                    |
| **Forms**                                  |                     |                          |                                                    |
| `RLAInput`                                 | `Input`             | Match                    |                                                    |
| `RLATextarea`                              | `Textarea`          | Match                    |                                                    |
| `RLACheckbox`                              | `Checkbox`          | Match                    |                                                    |
| `RLARadioGroup`                            | `RadioGroup`        | Match                    |                                                    |
| `RLASelect`                                | `Select`            | Match                    |                                                    |
| `RLASwitch`                                | `Switch`            | Match                    |                                                    |
| `RLASlider`                                | `Slider`            | Match                    |                                                    |
| `RLAInputNumber`                           | `InputNumber`       | Match                    |                                                    |
| `RLAInputDate`                             | `InputDate`         | Match                    |                                                    |
| `RLAInputTime`                             | `InputTime`         | Match                    |                                                    |
| `RLAPinInput`                              | `PinInput`          | Match                    | Previously `RLAInputPin`.                          |
| `RLAInputTags`                             | `InputTags`         | Match                    |                                                    |
| `RLAFileUpload`                            | `FileUpload`        | Match                    |                                                    |
| `RLAColorPicker`                           | `ColorPicker`       | Match                    |                                                    |
| `RLAFormField`                             | `FormField`         | Match                    |                                                    |
| `RLAFieldGroup`                            | `FieldGroup`        | Match                    |                                                    |
| `RLAForm`                                  | `Form`              | Match                    |                                                    |
| **Data**                                   |                     |                          |                                                    |
| `RLATable`                                 | `Table`             | Match                    |                                                    |
| `RLAPagination`                            | `Pagination`        | Match                    |                                                    |
| `RLAProgress`                              | `Progress`          | Match                    |                                                    |
| `RLAMeter`                                 | `Meter`             | Match (Nuxt v3 missing?) | Rimelight has dedicated Meter.                     |
| `RLATimeline`                              | `Timeline`          | Match                    |                                                    |
| `RLATree`                                  | `Tree`              | Match                    |                                                    |
| `RLAChart`                                 | -                   | **Extra in RLA**         | Integrated chart support.                          |
| **Navigation**                             |                     |                          |                                                    |
| `RLABreadcrumb`                            | `Breadcrumb`        | Match                    |                                                    |
| `RLATabs`                                  | `Tabs`              | Match                    |                                                    |
| `RLANavigationMenu`                        | `NavigationMenu`    | Match                    |                                                    |
| `RLACommandPalette`                        | `CommandPalette`    | Match                    |                                                    |
| `RLADropdownMenu`                          | `DropdownMenu`      | Match                    |                                                    |
| `RLAContextMenu`                           | `ContextMenu`       | Match                    |                                                    |
| `RLAPagination`                            | `Pagination`        | Match                    |                                                    |
| `RLAStepper`                               | `Stepper`           | Match                    |                                                    |
| `RLATableOfContents`                       | `PageAnchors`       | Match                    |                                                    |
| **Overlay**                                |                     |                          |                                                    |
| `RLAModal`                                 | `Modal`             | Match                    |                                                    |
| `RLADrawer`                                | `Drawer`            | Match                    |                                                    |
| `RLASlideover`                             | `Slideover`         | Match                    |                                                    |
| `RLAPopover`                               | `Popover`           | Match                    |                                                    |
| `RLATooltip`                               | `Tooltip`           | Match                    |                                                    |
| `RLAToast`                                 | `Toast`             | Match                    |                                                    |
| **Layout / Dashboard**                     |                     |                          |                                                    |
| `RLAContainer`                             | `Container`         | Match                    |                                                    |
| `RLADashboardPanel`                        | `DashboardPanel`    | Match                    |                                                    |
| `RLADashboardNavbar`                       | `DashboardNavbar`   | Match                    |                                                    |
| `RLADashboardSidebar`                      | `DashboardSidebar`  | Match                    |                                                    |
| `RLADashboardToolbar`                      | `DashboardToolbar`  | Match                    |                                                    |
| `RLAMain`                                  | `Main`              | Match                    |                                                    |
| `RLAHeader`                                | `Header`            | Match                    |                                                    |
| `RLAFooter`                                | `Footer`            | Match                    |                                                    |
| `RLAPage`                                  | `Page`              | Match                    |                                                    |
| `RLAPageHeader`                            | `PageHeader`        | Match                    |                                                    |
| `RLAPageBody`                              | `PageBody`          | Match                    |                                                    |
| `RLAPageSection`                           | `PageSection`       | Match                    |                                                    |
| `RLAPost`                                  | `BlogPost`          | Match                    | Native Astro alternative to Nuxt UI Pro BlogPost.  |
| `RLAPosts`                                 | `BlogPosts`         | Match                    | Native Astro alternative to Nuxt UI Pro BlogPosts. |
| **Rimelight Extras (Not in Nuxt UI Core)** |                     |                          |                                                    |
| `RLA3dHover`                               | -                   | Extra                    |                                                    |
| `RLABrowserMockup`                         | -                   | Extra                    |                                                    |
| `RLAPhoneMockup`                           | -                   | Extra                    |                                                    |
| `RLAWindowMockup`                          | -                   | Extra                    |                                                    |
| `RLAChat` (Full Suite)                     | `Chat` (Partial)    | Unified in RLA           | Rimelight has a very deep Chat integration.        |
| `RLAChangelog`                             | `ChangelogVersions` | Match                    |                                                    |
| `RLACompare`                               | -                   | Extra                    | Image comparison.                                  |
| `RLAKnob`                                  | -                   | Extra                    |                                                    |
| `RLAMarquee`                               | `Marquee`           | Match                    |                                                    |
| `RLAQrCode`                                | -                   | Extra                    |                                                    |
| `RLARating`                                | -                   | Extra                    |                                                    |
| `RLASpeedDial`                             | -                   | Extra                    |                                                    |
| `RLASpoiler`                               | -                   | Extra                    |                                                    |
| `RLAWatermark`                             | -                   | Extra                    |                                                    |

## Theme Pattern Comparison

### Rimelight UI (`css-variants`)

Rimelight uses a structured object approach via `defineTheme`.

```typescript
// button.theme.ts
export const createButtonTheme = (colors: string[] = defaultColors) =>
  defineTheme({
    slots: ["root", "label", "leadingIcon", "trailingIcon"],
    base: {
      root: "...",
      label: "..."
    },
    variants: {
      variant: { solid: { root: "..." } },
      color: { primary: { root: "..." } },
      size: { md: { root: "..." } }
    },
    compoundVariants: [{ variant: "solid", color: "primary", classNames: { root: "..." } }]
  })
```

### Nuxt UI (`tailwind-variants` style)

Nuxt UI themes are also structured but tend to use a function that receives global options.

```typescript
// Nuxt UI Button theme
export default (options) => ({
  slots: {
    base: "...",
    label: "..."
    // ...
  },
  variants: {
    color: {
      primary: ""
      // ...
    },
    variant: {
      solid: ""
    }
  },
  compoundVariants: [{ color: "primary", variant: "solid", class: "..." }]
})
```

### Key Differences

1.  **Slot Reference**: Rimelight uses `classNames: { slot: "..." }` in compound variants, whereas Nuxt UI often uses `class: "..."` (if single slot) or `class: { slot: "..." }`.
2.  **Factory Argument**: Rimelight factories accept `colors: string[]`. Nuxt UI factories accept a full `options` object (including theme config, transitions, etc.).
3.  **Variant Definition**: Rimelight explicitly maps variants to slots even in the main `variants` object: `variant: { solid: { root: "..." } }`. Nuxt UI sometimes uses a flatter structure if a variant only applies to the base slot.

## Props Comparison

### Button

| Prop         | Rimelight (`RLAButton`)                  | Nuxt UI (`Button`)                       | Notes                                      |
| :----------- | :--------------------------------------- | :--------------------------------------- | :----------------------------------------- |
| Label        | `label: string`                          | `label: string`                          | Match                                      |
| Color        | `color: string`                          | `color: string`                          | Match                                      |
| Variant      | `variant: string`                        | `variant: string`                        | Match                                      |
| Size         | `size: string`                           | `size: string`                           | Match                                      |
| Loading      | `loading: boolean`                       | `loading: boolean`                       | Match                                      |
| Loading Auto | `loadingAuto: boolean`                   | `loadingAuto: boolean`                   | Match                                      |
| Icons        | `leadingIcon`, `trailingIcon`            | `icon`, `leadingIcon`, `trailingIcon`    | Nuxt UI `icon` is shorthand for `leading`. |
| Avatar       | `avatar`, `leadingAvatar`                | `avatar`, `leadingAvatar`                | Added to RLA for parity.                   |
| Active State | `active`, `activeVariant`, `activeColor` | `active`, `activeVariant`, `activeColor` | Match                                      |
| Block        | `block`                                  | `block`                                  | Match                                      |
| Square       | `square`                                 | `square`                                 | Match                                      |

### Avatar

| Prop         | Rimelight (`RLAAvatar`)                | Nuxt UI (`Avatar`)                      | Notes                                          |
| :----------- | :------------------------------------- | :-------------------------------------- | :--------------------------------------------- |
| Image Source | `src`                                  | `src`                                   | Match                                          |
| Alt Text     | `alt`                                  | `alt`                                   | Match                                          |
| Fallback     | `fallback`                             | `text` / `icon`                         | Rimelight uses `fallback` slot/prop.           |
| Size         | `size`                                 | `size`                                  | Match                                          |
| Badge        | `badge`, `badgeColor`, `badgePosition` | `chipColor`, `chipText`, `chipPosition` | Expanded in RLA to match Nuxt UI "Chip" logic. |

## Recommendations for Standardization

1.  **Naming Alignment**:
    - [x] Rename `RLAInputPin` to `RLAPinInput`.
    - [x] Consolidate `RLAToc` and `RLATableOfContents` to `RLATableOfContents`.
2.  **Prop Enhancements**:
    - [x] Add `loadingAuto` support to `RLAButton`.
    - [x] Expand `RLAAvatar` badge support.
    - [x] Align core component slots (Button, Alert, Separator).
3.  **Theme Structure**:
    - [x] Standardize all themes to the Factory Pattern (`createTheme`).
    - [x] Ensure `css-variants` usage remains consistent across 90+ components.

## Playground & Verification

All components are available for verification in the playground:

- **Location**: `packages/playground/src/pages/[locale]/components/`
- **Total Components**: 148+
- **Index**: A categorized grid provides easy access to all component showcases.
