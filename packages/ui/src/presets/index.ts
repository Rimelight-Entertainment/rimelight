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

const BUILTIN_COLORS: Record<string, string> = {
  neutral:
    "0.985 0 0, 0.97 0 0, 0.922 0 0, 0.87 0 0, 0.708 0 0, 0.556 0 0, 0.439 0 0, 0.371 0 0, 0.269 0 0, 0.205 0 0, 0.145 0 0 | 0.145 0 0, 0.20 0 0, 0.28 0 0, 0.35 0 0, 0.44 0 0, 0.55 0 0, 0.62 0 0, 0.70 0 0, 0.78 0 0, 0.87 0 0, 0.95 0 0",
  primary:
    "0.97 0.015 260, 0.92 0.04 260, 0.85 0.08 260, 0.76 0.13 260, 0.66 0.18 260, 0.53 0.21 260, 0.44 0.19 260, 0.35 0.15 260, 0.27 0.11 260, 0.20 0.07 260, 0.15 0.04 260 | 0.15 0.04 260, 0.20 0.07 260, 0.27 0.11 260, 0.35 0.15 260, 0.44 0.19 260, 0.53 0.21 260, 0.61 0.19 260, 0.69 0.15 260, 0.77 0.10 260, 0.86 0.06 260, 0.93 0.02 260",
  secondary:
    "0.987 0.022 95.277, 0.962 0.059 95.617, 0.924 0.12 95.746, 0.879 0.169 91.605, 0.828 0.189 84.429, 0.769 0.188 70.08, 0.666 0.179 58.318, 0.555 0.163 48.998, 0.473 0.137 46.201, 0.414 0.112 45.904, 0.279 0.077 45.635 | 0.15 0.015 95, 0.20 0.04 95, 0.28 0.08 96, 0.35 0.12 92, 0.44 0.15 84, 0.52 0.16 70, 0.60 0.15 58, 0.68 0.12 49, 0.76 0.09 46, 0.84 0.06 46, 0.92 0.03 46",
  info: "0.97 0.014 254.604, 0.932 0.032 255.585, 0.882 0.059 254.128, 0.809 0.105 251.813, 0.707 0.165 254.624, 0.623 0.214 259.815, 0.546 0.245 262.881, 0.488 0.243 264.376, 0.424 0.199 265.638, 0.379 0.146 265.522, 0.282 0.091 267.935 | 0.15 0.01 255, 0.20 0.025 256, 0.28 0.04 254, 0.35 0.07 252, 0.44 0.12 255, 0.52 0.17 260, 0.60 0.20 263, 0.68 0.18 264, 0.76 0.13 266, 0.84 0.08 266, 0.92 0.04 268",
  success:
    "0.982 0.018 155.826, 0.962 0.044 156.743, 0.925 0.084 155.995, 0.871 0.15 154.449, 0.792 0.209 151.711, 0.723 0.219 149.579, 0.627 0.194 149.214, 0.527 0.154 150.069, 0.448 0.119 151.328, 0.393 0.095 152.535, 0.266 0.065 152.934 | 0.15 0.01 156, 0.20 0.03 157, 0.28 0.055 156, 0.35 0.10 154, 0.44 0.16 152, 0.52 0.18 150, 0.60 0.16 149, 0.68 0.12 150, 0.76 0.08 151, 0.84 0.05 153, 0.92 0.03 153",
  warning:
    "0.987 0.026 102.212, 0.973 0.071 103.193, 0.945 0.129 101.54, 0.905 0.182 98.111, 0.852 0.199 91.936, 0.795 0.184 86.047, 0.681 0.162 75.834, 0.554 0.135 66.442, 0.476 0.114 61.907, 0.421 0.095 57.708, 0.286 0.066 53.813 | 0.15 0.015 102, 0.20 0.045 103, 0.28 0.085 102, 0.35 0.13 98, 0.44 0.16 92, 0.52 0.16 86, 0.60 0.14 76, 0.68 0.11 66, 0.76 0.08 62, 0.84 0.05 58, 0.92 0.03 54",
  error:
    "0.971 0.013 17.38, 0.936 0.032 17.717, 0.885 0.062 18.334, 0.808 0.114 19.571, 0.704 0.191 22.216, 0.637 0.237 25.331, 0.577 0.245 27.325, 0.505 0.213 27.518, 0.444 0.177 26.899, 0.396 0.141 25.723, 0.258 0.092 26.042 | 0.15 0.01 17, 0.20 0.02 18, 0.28 0.04 18, 0.35 0.075 20, 0.44 0.14 22, 0.52 0.19 25, 0.60 0.20 27, 0.68 0.17 28, 0.76 0.12 27, 0.84 0.08 26, 0.92 0.04 26",
  commentary:
    "0.977 0.017 320.058, 0.952 0.037 318.852, 0.903 0.076 319.62, 0.833 0.145 321.434, 0.74 0.238 322.16, 0.667 0.295 322.15, 0.591 0.293 322.896, 0.518 0.253 323.949, 0.452 0.211 324.591, 0.401 0.17 325.612, 0.293 0.136 325.661 | 0.15 0.01 320, 0.20 0.025 319, 0.28 0.05 320, 0.35 0.10 321, 0.44 0.18 322, 0.52 0.24 322, 0.60 0.23 323, 0.68 0.19 324, 0.76 0.14 325, 0.84 0.09 326, 0.92 0.05 326",
  ideation:
    "0.969 0.016 293.756, 0.943 0.029 294.588, 0.894 0.057 293.283, 0.811 0.111 293.571, 0.702 0.183 293.541, 0.606 0.25 292.717, 0.541 0.281 293.009, 0.491 0.27 292.581, 0.432 0.232 292.759, 0.38 0.189 293.745, 0.283 0.141 291.089 | 0.15 0.01 294, 0.20 0.02 295, 0.28 0.04 293, 0.35 0.075 294, 0.44 0.14 294, 0.52 0.20 293, 0.60 0.22 293, 0.68 0.20 293, 0.76 0.15 293, 0.84 0.10 294, 0.92 0.05 291",
  source:
    "0.984 0.019 200.873, 0.956 0.045 203.388, 0.917 0.08 205.041, 0.865 0.127 207.078, 0.789 0.154 211.53, 0.715 0.143 215.221, 0.609 0.126 221.723, 0.52 0.105 223.128, 0.45 0.085 224.283, 0.398 0.07 227.392, 0.302 0.056 229.695 | 0.15 0.01 201, 0.20 0.03 203, 0.28 0.055 205, 0.35 0.09 207, 0.44 0.12 212, 0.52 0.12 215, 0.60 0.10 222, 0.68 0.08 223, 0.76 0.055 224, 0.84 0.04 227, 0.92 0.025 230"
}

const colorBlock = (
  name: string,
  light: (s: string, i: number) => string,
  dark: (s: string, i: number) => string
) =>
  `${COLOR_SHADES.map((s, i) => `  --color-${name}-${s}: light-dark(${light(s, i)}, ${dark(s, i)});`).join("\n")}
  --${name}: light-dark(${light("500", 5)}, ${dark("500", 5)});
  --${name}-foreground: light-dark(oklch(1 0 0), oklch(0.145 0 0));
  --${name}-accent: var(--color-${name}-600);`

const STATIC_BUILTIN_COLOR_LINES = Object.entries(BUILTIN_COLORS)
  .map(([name, scale]) => {
    const [l, d] = scale.split(" | ").map((h) => h.split(", "))
    return colorBlock(
      name,
      (_, i) => `oklch(${l![i]})`,
      (_, i) => `oklch(${d![i]})`
    )
  })
  .join("\n")

function formatUserColors(colors?: Record<string, ColorModeInput>): string {
  if (!colors) return ""
  return Object.entries(colors)
    .map(([c, entry]) => {
      const isMode = typeof entry === "object" && entry && ("light" in entry || "dark" in entry)
      const { light, dark } = (isMode ? entry : { light: entry, dark: entry }) as Record<
        string,
        Record<string, string> | undefined
      >
      const bL = light?.["500"] ?? (light && Object.values(light)[0]) ?? ""
      const bD = dark?.["500"] ?? (dark && Object.values(dark)[0]) ?? bL

      const mix = (val: string, s: string, isDark: boolean) => {
        const n = +s
        return !n || n === 500
          ? val
          : `color-mix(in oklch, ${val}, ${n < 500 !== isDark ? "white" : "black"} ${Math.round((Math.abs(500 - n) / (n < 500 ? 500 : 450)) * 75)}%)`
      }

      return colorBlock(
        c,
        (s) => light?.[s] ?? mix(bL, s, false),
        (s) => dark?.[s] ?? mix(bD, s, true)
      )
    })
    .join("\n")
}

const createScale = (c: string) => ({
  DEFAULT: `var(--${c})`,
  foreground: `var(--${c}-foreground)`,
  accent: `var(--${c}-accent)`,
  ...Object.fromEntries(COLOR_SHADES.map((s) => [s, `var(--color-${c}-${s})`]))
})

const STATIC_THEME_COLORS = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  border: "var(--border)",
  input: "var(--input)",
  ring: "var(--ring)",
  outline: "var(--outline)",
  muted: { DEFAULT: "var(--background-color-muted)", foreground: "var(--text-color-muted)" },
  accent: {
    DEFAULT: "var(--background-color-accented)",
    foreground: "var(--text-color-highlighted)"
  }
}

const PROP_MAP: Record<string, [css: string, prefix: string]> = {
  text: ["color", "text"],
  bg: ["background-color", "background"],
  ring: ["--un-ring-color", "ring"],
  outline: ["outline-color", "ring"],
  divide: ["border-color", "divide"],
  border: ["border-color", "border"]
}

const INTENTS: Record<string, [string, string, string, string, string]> = {
  default: ["700", "light-dark(oklch(1 0 0), var(--color-neutral-50))", "200", "300", "100"],
  muted: ["600", "100", "200", "300", "200"],
  elevated: ["800", "light-dark(oklch(1 0 0), var(--color-neutral-100))", "200", "400", "100"],
  accented: ["900", "200", "300", "500", "300"],
  dimmed: ["500", "light-dark(var(--color-neutral-50), oklch(0 0 0 / 0.25))", "300", "400", "200"],
  toned: ["800", "700", "600", "900", "800"],
  highlighted: ["950", "200", "800", "950", "900"],
  inverted: ["50", "950", "800", "700", "900"]
}

const INTENT_PREFLIGHT_VARS = Object.entries(INTENTS)
  .flatMap(([n, vals]) =>
    (["text", "background", "border", "ring", "divide"] as const).map(
      (p, i) =>
        `  --${p}-color-${n}: ${vals[i]!.includes("(") ? vals[i]! : `var(--color-neutral-${vals[i]!})`};`
    )
  )
  .join("\n")

const INTENT_REGEX = /^(text|bg|ring|border|outline|divide)-([a-z]+)(?:\/(\d+))?$/

const getPreflightCss = (userColors?: Record<string, ColorModeInput>) => `:root {
  color-scheme: light dark;
  --background: light-dark(oklch(1 0 0), var(--color-neutral-50));
  --foreground: var(--color-neutral-950);
  --border: var(--border-color-default);
  --input: var(--border-color-default);
  --ring: var(--ring-color-default);
  --outline: var(--ring-color-default);
  --radius: 0.625rem;
  --font-sans: "Noto Sans", sans-serif;
  --font-serif: "Noto Serif", serif;
  --font-mono: "Noto Sans Mono", monospace;
  --ui-header-height: 4rem;
  --rl-container: 90rem;
${INTENT_PREFLIGHT_VARS}

${STATIC_BUILTIN_COLOR_LINES}${userColors ? `\n${formatUserColors(userColors)}` : ""}
}

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

body { background-color: var(--background); color: var(--foreground); font-family: var(--font-sans); }
*, ::before, ::after { --un-ring-color: var(--primary); }
*:focus-visible, *:has(> a:focus-visible) {
  outline: 2px solid color-mix(in srgb, var(--un-ring-color, var(--primary)) 25%, transparent);
  outline-offset: 2px;
}`

const THEME_SPACING: Record<string, string> = {
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

const THEME_RADIUS: Record<string, string> = {
  "xs": "calc(var(--radius) - 0.375rem)",
  "sm": "calc(var(--radius) - 0.25rem)",
  "md": "calc(var(--radius) - 0.125rem)",
  "lg": "var(--radius)",
  "xl": "calc(var(--radius) + 0.25rem)",
  "2xl": "calc(var(--radius) + 0.5rem)",
  "3xl": "calc(var(--radius) + 1rem)"
}

const STATIC_RULES: Rule[] = [
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
    "rla-visibility-aware",
    {
      "content-visibility": "auto",
      "contain-intrinsic-size": "var(--rla-contain-intrinsic-size, auto 500px)"
    }
  ],
  [
    INTENT_REGEX,
    ([, prop, name, opacity]) => {
      const mapping = PROP_MAP[prop!]
      if (!mapping || !INTENTS[name!]) return
      const [css, prefix] = mapping
      const val = opacity
        ? `color-mix(in srgb, var(--${prefix}-color-${name}) ${opacity}%, transparent)`
        : `var(--${prefix}-color-${name})`
      return prop === "bg" && name === "inverted"
        ? { [css]: val, color: "var(--text-color-inverted)" }
        : { [css]: val }
    }
  ]
]

export function rimelightUiPreset(options?: PresetOptions): Preset {
  const userColors = options?.colors
  const allColors = getAllColorNames(userColors)
  const opt = options?.presets

  return {
    name: "rimelight-ui",
    safelist: [
      ...allColors.map((c) => `rl-color-${c}`),
      ...Object.values(options?.icons ?? {}).filter(
        (v): v is string => typeof v === "string" && v.startsWith("i-")
      )
    ],
    presets: [
      opt?.wind !== false && presetWind4(),
      opt?.typography !== false &&
        presetTypography({
          cssExtend: {
            "h1,h2,h3,h4,h5,h6,p,li,blockquote": {
              "font-family": "var(--font-sans), system-ui, sans-serif"
            },
            "pre,code": { "font-family": "var(--font-mono), monospace" }
          }
        }),
      opt?.icons !== false &&
        presetIcons({ extraProperties: { "display": "inline-block", "vertical-align": "middle" } })
    ].filter(Boolean) as Preset[],
    transformers: [transformerDirectives(), transformerVariantGroup()],
    outputToCssLayers: true,
    layers: { theme: 1, preflights: 2, shortcuts: 3, default: 4 },
    shortcuts: {
      "container": "mx-auto w-full max-w-[var(--rl-container)] px-xs sm:px-md md:px-xl",
      "sr-only":
        "absolute w-px h-px p-0 m-0 overflow-hidden [clip:rect(1px,1px,1px,1px)] whitespace-nowrap border-0"
    },
    rules: STATIC_RULES,
    theme: {
      spacing: THEME_SPACING,
      colors: {
        ...STATIC_THEME_COLORS,
        ...Object.fromEntries(allColors.map((c) => [c, createScale(c)]))
      },
      radius: THEME_RADIUS
    },
    preflights: [{ getCSS: () => getPreflightCss(userColors) }]
  }
}

export default rimelightUiPreset
