import {
  defineConfig,
  type PresetWind4Theme
} from "unocss"

export default defineConfig<PresetWind4Theme>({
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        "src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}",
        "../ui/src/**/*.{js,ts,jsx,tsx,vue,svelte,astro}"
      ]
    },
    filesystem: ["../ui/src/**/*", "src/components/**/*", "src/pages/**/*"]
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
})
