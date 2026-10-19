import type { WebManifest, WebManifestOptions } from "./types";

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
    icons = options.icons ?? [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts,
    categories,
    lang,
    dir,
    orientation,
    scope,
  } = options;

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
    ...(scope ? { scope } : {}),
  };
}
