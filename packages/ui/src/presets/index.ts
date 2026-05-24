import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  definePreset,
  presetTypography,
  presetWind4,
  presetIcons,
  transformerDirectives,
  transformerVariantGroup
} from "unocss"
import { defaultColorScales } from "./defaults"

const __dirname = dirname(fileURLToPath(import.meta.url))
const uiSrcGlob = join(__dirname, "../**/*.{js,ts,jsx,tsx,vue,svelte,astro}")
const uiFilesystemGlob = join(__dirname, "../**/*")

type ColorShades = Record<string, string>
type ColorModeShades = { light?: ColorShades; dark?: ColorShades; flat?: ColorShades }
export type ColorConfigValue = ColorShades | ColorModeShades

function resolveColorModes(entry: ColorConfigValue): { light: ColorShades; dark: ColorShades; flat: ColorShades } {
  const raw = entry as Record<string, unknown>

  const modeLight = typeof raw.light === "object" && raw.light !== null ? raw.light as ColorShades : {}
  const modeDark = typeof raw.dark === "object" && raw.dark !== null ? raw.dark as ColorShades : {}
  const modeFlat = typeof raw.flat === "object" && raw.flat !== null ? raw.flat as ColorShades : {}

  const modeKeys = new Set(["light", "dark", "flat"])
  const flatShades: ColorShades = {}
  for (const [k, v] of Object.entries(raw)) {
    if (!modeKeys.has(k) && typeof v === "string") {
      flatShades[k] = v
    }
  }

  const allShades = [...new Set([
    ...Object.keys(modeLight),
    ...Object.keys(modeDark),
    ...Object.keys(modeFlat),
    ...Object.keys(flatShades)
  ])]

  const light: ColorShades = {}
  const dark: ColorShades = {}
  const flat: ColorShades = {}

  for (const shade of allShades) {
    const lv = modeLight[shade] ?? flatShades[shade] ?? modeFlat[shade] ?? modeDark[shade]
    if (lv !== undefined) light[shade] = lv

    const dv = modeDark[shade] ?? flatShades[shade] ?? modeFlat[shade] ?? modeLight[shade]
    if (dv !== undefined) dark[shade] = dv

    const fv = modeFlat[shade] ?? flatShades[shade] ?? modeLight[shade] ?? modeDark[shade]
    if (fv !== undefined) flat[shade] = fv
  }

  return { light, dark, flat }
}

const createScale = (colorName: string, shadeKeys: string[]) => ({
  "DEFAULT": `var(--${colorName})`,
  "foreground": `var(--${colorName}-foreground)`,
  "accent": `var(--${colorName}-accent)`,
  ...Object.fromEntries(shadeKeys.flatMap((shade) => [
    [shade, `var(--color-${colorName}-${shade})`],
    [`${shade}-f`, `var(--color-${colorName}-${shade}-f)`],
    [`${shade}-l`, `var(--color-${colorName}-${shade}-l)`],
    [`${shade}-d`, `var(--color-${colorName}-${shade}-d)`]
  ]))
})

export interface RimelightPresetOptions {
  colors?: Record<string, ColorConfigValue>
}

declare global {
  var __rimelightColorConfig: RimelightPresetOptions | undefined
}

export function setColorConfig(config: RimelightPresetOptions) {
  globalThis.__rimelightColorConfig = config
}

function getColorConfig(): RimelightPresetOptions {
  return globalThis.__rimelightColorConfig ?? {}
}

export default definePreset((options?: RimelightPresetOptions) => {
  const shared = getColorConfig()
  const userColors = options?.colors ?? shared.colors ?? {}
  const coreColors = [
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "commentary",
    "ideation",
    "source",
    "neutral"
  ]
  const mergedColorScales = { ...defaultColorScales, ...userColors }
  const allColors = [...new Set([...coreColors, ...Object.keys(userColors)])]

  const resolvedColors = Object.fromEntries(
    Object.entries(mergedColorScales).map(([name, entry]) => [name, resolveColorModes(entry)])
  )

  const safelist = allColors.flatMap((color) => [
    `rl-color-${color}`
  ])

  return {
    name: "rimelight-ui",
    safelist,
    presets: [
      presetWind4(),
      presetTypography({
        cssExtend: {
          "h1,h2,h3,h4,h5,h6": {
            "font-family": "var(--font-sans), system-ui, sans-serif"
          },
          "p,li,blockquote,code": {
            "font-family": "var(--font-sans), system-ui, sans-serif"
          },
          "pre,code": {
            "font-family": "var(--font-mono), monospace"
          }
        }
      }),
      presetIcons({
        extraProperties: {
          "display": "inline-block",
          "vertical-align": "middle"
        }
      })
    ],
    transformers: [transformerDirectives(), transformerVariantGroup()],

    outputToCssLayers: true,
    layers: {
      theme: 1,
      preflights: 2,
      shortcuts: 3,
      default: 4
    },

    content: {
      pipeline: {
        include: [
          /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
          "src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}",
          uiSrcGlob,
          "../ui/src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}"
        ]
      },
      filesystem: [uiFilesystemGlob, "../ui/src/**/*", "src/components/**/*", "src/pages/**/*"]
    },

    shortcuts: {
      "container": "mx-auto w-full max-w-90rem px-md",
      "sr-only":
        "absolute w-px h-px p-0 m-0 overflow-hidden clip-rect-1-1-1-1 whitespace-nowrap border-0"
    },
    rules: [
      [
        /^clip-rect-(\d+)-(\d+)-(\d+)-(\d+)$/,
        ([, t, r, b, l]) => ({ clip: `rect(${t}px, ${r}px, ${b}px, ${l}px)` })
      ],
      [
        /^rl-color-(.+)$/,
        ([, color]) => ({
          "--rl-bg": `var(--color-${color}-500)`,
          "--rl-bg-hover": `var(--color-${color}-600)`,
          "--rl-text": `var(--color-${color}-600)`,
          "--rl-ring": `var(--color-${color}-500)`,
          "--rl-border": `var(--color-${color}-500)`,
          "--rl-bg-f": `var(--color-${color}-500-f)`,
          "--rl-bg-hover-f": `var(--color-${color}-600-f)`,
          "--rl-text-f": `var(--color-${color}-600-f)`,
          "--rl-ring-f": `var(--color-${color}-500-f)`,
          "--rl-border-f": `var(--color-${color}-500-f)`,
          "--rl-bg-l": `var(--color-${color}-500-l)`,
          "--rl-bg-hover-l": `var(--color-${color}-600-l)`,
          "--rl-text-l": `var(--color-${color}-600-l)`,
          "--rl-ring-l": `var(--color-${color}-500-l)`,
          "--rl-border-l": `var(--color-${color}-500-l)`,
          "--rl-bg-d": `var(--color-${color}-500-d)`,
          "--rl-bg-hover-d": `var(--color-${color}-600-d)`,
          "--rl-text-d": `var(--color-${color}-600-d)`,
          "--rl-ring-d": `var(--color-${color}-500-d)`,
          "--rl-border-d": `var(--color-${color}-500-d)`,
        })
      ],
      ["rl-flat", {
        "--rl-bg": "var(--rl-bg-f)",
        "--rl-bg-hover": "var(--rl-bg-hover-f)",
        "--rl-text": "var(--rl-text-f)",
        "--rl-ring": "var(--rl-ring-f)",
        "--rl-border": "var(--rl-border-f)",
      }],
      ["rl-light", {
        "--rl-bg": "var(--rl-bg-l)",
        "--rl-bg-hover": "var(--rl-bg-hover-l)",
        "--rl-text": "var(--rl-text-l)",
        "--rl-ring": "var(--rl-ring-l)",
        "--rl-border": "var(--rl-border-l)",
      }],
      ["rl-dark", {
        "--rl-bg": "var(--rl-bg-d)",
        "--rl-bg-hover": "var(--rl-bg-hover-d)",
        "--rl-text": "var(--rl-text-d)",
        "--rl-ring": "var(--rl-ring-d)",
        "--rl-border": "var(--rl-border-d)",
      }]
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
      colors: {
        "background": "var(--background)",
        "foreground": "var(--foreground)",
        "card": {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)"
        },
        "popover": {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)"
        },
        ...Object.fromEntries(allColors.map((color) => {
          const m = resolvedColors[color]!
          const shadeKeys = [...new Set([...Object.keys(m.light), ...Object.keys(m.dark), ...Object.keys(m.flat)])]
          return [color, createScale(color, shadeKeys)]
        })),
        "muted": {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)"
        },
        "accent": {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)"
        },
        "border": "var(--border)",
        "input": "var(--input)",
        "outline": "var(--outline)",
        "ring": "var(--ring)",
        "destructive": {
          DEFAULT: "var(--destructive)",
          subtle: "var(--color-destructive-subtle)"
        },
        "sidebar": {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: {
            DEFAULT: "var(--sidebar-primary)",
            foreground: "var(--sidebar-primary-foreground)"
          },
          accent: {
            DEFAULT: "var(--sidebar-accent)",
            foreground: "var(--sidebar-accent-foreground)"
          },
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)"
        },
        "chart": {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)"
        },
        "hover": "var(--color-hover)",
        "surface": "var(--color-surface)",
        "muted-strong": "var(--color-muted-strong)",
        "foreground-secondary": "var(--color-foreground-secondary)",
        "foreground-tertiary": "var(--color-foreground-tertiary)",
        "placeholder": "var(--color-placeholder)",
        "input-border": "var(--color-input-border)",
        "accent-subtle": "var(--color-accent-subtle)"
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
      animation: {
        keyframes: {
          "accordion-down":
            "{ from { height: 0; } to { height: var(--starwind-accordion-content-height); } }",
          "accordion-up":
            "{ from { height: var(--starwind-accordion-content-height); } to { height: 0; } }",
          "marquee": "{ from { transform: translateX(0); } to { transform: translateX(-100%); } }"
        },
        durations: {
          "accordion-down": "0.2s",
          "accordion-up": "0.2s",
          "marquee": "30s"
        },
        timingFns: {
          "accordion-down": "ease-out",
          "accordion-up": "ease-out",
          "marquee": "linear"
        },
        counts: { marquee: "infinite" }
      }
    },

    preflights: [
      {
        getCSS: () => {
          const lightLines = Object.entries(resolvedColors).flatMap(([color, modes]) =>
              Object.entries(modes.light).map(([shade, value]) =>
                `            --color-${color}-${shade}: ${value};`
              )
            ).join("\n")

          const flatLines = Object.entries(resolvedColors).flatMap(([color, modes]) => {
            const u = modes.flat
            return Object.entries(u).map(([shade, value]) =>
              `            --color-${color}-${shade}-f: ${value};`
            )
          }).join("\n")

          const lightPinnedLines = Object.entries(resolvedColors).flatMap(([color, modes]) =>
              Object.entries(modes.light).map(([shade, value]) =>
                `            --color-${color}-${shade}-l: ${value};`
              )
            ).join("\n")

          const darkPinnedLines = Object.entries(resolvedColors).flatMap(([color, modes]) =>
              Object.entries(modes.dark).map(([shade, value]) =>
                `            --color-${color}-${shade}-d: ${value};`
              )
            ).join("\n")

          const darkLines = Object.entries(resolvedColors).flatMap(([color, modes]) =>
              Object.entries(modes.dark).filter(([shade, value]) =>
                modes.light[shade] !== value
              ).map(([shade, value]) =>
                `            --color-${color}-${shade}: ${value};`
              )
            ).join("\n")

          return `
          :root {
            --background: #ffffff;
            --foreground: #030712;
            --card: #ffffff;
            --card-foreground: #030712;
            --popover: #ffffff;
            --popover-foreground: #030712;
            --primary: #f97316;
            --primary-foreground: #f9fafb;
            --primary-accent: #ea580c;
            --secondary: #8b5cf6;
            --secondary-foreground: #f9fafb;
            --secondary-accent: #7c3aed;
            --muted: #f3f4f6;
            --muted-foreground: #4b5563;
            --accent: #f3f4f6;
            --accent-foreground: #111827;
            --info: #3b82f6;
            --info-foreground: #ffffff;
            --info-accent: #2563eb;
            --success: #22c55e;
            --success-foreground: #ffffff;
            --success-accent: #16a34a;
            --warning: #f59e0b;
            --warning-foreground: #000000;
            --warning-accent: #d97706;
            --error: #ef4444;
            --error-foreground: #f9fafb;
            --error-accent: #dc2626;
            --commentary: #ec4899;
            --commentary-foreground: #f9fafb;
            --commentary-accent: #db2777;
            --ideation: #8b5cf6;
            --ideation-foreground: #f9fafb;
            --ideation-accent: #7c3aed;
            --source: #38bdf8;
            --source-foreground: #0f172a;
            --source-accent: #0284c7;
            --border: #e5e7eb;
            --input: #e5e7eb;
            --outline: #9ca3af;
            --ring: #9ca3af;
            --radius: 0.625rem;
            --sidebar: #f9fafb;
            --sidebar-foreground: #030712;
            --sidebar-primary: #1d4ed8;
            --sidebar-primary-foreground: #f9fafb;
            --sidebar-accent: #f3f4f6;
            --sidebar-accent-foreground: #111827;
            --sidebar-border: #e5e7eb;
            --sidebar-ring: #9ca3af;
            --chart-1: #3b82f6;
            --chart-2: #6366f1;
            --chart-3: #8b5cf6;
            --chart-4: #a855f7;
            --chart-5: #ec4899;
            --destructive: #ef4444;
            --color-surface: #ffffff;
            --color-muted-strong: #e5e7eb;
            --color-foreground-secondary: #4b5563;
            --color-foreground-tertiary: #6b7280;
            --color-placeholder: #9ca3af;
            --color-input-border: #d1d5db;
            --color-hover: #f3f4f6;
            --color-destructive-subtle: #fef2f2;
            --color-accent-subtle: #eff6ff;
            --font-sans: "Noto Sans", sans-serif;
            --font-serif: "Noto Serif", serif;
            --font-mono: "Noto Sans Mono", monospace;
${lightLines}
${flatLines}
${lightPinnedLines}
${darkPinnedLines}
          }

          .dark {
            --background: #030712;
            --foreground: #f9fafb;
            --card: #111827;
            --card-foreground: #f9fafb;
            --popover: #1f2937;
            --popover-foreground: #f9fafb;
            --primary: #f97316;
            --primary-foreground: #f9fafb;
            --primary-accent: #fb923c;
            --secondary: #8b5cf6;
            --secondary-foreground: #f9fafb;
            --secondary-accent: #a78bfa;
            --muted: #1f2937;
            --muted-foreground: #9ca3af;
            --accent: #374151;
            --accent-foreground: #f3f4f6;
            --info: #3b82f6;
            --info-foreground: #ffffff;
            --info-accent: #60a5fa;
            --success: #22c55e;
            --success-foreground: #ffffff;
            --success-accent: #4ade80;
            --warning: #f59e0b;
            --warning-foreground: #000000;
            --warning-accent: #fbbf24;
            --error: #ef4444;
            --error-foreground: #f9fafb;
            --error-accent: #f87171;
            --commentary: #f472b6;
            --commentary-foreground: #0f172a;
            --commentary-accent: #f9a8d4;
            --ideation: #a78bfa;
            --ideation-foreground: #0f172a;
            --ideation-accent: #c4b5fd;
            --source: #7dd3fc;
            --source-foreground: #0f172a;
            --source-accent: #bae6fd;
            --border: rgba(249, 250, 251, 0.1);
            --input: rgba(249, 250, 251, 0.15);
            --outline: #6b7280;
            --ring: #6b7280;
            --sidebar: #111827;
            --sidebar-foreground: #f9fafb;
            --sidebar-primary: #1d4ed8;
            --sidebar-primary-foreground: #f9fafb;
            --sidebar-accent: #1f2937;
            --sidebar-accent-foreground: #f3f4f6;
            --sidebar-border: #1f2937;
            --sidebar-ring: #6b7280;
            --chart-1: #60a5fa;
            --chart-2: #818cf8;
            --chart-3: #a78bfa;
            --chart-4: #c084fc;
            --chart-5: #f472b6;
            --destructive: #f87171;
            --color-surface: #1f2937;
            --color-muted-strong: #374151;
            --color-foreground-secondary: #d1d5db;
            --color-foreground-tertiary: #9ca3af;
            --color-placeholder: #6b7280;
            --color-input-border: #4b5563;
            --color-hover: #374151;
            --color-destructive-subtle: #451a1a;
            --color-accent-subtle: #1e293b;
${darkLines}
          }

          * {
            border-color: var(--border);
            outline-color: rgba(156, 163, 175, 0.5);
          }

          body {
            background-color: var(--background);
            color: var(--foreground);
            font-family: var(--font-sans);
          }

          button {
            cursor: pointer;
          }

          ::selection {
            background-color: var(--primary);
            color: var(--primary-foreground);
          }

          @view-transition {
            navigation: auto;
          }
        `
        }
      }
    ],

    async configResolved(config) {
      if (process.env.NODE_ENV === "development" && !process.env.UNO_CONFIG_LOGGED) {
        process.env.UNO_CONFIG_LOGGED = "true"

        console.log(
          `[UnoCSS] Config resolved. Presets: ${config.presets.map((p) => p.name).join(", ")}`
        )
        console.log(`[UnoCSS] Total rules: ${config.rules.length}`)
        console.log(`[UnoCSS] Total shortcuts: ${Object.keys(config.shortcuts).length}`)

        const ruleNames = config.rules.map((r) => (Array.isArray(r) ? r[0].toString() : "dynamic"))
        const duplicates = ruleNames.filter((item, index) => ruleNames.indexOf(item) !== index)
        const filteredDuplicates = duplicates.filter((d) => d !== "/^(.+?)-(\\$.+)$/")

        if (filteredDuplicates.length > 0) {
          console.warn(`[UnoCSS] Potential Rule Collisions: ${filteredDuplicates.join(", ")}`)
        }
      }
    }
  }
})
