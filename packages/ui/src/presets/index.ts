import { presetIcons, presetTypography, presetWind4, type Preset, type Rule } from "unocss"
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

const BUILTIN_PALETTE_CSS = Object.entries(PALETTES)
  .map(([name, [c, h]]) => renderPaletteVars(name, c, h))
  .join("\n")

const formatCustomColors = (colors?: Record<string, ColorModeInput>) => {
  if (!colors) return ""
  return Object.entries(colors)
    .map(([name, entry]) => {
      const mode = (
        entry && typeof entry === "object" && ("light" in entry || "dark" in entry)
          ? entry
          : { light: entry, dark: entry }
      ) as { light?: Record<string, string>; dark?: Record<string, string> }
      const l = mode.light ?? {},
        d = mode.dark ?? {}
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

const generatePreflightCss = (colors?: Record<string, ColorModeInput>) => {
  const custom = formatCustomColors(colors)
  return `:root {
  color-scheme: light dark;
  --radius: 0.625rem;
  --rl-header-height: 4rem;
  --rl-container: 90rem;
${BUILTIN_PALETTE_CSS}${custom ? `\n${custom}` : ""}
}

.dark, [data-theme="dark"] { color-scheme: dark; }
.light, [data-theme="light"] { color-scheme: light; }

body { background-color: light-dark(oklch(1 0 0), var(--color-neutral-50)); color: var(--color-neutral-950); }`
}

const SPACING = {
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

const RADIUS = {
  "xs": "calc(var(--radius) - 0.375rem)",
  "sm": "calc(var(--radius) - 0.25rem)",
  "md": "calc(var(--radius) - 0.125rem)",
  "lg": "var(--radius)",
  "xl": "calc(var(--radius) + 0.25rem)",
  "2xl": "calc(var(--radius) + 0.5rem)",
  "3xl": "calc(var(--radius) + 1rem)"
}

const PROPERTY_CONFIG: Record<string, { key: "text" | "bg" | "border" | "ring"; prop: string }> = {
  text: { key: "text", prop: "color" },
  bg: { key: "bg", prop: "background-color" },
  border: { key: "border", prop: "border-color" },
  divide: { key: "border", prop: "border-color" },
  ring: { key: "ring", prop: "--un-ring-color" },
  outline: { key: "ring", prop: "outline-color" }
}

const SEMANTIC_INTENTS: Record<string, Record<"text" | "bg" | "border" | "ring", string>> = {
  default: { text: "700", bg: "50", border: "200", ring: "300" },
  muted: { text: "600", bg: "100", border: "200", ring: "300" },
  elevated: { text: "800", bg: "100", border: "200", ring: "400" },
  accented: { text: "900", bg: "200", border: "300", ring: "500" },
  dimmed: { text: "500", bg: "50", border: "300", ring: "400" },
  toned: { text: "800", bg: "700", border: "600", ring: "900" },
  highlighted: { text: "950", bg: "200", border: "800", ring: "950" },
  inverted: { text: "50", bg: "950", border: "800", ring: "700" }
}

const rules: Rule[] = [
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
    /^(text|bg|ring|border|outline|divide)-([a-z]+)(?:\/(\d+))?$/,
    ([, prop, name, opacity]) => {
      const config = PROPERTY_CONFIG[prop!]
      const intent = SEMANTIC_INTENTS[name!]
      if (!config || !intent) return

      const base = `var(--color-neutral-${intent[config.key]})`
      return {
        [config.prop]: opacity ? `color-mix(in srgb, ${base} ${opacity}%, transparent)` : base,
        ...(prop === "bg" && name === "inverted" ? { color: "var(--color-neutral-50)" } : {})
      }
    }
  ]
]

export default function rimelightUiPreset(options: PresetOptions = {}): Preset {
  const allColors = getAllColorNames(options.colors)

  const safelist = [
    ...allColors.map((c) => `rl-color-${c}`),
    ...Object.values(options.icons ?? {}).filter(
      (v): v is string => typeof v === "string" && v.startsWith("i-")
    )
  ]

  const presets = [
    options.presets?.wind !== false && presetWind4(),
    options.presets?.typography !== false && presetTypography(),
    options.presets?.icons !== false && presetIcons()
  ].filter(Boolean) as Preset[]

  const theme = {
    spacing: SPACING,
    radius: RADIUS,
    boxShadow: {
      adaptive:
        "0 2px 8px light-dark(oklch(0 0 0 / 0.12), transparent), 0 12px 32px light-dark(oklch(0 0 0 / 0.08), transparent), inset 0 0 0 1px light-dark(transparent, oklch(from var(--color-neutral-50) calc(l + 0.35) 0.15 h / 0.7)), 0 0 20px light-dark(transparent, oklch(from var(--color-neutral-50) calc(l + 0.35) 0.2 h / 0.5)), 0 0 4px light-dark(transparent, oklch(from var(--color-neutral-50) calc(l + 0.35) 0.25 h / 0.8))"
    },
    colors: Object.fromEntries(
      allColors.map((c) => [
        c,
        {
          DEFAULT: `var(--${c})`,
          foreground: `var(--${c}-foreground)`,
          accent: `var(--${c}-accent)`,
          ...Object.fromEntries(COLOR_SHADES.map((s) => [s, `var(--color-${c}-${s})`]))
        }
      ])
    )
  }

  const preflights = [{ getCSS: () => generatePreflightCss(options.colors) }]

  return {
    name: "rimelight-ui",
    outputToCssLayers: true,
    safelist,
    presets,
    rules,
    theme,
    preflights
  }
}
