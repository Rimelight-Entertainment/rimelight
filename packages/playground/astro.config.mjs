import { defineConfig } from "astro/config"
import { ui } from "@rimelight/ui"
import UnoCSS from "@unocss/astro"
import vue from "@astrojs/vue"

export default defineConfig({
  integrations: [UnoCSS(), vue(), ui()]
})
