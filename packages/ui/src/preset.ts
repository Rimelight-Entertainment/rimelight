import { presetIcons, presetTypography, presetWind4, type Preset } from "unocss"
import type { PresetOptions, UIConfig } from "./types"

export const PALETTES = {
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
} as const

export const P = PALETTES

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

const INTENTS: Record<string, Record<string, string>> = {
  default: { text: "700", bg: "50", border: "200", ring: "300" },
  muted: { text: "600", bg: "100", border: "200", ring: "300" },
  elevated: { text: "800", bg: "100", border: "200", ring: "400" },
  accented: { text: "900", bg: "200", border: "300", ring: "500" },
  dimmed: { text: "500", bg: "50", border: "300", ring: "400" },
  toned: { text: "800", bg: "700", border: "600", ring: "900" },
  highlighted: { text: "950", bg: "200", border: "800", ring: "950" },
  inverted: { text: "50", bg: "950", border: "800", ring: "700" }
}

function cssVars(custom: Record<string, any> = {}) {
  let css = ""
  for (const [name, val] of Object.entries({ ...PALETTES, ...custom })) {
    const isBuiltin = Array.isArray(val)
    const [c, h] = isBuiltin ? val : [0, 0]
    const v = val as any
    const light = !isBuiltin ? v?.light || v || {} : null
    const dark = !isBuiltin ? v?.dark || v || {} : null
    const fallback = light?.["500"] ?? Object.values(light || {})[0] ?? "oklch(0.55 0.15 0)"

    for (const [s, [l1, c1, l2, c2]] of Object.entries(SHADES)) {
      const value = isBuiltin
        ? `light-dark(oklch(${l1} ${(c1 * c).toFixed(3)} ${h}), oklch(${l2} ${(c2 * c).toFixed(3)} ${h}))`
        : `light-dark(${light[s] ?? fallback}, ${dark[s] ?? fallback})`
      css += `  --color-${name}-${s}: ${value};\n`
    }
    css += `  --${name}: var(--color-${name}-500);\n  --${name}-foreground: light-dark(oklch(1 0 0), oklch(0.145 0 0));\n  --${name}-accent: var(--color-${name}-600);\n`
  }
  return css
}

export default function rimelightUiPreset(options: PresetOptions | UIConfig = {}): Preset {
  const allColors = Object.keys({ ...PALETTES, ...options.colors })
  const shadeKeys = Object.keys(SHADES)

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
    shortcuts: [
      [
        /^(text|bg|ring|border|outline|divide)-([a-z]+)(?:\/(\d+))?$/,
        ([, p, n, o]) => {
          if (!n || !p) return
          const prop = p === "divide" ? "border" : p === "outline" ? "ring" : p
          const s = INTENTS[n]?.[prop]
          if (!s) return
          const target = `${p}-neutral-${s}${o ? `/${o}` : ""}`
          return p === "bg" && n === "inverted" ? `${target} text-neutral-50` : target
        }
      ]
    ],
    rules: [
      [
        /^rl-color-([\w-]+)$/,
        ([, c]) => ({
          "--rl-bg": `var(--color-${c}-500)`,
          "--rl-ring": `var(--color-${c}-500)`,
          "--rl-border": `var(--color-${c}-500)`,
          "--rl-bg-hover": `var(--color-${c}-600)`,
          "--rl-text": `var(--color-${c}-600)`
        })
      ]
    ],
    theme: {
      spacing: {
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
      },
      radius: {
        "xs": "calc(var(--radius) - 0.375rem)",
        "sm": "calc(var(--radius) - 0.25rem)",
        "md": "calc(var(--radius) - 0.125rem)",
        "lg": "var(--radius)",
        "xl": "calc(var(--radius) + 0.25rem)",
        "2xl": "calc(var(--radius) + 0.5rem)",
        "3xl": "calc(var(--radius) + 1rem)"
      },
      colors: Object.fromEntries(
        allColors.map((c) => [
          c,
          {
            DEFAULT: `var(--${c})`,
            foreground: `var(--${c}-foreground)`,
            accent: `var(--${c}-accent)`,
            ...Object.fromEntries(shadeKeys.map((s) => [s, `var(--color-${c}-${s})`]))
          }
        ])
      )
    },
    preflights: [
      {
        getCSS: () =>
          `:root {\n  color-scheme: light dark;\n  --radius: 0.625rem;\n  --rl-header-height: 4rem;\n  --rl-container: 90rem;\n${cssVars(options.colors)}}\n.dark, [data-theme="dark"], .rl-dark { color-scheme: dark; }\n.light, [data-theme="light"], .rl-light { color-scheme: light; }\nbody { background-color: light-dark(oklch(1 0 0), var(--color-neutral-50)); color: var(--color-neutral-950); }`
      }
    ]
  }
}
