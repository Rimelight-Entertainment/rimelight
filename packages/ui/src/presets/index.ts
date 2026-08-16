import { presetIcons, presetTypography, presetWind4, type Preset } from "unocss"
import { PALETTES, type ColorModeInput, type PresetOptions } from "../types"

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

const PROPERTY_MAP: Record<string, [string, number]> = {
  text: ["color", 0],
  bg: ["background-color", 1],
  border: ["border-color", 2],
  divide: ["border-color", 2],
  ring: ["--un-ring-color", 3],
  outline: ["outline-color", 3]
}

const INTENTS: Record<string, string[]> = {
  default: ["700", "50", "200", "300"],
  muted: ["600", "100", "200", "300"],
  elevated: ["800", "100", "200", "400"],
  accented: ["900", "200", "300", "500"],
  dimmed: ["500", "50", "300", "400"],
  toned: ["800", "700", "600", "900"],
  highlighted: ["950", "200", "800", "950"],
  inverted: ["50", "950", "800", "700"]
}

const emitPalette = (name: string, shadeFn: (s: string) => string) =>
  Object.keys(SHADES)
    .map((s) => `  --color-${name}-${s}: ${shadeFn(s)};`)
    .join("\n") +
  `\n  --${name}: var(--color-${name}-500);\n  --${name}-foreground: light-dark(oklch(1 0 0), oklch(0.145 0 0));\n  --${name}-accent: var(--color-${name}-600);`

const compilePalettes = (custom?: Record<string, ColorModeInput>) =>
  [
    ...Object.entries(PALETTES).map(([name, [c, h]]) =>
      emitPalette(name, (s) => {
        const [lL, cL, dL, dC] = SHADES[s]!
        return `light-dark(oklch(${lL} ${(cL * c).toFixed(3)} ${h}), oklch(${dL} ${(dC * c).toFixed(3)} ${h}))`
      })
    ),
    ...Object.entries(custom ?? {}).map(([name, entry]) => {
      const m = (
        entry && typeof entry === "object" && ("light" in entry || "dark" in entry)
          ? entry
          : { light: entry, dark: entry }
      ) as { light?: Record<string, string>; dark?: Record<string, string> }
      const l = m.light?.["500"] ?? Object.values(m.light ?? {})[0] ?? "oklch(0.55 0.15 0)"
      const d = m.dark?.["500"] ?? Object.values(m.dark ?? {})[0] ?? l
      return emitPalette(name, (s) => `light-dark(${m.light?.[s] ?? l}, ${m.dark?.[s] ?? d})`)
    })
  ].join("\n")

export default function rimelightUiPreset(options: PresetOptions = {}): Preset {
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
    rules: [
      [
        /^rl-color-([\w-]+)$/,
        ([, c]) => {
          const [c5, c6] = [`var(--color-${c}-500)`, `var(--color-${c}-600)`]
          return {
            "--rl-bg": c5,
            "--rl-ring": c5,
            "--rl-border": c5,
            "--rl-bg-hover": c6,
            "--rl-text": c6
          }
        }
      ],
      [
        /^(text|bg|ring|border|outline|divide)-([a-z]+)(?:\/(\d+))?$/,
        ([, prop, name, opacity]) => {
          const [cssProp, idx] = PROPERTY_MAP[prop!] ?? []
          const shade = idx !== undefined ? INTENTS[name!]?.[idx] : undefined
          if (!cssProp || !shade) return

          const base = `var(--color-neutral-${shade})`
          return {
            [cssProp]: opacity ? `color-mix(in srgb, ${base} ${opacity}%, transparent)` : base,
            ...(prop === "bg" && name === "inverted" && { color: "var(--color-neutral-50)" })
          }
        }
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
      radius: Object.fromEntries(
        Object.entries({
          "xs": "- 0.375rem",
          "sm": "- 0.25rem",
          "md": "- 0.125rem",
          "lg": "",
          "xl": "+ 0.25rem",
          "2xl": "+ 0.5rem",
          "3xl": "+ 1rem"
        }).map(([k, off]) => [k, off ? `calc(var(--radius) ${off})` : "var(--radius)"])
      ),
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
        getCSS: () => `:root {
  color-scheme: light dark;
  --radius: 0.625rem;
  --rl-header-height: 4rem;
  --rl-container: 90rem;
${compilePalettes(options.colors)}
}

.dark, [data-theme="dark"] { color-scheme: dark; }
.light, [data-theme="light"] { color-scheme: light; }

body { background-color: light-dark(oklch(1 0 0), var(--color-neutral-50)); color: var(--color-neutral-950); }`
      }
    ]
  }
}
