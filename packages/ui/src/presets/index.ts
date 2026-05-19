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

const __dirname = dirname(fileURLToPath(import.meta.url))
const uiSrcGlob = join(__dirname, "../**/*.{js,ts,jsx,tsx,vue,svelte,astro}")
const uiFilesystemGlob = join(__dirname, "../**/*")

const createScale = (colorName: string) => ({
  DEFAULT: `var(--${colorName})`,
  foreground: `var(--${colorName}-foreground)`,
  accent: `var(--${colorName}-accent)`,
  "50": `var(--color-${colorName}-50)`,
  "100": `var(--color-${colorName}-100)`,
  "200": `var(--color-${colorName}-200)`,
  "300": `var(--color-${colorName}-300)`,
  "400": `var(--color-${colorName}-400)`,
  "500": `var(--color-${colorName}-500)`,
  "600": `var(--color-${colorName}-600)`,
  "700": `var(--color-${colorName}-700)`,
  "800": `var(--color-${colorName}-800)`,
  "900": `var(--color-${colorName}-900)`,
  "950": `var(--color-${colorName}-950)`
})

export default definePreset(() => {
  return {
    name: "rimelight-ui",
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
        "primary": createScale("primary"),
        "secondary": createScale("secondary"),
        "muted": {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)"
        },
        "accent": {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)"
        },
        "info": createScale("info"),
        "success": createScale("success"),
        "warning": createScale("warning"),
        "error": createScale("error"),
        "commentary": createScale("commentary"),
        "ideation": createScale("ideation"),
        "source": createScale("source"),
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

    preflights: [],

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
