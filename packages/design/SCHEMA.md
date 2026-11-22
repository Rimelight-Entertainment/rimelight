# `tokens.json` schema (ST1.2)

`tokens.json` is the one source of truth for the Rimelight design language (decision D3). It follows the
[DTCG format](https://tr.designtokens.org/format/): every token is an object with `$type` and `$value`, and groups
nest. Rimelight-specific data sits under `$extensions.rimelight`.

`generate.ts` reads it and writes these outputs. Never edit the outputs by hand:

| Output                   | Consumer                                         |
| ------------------------ | ------------------------------------------------ |
| `generated/tokens.css`   | `@rimelight/ui` (CSS variables, `light-dark()`)  |
| `generated/tokens.json`  | `@rimelight/ui` preset (resolved values as data) |
| `crate/ui/tokens.slint`  | Slint apps (`Tokens` global, `ThemeChoice`)      |
| `crate/src/generated.rs` | Rust: constants and the role table               |
| `generated/contrast.md`  | Human review: every checked pair with its ratio  |

Run `node generate.ts` to regenerate. `node generate.ts --check` exits 1 when an output differs from what the source
would produce, or when a contrast check fails.

## Top-level groups

```jsonc
{
  "shades": { ... },      // the shade curve shared by every ramp
  "ramp": { ... },        // one entry per palette (D5: ten palettes)
  "color": { ... },       // roles: what a colour is for, per theme
  "space": { ... },       // dimension tokens
  "radius": { ... },
  "size": { ... },        // control heights per size, component sizes, breakpoint
  "icon": { ... },
  "font": { ... },        // fontFamily tokens
  "type": { ... },        // typography composites
  "motion": { ... },      // duration and cubicBezier tokens
  "shadow": { ... },
  "focus": { ... },
  "component": { ... },   // component tokens (toolbar height and so on)
  "extension": { ... },   // named extensions: brand.sidebar, media.stage, file-kind, zoom
  "$extensions": { "rimelight": { "contrast": { ... } } }
}
```

### `shades`

Shade names are `"50"` to `"950"`. Each shade is `{ "$type": "rimelight.shade", "$value": [lightL, lightChromaFactor, darkL, darkChromaFactor] }`. The
starting values are the web's `SHADES` table in `packages/ui/src/preset.ts`.

### `ramp.<palette>`

```json
"primary": {
  "$type": "rimelight.ramp",
  "$value": { "chroma": 0.21, "hue": 258 },
  "$extensions": { "rimelight": { "pin": { "500": { "light": "#0D7FFF", "dark": "#4DA0FF" } } } }
}
```

- Shade `s` in theme `t` is `oklch(L, factor * chroma, hue)`, using the shade curve. When that colour falls outside
  sRGB, the generator **gamut-maps** it by lowering the chroma at constant L and hue (binary search, 0.0001 steps)
  until it fits.
- A `pin` replaces a computed shade with a fixed sRGB value, for one theme or both.
- The palettes are: neutral, primary, secondary, info, success, warning, error, commentary, ideation, source.

### `color` (roles)

Roles are grouped: `surface`, `text`, `border`, `accent`, `focus`, `status`, `selection`, `scrim`.

```json
"surface": {
  "raised": { "$type": "color", "$value": { "light": "{ramp.neutral.0}", "dark": "#1B1E24" } }
}
```

- `$value` is always `{ "light": X, "dark": X }`. Each `X` is either a hex string (`#RRGGBB` or `#RRGGBBAA`) or a
  reference in braces: `{ramp.<palette>.<shade>}`, or `{color.<group>.<role>}` for another role.
- Shade `"0"` means pure white and `"1000"` pure black, for every ramp.
- References resolve after gamut mapping and pins.
- Per-palette roles for component colours (D5) are generated, not written: for each palette `p` the generator emits
  `p.solid` (600), `p.solid-hover` (700), `p.text` (600 light, 700 dark: one step lighter so it reaches 4.5:1 on dark surfaces), `p.soft` (100) and `p.border` (500). The same
  shade name is used in both themes, because the shade curve already flips lightness in dark mode (dark 600 is
  lighter than dark 500).
- A role written in `color.palette.<p>.<name>` overrides the generated value. This is where audit Q5's fixed dark
  overrides go when a contrast check fails.

### Dimensions, durations, easings, shadows

- `{ "$type": "dimension", "$value": "34px" }`: pixels only (logical pixels).
- `{ "$type": "duration", "$value": "120ms" }`.
- `{ "$type": "cubicBezier", "$value": [0.2, 0, 0, 1] }`.
- `{ "$type": "shadow", "$value": { "offsetX": "0px", "offsetY": "8px", "blur": "24px", "spread": "0px", "color": { "light": "#00000024", "dark": "#0000008C" } } }`.
- `{ "$type": "fontFamily", "$value": ["Noto Sans", "sans-serif"] }`.
- `{ "$type": "typography", "$value": { "fontFamily": "{font.sans}", "fontSize": "14px", "lineHeight": "20px", "fontWeight": 400 } }`.

### `size.control`

Keys `xs`, `sm`, `md`, `lg`, `xl`, with values 22, 28, 34, 40, 46 px (audit Q9 and Q10). `size.breakpoint.phone` is
640 px (audit Q19).

### Contrast checks: `$extensions.rimelight.contrast`

```json
"contrast": {
  "pairs": [
    { "fg": "color.text.primary", "bg": "color.surface.base", "min": 4.5 },
    { "fg": "color.border.strong", "bg": "color.surface.raised", "min": 3.0 }
  ],
  "paletteChecks": true,
  "exempt": [
    { "role": "color.text.faint", "reason": "Decorative or disabled text only" }
  ]
}
```

- Every pair is checked in both themes with the WCAG 2 relative-luminance ratio. When the foreground has alpha, it is
  composited over the background first.
- With `paletteChecks: true`, the generator also checks for each palette: `text.on-accent` on `p.solid` (4.5),
  `p.text` on `surface.base` and `surface.raised` (4.5), `p.solid` on `surface.base` (3.0), and `p.text` on `p.soft`
  (4.5).
- A pair whose foreground is exempt is reported but does not fail the check.

## Output naming

- **CSS:** `--rl-<path joined by ->`, for example `--rl-color-surface-raised`, `--rl-ramp-primary-500`,
  `--rl-size-control-md`. Colours are written as `light-dark(<light>, <dark>)`. The generator also writes the
  compatibility aliases `--rl-<palette>-<shade>` that `preset.ts` uses today.
- **Slint:** one `export global Tokens`, plus `export enum ThemeChoice { light, dark, system }`.
  - `in-out property <ThemeChoice> theme`, an `out property <bool> dark` that follows `Palette.color-scheme` under
    `system`, and `in-out property <bool> reduced-motion`.
  - Property names are the path joined by `-` with the group dropped for colours: `surface-raised`, `text-muted`,
    `primary-solid`, `ramp-primary-500`.
  - Colours are written as `dark ? #… : #…`, durations as `reduced-motion ? 0ms : 120ms`, and easings as properties
    of type `easing` (`cubic-bezier(a, b, c, d)`, supported by Slint 1.18).
  - Zoom and text scale, as in Rimelight Space's `Tokens` global: `in-out property <int> zoom-percent: 100`,
    `out property <float> zoom-factor` (`zoom-percent / 100`), `in-out property <int> text-scale-percent: 100` and
    `out property <float> text-factor`. Every length token (`px`, including radii, shadow offset and blur, and type
    sizes and line heights) is written `Npx * zoom-factor`. `text-factor` is only declared here: the app's `Type` global
    reads it, so text sizes are multiplied by it outside `Tokens`.
  - Font families: Slint takes one family name, so a `fontFamily` is written as its first list entry (`"Noto Sans"`,
    `"JetBrains Mono"`). CSS keeps the full list (`"Noto Sans", sans-serif`).
  - Slint names that differ from the path. Where Space's `Tokens` already uses a clear role name, the Slint name is
    Space's, so the Space switch renames less: `button-*` and `tooltip-*` (the `component.` prefix is dropped),
    `rail-*` and `sidebar-*` (the `extension.brand.` prefix is dropped), `status-<tone>-text-on-surface`,
    `shadow-overlay` (the colour of `shadow.overlay`), `size-phone-breakpoint`, `panel-light-*`, and
    `type-<style>-family`, `-size`, `-weight`. The control and icon scales keep the design names
    (`size-control-md`, `icon-small`); `packages/design/space-rename-map.json` maps Space's names for those. The
    mapping is in `spaceName()` in `generate.ts`. Two tokens with the same Slint name fail the build. CSS names are not
    changed by any of this (`--rl-type-display-font-family` and so on).
- **Rust:** a `pub mod tokens` with `pub const` values (`Rgba { r, g, b, a }`, `f32` pixels, `u32` ms,
  `[f32; 4]` easings) and a `pub const ROLES: &[(&str, Rgba, Rgba)]` table (name, light, dark).
