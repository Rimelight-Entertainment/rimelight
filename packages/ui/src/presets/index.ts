import {
  presetIcons,
  presetTypography,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
  type Preset,
  type Rule
} from "unocss"
import { getAllColorNames, type ColorModeInput, type PresetOptions } from "../types"

export const COLOR_SHADES = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950"
] as const

const SHADES: Record<string, [number, number, number, number]> = {
  "50": [0.985, 0.1, 0.145, 0.2],
  "100": [0.965, 0.25, 0.2, 0.35],
  "200": [0.925, 0.45, 0.28, 0.55],
  "300": [0.85, 0.7, 0.35, 0.75],
  "400": [0.72, 0.9, 0.44, 0.9],
  "500": [0.55, 1.0, 0.53, 1.0],
  "600": [0.44, 0.9, 0.61, 0.85],
  "700": [0.35, 0.75, 0.69, 0.7],
  "800": [0.27, 0.6, 0.77, 0.55],
  "900": [0.2, 0.45, 0.86, 0.4],
  "950": [0.145, 0.3, 0.93, 0.25]
}

const PALETTES: Record<string, [number, number]> = {
  neutral: [0, 0],
  primary: [0.21, 260],
  secondary: [0.18, 70],
  info: [0.24, 260],
  success: [0.2, 150],
  warning: [0.17, 86],
  error: [0.24, 25],
  commentary: [0.29, 322],
  ideation: [0.28, 293],
  source: [0.13, 215]
}

const renderPaletteVars = (name: string, chroma: number, hue: number) =>
  [
    ...Object.entries(SHADES).map(
      ([s, [lL, cL, dL, dC]]) =>
        `  --color-${name}-${s}: light-dark(oklch(${lL} ${(cL * chroma).toFixed(3)} ${hue}), oklch(${dL} ${(dC * chroma).toFixed(3)} ${hue}));`
    ),
    `  --${name}: light-dark(oklch(0.55 ${chroma} ${hue}), oklch(0.53 ${chroma} ${hue}));`,
    `  --${name}-foreground: light-dark(oklch(1 0 0), oklch(0.145 0 0));`,
    `  --${name}-accent: var(--color-${name}-600);`
  ].join("\n")

const STATIC_BUILTIN_COLOR_CSS_VARS = Object.entries(PALETTES)
  .map(([name, [c, h]]) => renderPaletteVars(name, c, h))
  .join("\n")

const INTENT_PROPS: Record<string, [string, number]> = {
  text: ["color", 0],
  bg: ["background-color", 1],
  border: ["border-color", 2],
  ring: ["--un-ring-color", 3],
  outline: ["outline-color", 3],
  divide: ["border-color", 4]
}

const SEMANTIC_INTENTS: Record<string, readonly [string, string, string, string, string]> = {
  default: ["700", "light-dark(oklch(1 0 0), var(--color-neutral-50))", "200", "300", "100"],
  muted: ["600", "100", "200", "300", "200"],
  elevated: ["800", "light-dark(oklch(1 0 0), var(--color-neutral-100))", "200", "400", "100"],
  accented: ["900", "200", "300", "500", "300"],
  dimmed: ["500", "light-dark(var(--color-neutral-50), oklch(0 0 0 / 0.25))", "300", "400", "200"],
  toned: ["800", "700", "600", "900", "800"],
  highlighted: ["950", "200", "800", "950", "900"],
  inverted: ["50", "950", "800", "700", "900"]
}

const SPACING_TOKENS = {
  "6xs": "0.125rem",
  "5xs": "0.25rem",
  "4xs": "0.375rem",
  "3xs": "0.5rem",
  "2xs": "0.625rem",
  "xs": "0.75rem",
  "sm": "0.875rem",
  "md": "1rem",
  "lg": "1.25rem",
  "xl": "1.5rem",
  "2xl": "2rem",
  "3xl": "3rem",
  "4xl": "4rem",
  "5xl": "6rem",
  "6xl": "8rem"
}

const RADIUS_TOKENS = {
  "xs": "calc(var(--radius) - 0.375rem)",
  "sm": "calc(var(--radius) - 0.25rem)",
  "md": "calc(var(--radius) - 0.125rem)",
  "lg": "var(--radius)",
  "xl": "calc(var(--radius) + 0.25rem)",
  "2xl": "calc(var(--radius) + 0.5rem)",
  "3xl": "calc(var(--radius) + 1rem)"
}

const createPaletteScale = (palette: string) => ({
  DEFAULT: `var(--${palette})`,
  foreground: `var(--${palette}-foreground)`,
  accent: `var(--${palette}-accent)`,
  ...Object.fromEntries(COLOR_SHADES.map((s) => [s, `var(--color-${palette}-${s})`]))
})

const formatCustomColors = (colors?: Record<string, ColorModeInput>) => {
  if (!colors) return ""
  return Object.entries(colors)
    .map(([name, entry]) => {
      const mode = (
        entry && typeof entry === "object" && ("light" in entry || "dark" in entry)
          ? entry
          : { light: entry, dark: entry }
      ) as { light?: Record<string, string>; dark?: Record<string, string> }
      const l = mode.light ?? {}
      const d = mode.dark ?? {}
      const bL = l["500"] ?? Object.values(l)[0] ?? "oklch(0.55 0.15 0)"
      const bD = d["500"] ?? Object.values(d)[0] ?? bL
      return [
        ...COLOR_SHADES.map(
          (s) =>
            `  --color-${name}-${s}: light-dark(${l[s] ?? `color-mix(in oklch, ${bL}, white ${Math.max(0, 500 - +s) / 5}%)`}, ${d[s] ?? `color-mix(in oklch, ${bD}, black ${Math.max(0, +s - 500) / 4.5}%)`});`
        ),
        `  --${name}: light-dark(${bL}, ${bD});`,
        `  --${name}-foreground: light-dark(oklch(1 0 0), oklch(0.145 0 0));`,
        `  --${name}-accent: var(--color-${name}-600);`
      ].join("\n")
    })
    .join("\n")
}

const PREFLIGHT_BASE_CSS = `
:root.dark, html.dark, .dark, [data-theme="dark"] { color-scheme: dark; }
:root.light, html.light, .light, [data-theme="light"] { color-scheme: light; }

@property --rl-contrast-color { syntax: "<color>"; initial-value: white; inherits: true; }

.rl-theme-container {
  container-type: normal;
  --rl-surface-effective: var(--rl-bg, var(--background));
  --rl-contrast-color: contrast-color(var(--rl-surface-effective));
  color: var(--rl-contrast-color);
}
.rl-theme-container > *, .rl-theme-container :where(h1, h2, h3, h4, h5, h6, p, span, div, li, strong) { color: inherit; }

@container style(--rl-contrast-color: white) {
  .rl-theme-container .rl-subtext { color: oklch(from var(--rl-surface-effective) 0.88 0.04 h); }
  .rl-theme-container .rl-border-subtle { border-color: oklch(from var(--rl-surface-effective) 0.45 0.08 h / 0.6); }
}

@container style(--rl-contrast-color: black) {
  .rl-theme-container .rl-subtext { color: oklch(from var(--rl-surface-effective) 0.32 0.07 h); }
  .rl-theme-container .rl-border-subtle { border-color: oklch(from var(--rl-surface-effective) 0.75 0.05 h / 0.6); }
}

body { background-color: var(--background); color: var(--foreground); }
*, ::before, ::after { --un-ring-color: var(--primary); }
*:focus-visible, *:has(> a:focus-visible) {
  outline: 2px solid color-mix(in srgb, var(--un-ring-color, var(--primary)) 25%, transparent);
  outline-offset: 2px;
}`

const getPreflightCss = (colors?: Record<string, ColorModeInput>) => {
  const custom = formatCustomColors(colors)
  return `:root {
  color-scheme: light dark;
  --background: light-dark(oklch(1 0 0), var(--color-neutral-50));
  --foreground: var(--color-neutral-950);
  --border: var(--color-neutral-200);
  --input: var(--color-neutral-200);
  --ring: var(--color-neutral-300);
  --outline: var(--color-neutral-300);
  --radius: 0.625rem;
  --rl-header-height: 4rem;
  --rl-container: 90rem;
${STATIC_BUILTIN_COLOR_CSS_VARS}${custom ? `\n${custom}` : ""}
}
${PREFLIGHT_BASE_CSS}`
}

const customPresetRules: Rule[] = [
  [
    /^rl-color-([\w-]+)$/,
    ([, c]) => ({
      "--rl-bg": `var(--color-${c}-500)`,
      "--rl-bg-hover": `var(--color-${c}-600)`,
      "--rl-text": `var(--color-${c}-600)`,
      "--rl-ring": `var(--color-${c}-500)`,
      "--rl-border": `var(--color-${c}-500)`
    })
  ],
  [
    /^(?:rl-)?(light|dark|auto)$/,
    ([, m]) => ({
      "color-scheme": m === "auto" ? "light dark" : m,
      "color": "var(--foreground)"
    })
  ],
  [
    /^(shadow-adaptive|rl-elevation)$/,
    () => ({
      "box-shadow":
        "0 2px 8px light-dark(oklch(0 0 0 / 0.12), transparent), 0 12px 32px light-dark(oklch(0 0 0 / 0.08), transparent), inset 0 0 0 1px light-dark(transparent, oklch(from var(--rl-surface-effective, var(--background)) calc(l + 0.35) 0.15 h / 0.7)), 0 0 20px light-dark(transparent, oklch(from var(--rl-surface-effective, var(--background)) calc(l + 0.35) 0.2 h / 0.5)), 0 0 4px light-dark(transparent, oklch(from var(--rl-surface-effective, var(--background)) calc(l + 0.35) 0.25 h / 0.8))"
    })
  ],
  [
    /^(?:rl|rla)-visibility-aware$/,
    () => ({
      "content-visibility": "auto",
      "contain-intrinsic-size":
        "var(--rl-contain-intrinsic-size, var(--rla-contain-intrinsic-size, auto 500px))"
    })
  ],
  [
    /^(text|bg|ring|border|outline|divide)-([a-z]+)(?:\/(\d+))?$/,
    ([, prop, name, opacity]) => {
      const mapping = INTENT_PROPS[prop!]
      const intentValues = SEMANTIC_INTENTS[name!]
      if (!mapping || !intentValues) return
      const raw = intentValues[mapping[1]]!
      const base = raw.includes("(") ? raw : `var(--color-neutral-${raw})`
      return {
        [mapping[0]]: opacity ? `color-mix(in srgb, ${base} ${opacity}%, transparent)` : base,
        ...(prop === "bg" && name === "inverted" ? { color: "var(--color-neutral-50)" } : {})
      }
    }
  ]
]

export default function rimelightUiPreset({ colors, icons, presets }: PresetOptions = {}): Preset {
  const allColors = getAllColorNames(colors)
  return {
    name: "rimelight-ui",
    safelist: [
      ...allColors.map((c) => `rl-color-${c}`),
      ...Object.values(icons ?? {}).filter(
        (v): v is string => typeof v === "string" && v.startsWith("i-")
      )
    ],
    presets: [
      presets?.wind !== false && presetWind4(),
      presets?.typography !== false && presetTypography(),
      presets?.icons !== false && presetIcons()
    ].filter(Boolean) as Preset[],
    transformers: [transformerDirectives(), transformerVariantGroup()],
    outputToCssLayers: true,
    rules: customPresetRules,
    theme: {
      spacing: SPACING_TOKENS,
      radius: RADIUS_TOKENS,
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        outline: "var(--outline)",
        ...Object.fromEntries(allColors.map((c) => [c, createPaletteScale(c)]))
      }
    },
    preflights: [{ getCSS: () => getPreflightCss(colors) }]
  }
}
