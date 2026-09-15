import type { WebManifest, WebManifestOptions } from "./types.js"

/**
 * Build web app manifest (site.webmanifest) compliant with W3C Web App Manifest.
 */
export function buildWebManifest(options: WebManifestOptions): WebManifest {
  const {
    name,
    shortName = name,
    description = "",
    startUrl = "/",
    display = "standalone",
    backgroundColor = "#ffffff",
    themeColor = "#ffffff",
    icons = [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    shortcuts,
    categories,
    lang,
    dir,
    orientation,
    scope
  } = options

  return {
    name,
    short_name: shortName,
    ...(description ? { description } : {}),
    start_url: startUrl,
    display,
    background_color: backgroundColor,
    theme_color: themeColor,
    icons,
    ...(shortcuts ? { shortcuts } : {}),
    ...(categories ? { categories } : {}),
    ...(lang ? { lang } : {}),
    ...(dir ? { dir } : {}),
    ...(orientation ? { orientation } : {}),
    ...(scope ? { scope } : {})
  }
}
