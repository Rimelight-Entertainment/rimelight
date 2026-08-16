import { presetIcons, presetTypography, presetWind4, type Preset, type Rule } from "unocss"
import { getAllColorNames, type ColorModeInput, type PresetOptions } from "../types"

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

const SHADE_KEYS = Object.keys(SHADES)

const emitPaletteCss = (
  name: string,
  shadeFn: (s: string) => string,
  light: string,
  dark: string
) =>
  `${SHADE_KEYS.map((s) => `  --color-${name}-${s}: ${shadeFn(s)};`).join("\n")}
  --${name}: light-dark(${light}, ${dark});
  --${name}-foreground: light-dark(oklch(1 0 0), oklch(0.145 0 0));
  --${name}-accent: var(--color-${name}-600);`

const BUILTIN_PALETTES = Object.entries(PALETTES)
  .map(([name, [c, h]]) =>
    emitPaletteCss(
      name,
      (s) => {
        const [lL, cL, dL, dC] = SHADES[s]!
        return `light-dark(oklch(${lL} ${(cL * c).toFixed(3)} ${h}), oklch(${dL} ${(dC * c).toFixed(3)} ${h}))`
      },
      `oklch(0.55 ${c} ${h})`,
      `oklch(0.53 ${c} ${h})`
    )
  )
  .join("\n")

const formatCustomColors = (colors?: Record<string, ColorModeInput>) =>
  colors
    ? "\n" +
      Object.entries(colors)
        .map(([name, entry]) => {
          const m = (
            typeof entry === "object" && entry && ("light" in entry || "dark" in entry)
              ? entry
              : { light: entry, dark: entry }
          ) as { light?: Record<string, string>; dark?: Record<string, string> }
          const bL = m.light?.["500"] ?? Object.values(m.light ?? {})[0] ?? "oklch(0.55 0.15 0)"
          const bD = m.dark?.["500"] ?? Object.values(m.dark ?? {})[0] ?? bL
          return emitPaletteCss(
            name,
            (s) => `light-dark(${m.light?.[s] ?? bL}, ${m.dark?.[s] ?? bD})`,
            bL,
            bD
          )
        })
        .join("\n")
    : ""

const PROPS: Record<string, [prop: string, idx: number]> = {
  text: ["color", 0],
  bg: ["background-color", 1],
  border: ["border-color", 2],
  divide: ["border-color", 2],
  ring: ["--un-ring-color", 3],
  outline: ["outline-color", 3]
}

// [text, bg, border, ring]
const INTENTS: Record<string, [string, string, string, string]> = {
  default: ["700", "50", "200", "300"],
  muted: ["600", "100", "200", "300"],
  elevated: ["800", "100", "200", "400"],
  accented: ["900", "200", "300", "500"],
  dimmed: ["500", "50", "300", "400"],
  toned: ["800", "700", "600", "900"],
  highlighted: ["950", "200", "800", "950"],
  inverted: ["50", "950", "800", "700"]
}

const rules: Rule[] = [
  [
    /^rl-color-([\w-]+)$/,
    ([, c]) => ({
      "--rl-bg": `var(--color-${c}-500)`,
      "--rl-ring": `var(--color-${c}-500)`,
      "--rl-border": `var(--color-${c}-500)`,
      "--rl-bg-hover": `var(--color-${c}-600)`,
      "--rl-text": `var(--color-${c}-600)`
    })
  ],
  [
    /^(text|bg|ring|border|outline|divide)-([a-z]+)(?:\/(\d+))?$/,
    ([, prop, name, opacity]) => {
      const [cssProp, idx] = PROPS[prop!] ?? []
      const shade = idx !== undefined ? INTENTS[name!]?.[idx] : undefined
      if (!cssProp || !shade) return

      const base = `var(--color-neutral-${shade})`
      return {
        [cssProp]: opacity ? `color-mix(in srgb, ${base} ${opacity}%, transparent)` : base,
        ...(prop === "bg" && name === "inverted" ? { color: "var(--color-neutral-50)" } : {})
      }
    }
  ]
]

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

const buildColorTheme = (c: string) => ({
  DEFAULT: `var(--${c})`,
  foreground: `var(--${c}-foreground)`,
  accent: `var(--${c}-accent)`,
  ...Object.fromEntries(SHADE_KEYS.map((s) => [s, `var(--color-${c}-${s})`]))
})

export default function rimelightUiPreset(options: PresetOptions = {}): Preset {
  const allColors = getAllColorNames(options.colors)

  return {
    name: "rimelight-ui",
    outputToCssLayers: true,
    safelist: [
      ...allColors.map((c) => `rl-color-${c}`),
      ...Object.values(options.icons ?? {}).filter(
        (v): v is string => typeof v === "string" && v.startsWith("i-")
      )
    ],
    presets: [
      options.presets?.wind !== false && presetWind4(),
      options.presets?.typography !== false && presetTypography(),
      options.presets?.icons !== false && presetIcons()
    ].filter(Boolean) as Preset[],
    rules,
    theme: {
      spacing: SPACING,
      radius: RADIUS,
      colors: Object.fromEntries(allColors.map((c) => [c, buildColorTheme(c)]))
    },
    preflights: [
      {
        getCSS: () => `:root {
  color-scheme: light dark;
  --radius: 0.625rem;
  --rl-header-height: 4rem;
  --rl-container: 90rem;
${BUILTIN_PALETTES}${formatCustomColors(options.colors)}
}

.dark, [data-theme="dark"] { color-scheme: dark; }
.light, [data-theme="light"] { color-scheme: light; }

body { background-color: light-dark(oklch(1 0 0), var(--color-neutral-50)); color: var(--color-neutral-950); }`
      }
    ]
  }
}
