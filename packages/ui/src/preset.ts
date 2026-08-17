import { presetIcons, presetTypography, presetWind4, type Preset } from "unocss"
import type { ColorModeInput, PresetOptions } from "./types"

export const P = {
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

const S =
    "50:0.985:0.1:0.145:0.2,100:0.965:0.25:0.2:0.35,200:0.925:0.45:0.28:0.55,300:0.85:0.7:0.35:0.75,400:0.72:0.9:0.44:0.9,500:0.55:1:0.53:1,600:0.44:0.9:0.61:0.85,700:0.35:0.75:0.69:0.7,800:0.27:0.6:0.77:0.55,900:0.2:0.45:0.86:0.4,950:0.145:0.3:0.93:0.25"
      .split(",")
      .map((s) => s.split(":") as [string, any, any, any, any]),
  INTENTS: Record<string, Record<string, string>> = Object.fromEntries(
    "default:700:50:200:300,muted:600:100:200:300,elevated:800:100:200:400,accented:900:200:300:500,dimmed:500:50:300:400,toned:800:700:600:900,highlighted:950:200:800:950,inverted:50:950:800:700"
      .split(",")
      .map((s) => s.split(":") as [string, string, string, string, string])
      .map(([k, text, bg, border, ring]) => [k, { text, bg, border, ring }])
  ),
  CSS_PROPS: Record<string, string> = {
    text: "color",
    bg: "background-color",
    border: "border-color",
    divide: "border-color",
    ring: "--un-ring-color",
    outline: "outline-color"
  },
  emit = (n: string, fn: (s: string, l1: number, c1: number, l2: number, c2: number) => string) =>
    S.map(([s, l1, c1, l2, c2]) => `  --color-${n}-${s}: ${fn(s, l1, c1, l2, c2)};\n`).join("") +
    `  --${n}: var(--color-${n}-500);\n  --${n}-foreground: light-dark(oklch(1 0 0), oklch(0.145 0 0));\n  --${n}-accent: var(--color-${n}-600);\n`,
  cssVars = (custom: Record<string, ColorModeInput> = {}) =>
    Object.entries(P)
      .map(([n, [c, h]]) =>
        emit(
          n,
          (_, l1, c1, l2, c2) =>
            `light-dark(oklch(${l1} ${(c1 * c).toFixed(3)} ${h}), oklch(${l2} ${(c2 * c).toFixed(3)} ${h}))`
        )
      )
      .join("") +
    Object.entries(custom)
      .map(([n, e]) => {
        const m = (e.light || e.dark ? e : { light: e, dark: e }) as Record<
            string,
            Record<string, string>
          >,
          l = m.light?.["500"] ?? Object.values(m.light ?? {})[0] ?? "oklch(0.55 0.15 0)"
        return emit(
          n,
          (s) => `light-dark(${m.light?.[s] ?? l}, ${m.dark?.[s] ?? m.dark?.["500"] ?? l})`
        )
      })
      .join("")

export default function rimelightUiPreset(options: PresetOptions = {}): Preset {
  const allColors = Object.keys({ ...P, ...options.colors })
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
        ([, p, n, o]) => {
          const prop = CSS_PROPS[p!],
            s = INTENTS[n!]?.[p === "divide" ? "border" : p === "outline" ? "ring" : p!]
          if (!prop || !s) return
          const b = `var(--color-neutral-${s})`
          return {
            [prop]: o ? `color-mix(in srgb, ${b} ${o}%, transparent)` : b,
            ...(p === "bg" && n === "inverted" && { color: "var(--color-neutral-50)" })
          }
        }
      ]
    ],
    theme: {
      spacing: Object.fromEntries(
        "6xs:0.125,5xs:0.25,4xs:0.375,3xs:0.5,2xs:0.625,xs:0.75,sm:0.875,md:1,lg:1.25,xl:1.5,2xl:2,3xl:3,4xl:4,5xl:6,6xl:8"
          .split(",")
          .map((s) => s.split(":") as [string, string])
          .map(([k, v]) => [k, `${v}rem`])
      ),
      radius: Object.fromEntries(
        "xs:- 0.375,sm:- 0.25,md:- 0.125,lg:,xl:+ 0.25,2xl:+ 0.5,3xl:+ 1"
          .split(",")
          .map((s) => s.split(":") as [string, string])
          .map(([k, v]) => [k, v ? `calc(var(--radius) ${v}rem)` : "var(--radius)"])
      ),
      colors: Object.fromEntries(
        allColors.map((c) => [
          c,
          {
            DEFAULT: `var(--${c})`,
            foreground: `var(--${c}-foreground)`,
            accent: `var(--${c}-accent)`,
            ...Object.fromEntries(S.map(([s]) => [s, `var(--color-${c}-${s})`]))
          }
        ])
      )
    },
    preflights: [
      {
        getCSS: () =>
          `:root {\n  color-scheme: light dark;\n  --radius: 0.625rem;\n  --rl-header-height: 4rem;\n  --rl-container: 90rem;\n${cssVars(options.colors)}}\n.dark, [data-theme="dark"] { color-scheme: dark; }\n.light, [data-theme="light"] { color-scheme: light; }\nbody { background-color: light-dark(oklch(1 0 0), var(--color-neutral-50)); color: var(--color-neutral-950); }`
      }
    ]
  }
}
