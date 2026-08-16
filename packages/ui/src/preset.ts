import { presetIcons, presetTypography, presetWind4, type Preset } from "unocss"
import type { ColorModeInput, PresetOptions } from "./types"

const PALETTES: Record<string, [number, number]> = Object.fromEntries(
  "neutral:0:0,primary:0.21:260,secondary:0.18:70,info:0.24:260,success:0.2:150,warning:0.17:86,error:0.24:25,commentary:0.29:322,ideation:0.28:293,source:0.13:215"
    .split(",")
    .map((s) => {
      const [k, c, h] = s.split(":")
      return [k, [+c!, +h!]]
    })
)

const SHADES: Record<string, number[]> = Object.fromEntries(
  "50:0.985:0.1:0.145:0.2,100:0.965:0.25:0.2:0.35,200:0.925:0.45:0.28:0.55,300:0.85:0.7:0.35:0.75,400:0.72:0.9:0.44:0.9,500:0.55:1:0.53:1,600:0.44:0.9:0.61:0.85,700:0.35:0.75:0.69:0.7,800:0.27:0.6:0.77:0.55,900:0.2:0.45:0.86:0.4,950:0.145:0.3:0.93:0.25"
    .split(",")
    .map((s) => {
      const [k, ...v] = s.split(":")
      return [k, v.map(Number)]
    })
)

const PROPS: Record<string, [string, number]> = {
  text: ["color", 0],
  bg: ["background-color", 1],
  border: ["border-color", 2],
  divide: ["border-color", 2],
  ring: ["--un-ring-color", 3],
  outline: ["outline-color", 3]
}

const INTENTS: Record<string, string> = {
  default: "700,50,200,300",
  muted: "600,100,200,300",
  elevated: "800,100,200,400",
  accented: "900,200,300,500",
  dimmed: "500,50,300,400",
  toned: "800,700,600,900",
  highlighted: "950,200,800,950",
  inverted: "50,950,800,700"
}

const compilePalettes = (custom: Record<string, ColorModeInput> = {}) => {
  const emit = (n: string, fn: (s: string) => string) =>
    Object.keys(SHADES)
      .map((s) => `  --color-${n}-${s}: ${fn(s)};\n`)
      .join("") +
    `  --${n}: var(--color-${n}-500);\n  --${n}-foreground: light-dark(oklch(1 0 0), oklch(0.145 0 0));\n  --${n}-accent: var(--color-${n}-600);\n`
  return [
    ...Object.entries(PALETTES).map(([n, [c, h]]) =>
      emit(
        n,
        (s) =>
          `light-dark(oklch(${SHADES[s]![0]} ${(SHADES[s]![1]! * c).toFixed(3)} ${h}), oklch(${SHADES[s]![2]} ${(SHADES[s]![3]! * c).toFixed(3)} ${h}))`
      )
    ),
    ...Object.entries(custom).map(([n, e]) => {
      const m = ("light" in e || "dark" in e ? e : { light: e, dark: e }) as Record<
          string,
          Record<string, string>
        >,
        l = m.light?.["500"] ?? Object.values(m.light ?? {})[0] ?? "oklch(0.55 0.15 0)",
        d = m.dark?.["500"] ?? Object.values(m.dark ?? {})[0] ?? l
      return emit(n, (s) => `light-dark(${m.light?.[s] ?? l}, ${m.dark?.[s] ?? d})`)
    })
  ].join("")
}

export default function rimelightUiPreset(options: PresetOptions = {}): Preset {
  const allColors = Object.keys({ ...PALETTES, ...options.colors }),
    shades = Object.keys(SHADES)

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
          const [prop, idx] = PROPS[p!] ?? [],
            s = INTENTS[n!]?.split(",")[idx!]
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
          .map((s) => {
            const [k, v] = s.split(":")
            return [k, `${v}rem`]
          })
      ),
      radius: Object.fromEntries(
        "xs:- 0.375,sm:- 0.25,md:- 0.125,lg:,xl:+ 0.25,2xl:+ 0.5,3xl:+ 1".split(",").map((s) => {
          const [k, d] = s.split(":")
          return [k, d ? `calc(var(--radius) ${d}rem)` : "var(--radius)"]
        })
      ),
      colors: Object.fromEntries(
        allColors.map((c) => [
          c,
          {
            DEFAULT: `var(--${c})`,
            foreground: `var(--${c}-foreground)`,
            accent: `var(--${c}-accent)`,
            ...Object.fromEntries(shades.map((s) => [s, `var(--color-${c}-${s})`]))
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
${compilePalettes(options.colors)}}

.dark, [data-theme="dark"] { color-scheme: dark; }
.light, [data-theme="light"] { color-scheme: light; }

body { background-color: light-dark(oklch(1 0 0), var(--color-neutral-50)); color: var(--color-neutral-950); }`
      }
    ]
  }
}
