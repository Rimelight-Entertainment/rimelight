import { defineConfig } from "astro/config"
import cloudflare from "@astrojs/cloudflare"
import uno from "unocss/astro"
import icons from "unplugin-icons/vite"

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  integrations: [uno()],
  vite: {
    plugins: [
      icons({
        compiler: "astro"
      })
    ],
    resolve: {
      alias: {
        "@": "/src"
      }
    }
  }
})
