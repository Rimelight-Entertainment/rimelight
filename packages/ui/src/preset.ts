import { presetIcons, presetTypography, presetWind4, type Preset } from "unocss"
import type { ColorModeInput, UIConfig } from "./types"
import { getIconSvg } from "./icons.raw"

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

const SHADES = {
  "50": [0.985, 0.1, 0.145, 0.2],
  "100": [0.965, 0.25, 0.2, 0.35],
  "200": [0.925, 0.45, 0.28, 0.55],
  "300": [0.85, 0.7, 0.35, 0.75],
  "400": [0.72, 0.9, 0.44, 0.9],
  "500": [0.55, 1, 0.53, 1],
  "600": [0.44, 0.9, 0.61, 0.85],
  "700": [0.35, 0.75, 0.69, 0.7],
  "800": [0.27, 0.6, 0.77, 0.55],
  "900": [0.2, 0.45, 0.86, 0.4],
  "950": [0.145, 0.3, 0.93, 0.25]
} as const

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

function resolveTokens(custom: Record<string, ColorModeInput> = {}) {
  const themeColors: Record<string, Record<string, string>> = {}
  const tokenVarLines: string[] = []
  const allPalettes: Record<string, ColorModeInput> = { ...PALETTES, ...custom }

  for (const [name, val] of Object.entries(allPalettes)) {
    const shades: Record<string, string> = { DEFAULT: `var(--rl-${name}-500)` }
    let getShade: (s: string, coords: readonly [number, number, number, number]) => [string, string]

    if (Array.isArray(val)) {
      const [c, h] = val
      getShade = (_, [l1, c1, l2, c2]) => [
        `oklch(${l1} ${(c1 * c).toFixed(3)} ${h})`,
        `oklch(${l2} ${(c2 * c).toFixed(3)} ${h})`
      ]
    } else {
      const isSplit = "light" in val || "dark" in val
      const light = (isSplit ? (val as any).light : val) ?? {}
      const dark = (isSplit ? (val as any).dark : light) ?? light
      const fallback = light["500"] ?? Object.values(light)[0] ?? "oklch(0.55 0.15 0)"
      getShade = (s) => [light[s] ?? fallback, dark[s] ?? fallback]
    }

    for (const [s, coords] of Object.entries(SHADES)) {
      shades[s] = `var(--rl-${name}-${s})`
      const [lightVal, darkVal] = getShade(s, coords)
      tokenVarLines.push(`--rl-${name}-${s}: light-dark(${lightVal}, ${darkVal});`)
    }

    themeColors[name] = shades
  }

  return { themeColors, tokenVarLines }
}

export default function rimelightUiPreset({ colors, icons, presets = {} }: UIConfig = {}): Preset {
  const { themeColors, tokenVarLines } = resolveTokens(colors)

  return {
    name: "rimelight-ui",
    outputToCssLayers: true,
    safelist: [
      ...Object.keys(themeColors).map((c) => `rl-color-${c}`),
      ...Object.values(icons ?? {}).filter(
        (v): v is string => typeof v === "string" && v.startsWith("i-")
      )
    ],
    presets: [
      presets.wind !== false && presetWind4(),
      presets.typography !== false && presetTypography(),
      presets.icons !== false &&
        presetIcons({
          collections: {
            rl: getIconSvg
          }
        }),
      {
        name: "rimelight-theme",
        theme: {
          spacing: {
            md: "1rem"
          },
          colors: themeColors
        }
      }
    ].filter(Boolean) as Preset[],
    shortcuts: [
      [
        /^(text|bg|ring|border)-([a-z]+)(?:\/(\d+))?$/,
        ([, p, n, o]) => {
          if (!p || !n) return
          const s = INTENTS[n]?.[p]
          if (!s) return
          const target = `${p}-neutral-${s}${o ? `/${o}` : ""}`
          return p === "bg" && n === "inverted" ? `${target} text-neutral-50` : target
        }
      ]
    ],
    rules: [
      [
        /^rl-color-([\w-]+)$/,
        ([, c]) => {
          const v500 = `var(--rl-${c}-500)`
          const v600 = `var(--rl-${c}-600)`
          return {
            "--rl-bg": v500,
            "--rl-ring": v500,
            "--rl-border": v500,
            "--rl-bg-hover": v600,
            "--rl-text": v600
          }
        }
      ]
    ],
    preflights: [
      {
        getCSS: () => `:root {
  color-scheme: light dark;
  --rl-header-height: 4rem;
  --rl-container: 90rem;
  ${tokenVarLines.join("\n  ")}
}
[data-theme="dark"] { color-scheme: dark; }
[data-theme="light"] { color-scheme: light; }
body { background-color: var(--rl-neutral-50); color: var(--rl-neutral-950); }`
      }
    ]
  }
}
