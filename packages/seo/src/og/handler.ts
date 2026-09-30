import {
  NOTO_SANS,
  defaultOgLayout,
  loadOgFonts,
  type OgFontConfig,
  type OgLayoutOptions
} from "../og.js";
import type { OgRouteOptions } from "../types.js";

export interface OgHandlerOptions extends OgRouteOptions {
  font?: OgFontConfig;
  allowedImageDomains?: string[];
}

/**
 * Generic Web Request handler for dynamic Open Graph image generation. Enforces strict input
 * bounding (title <= 200 chars, description <= 300 chars) and aggressive CDN cache headers.
 */
export async function handleOgRequest(
  request: Request,
  options: OgHandlerOptions = {}
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    const rawTitle = params.get("title") || params.get("text") || options.brand || "Rimelight";
    const rawDescription = params.get("description") || "";
    const badge = params.get("badge") || params.get("type") || undefined;
    const isDocs = params.get("isDocs") === "true" || url.pathname.includes("docs");

    const brand = params.get("brand") || options.brand || "Rimelight";
    const background =
      (params.get("bg") as any) ||
      (isDocs ? options.docsBackground || "gradient" : options.defaultBackground || "dark");
    const preview = params.get("preview") === "true";

    // Strict input bounds per RFC (DoS mitigation)
    const title = rawTitle.slice(0, 200);
    const description = rawDescription ? rawDescription.slice(0, 300) : undefined;

    const layoutOptions: OgLayoutOptions = {
      title,
      brand,
      background,
      preview,
      ...(description !== undefined && { description }),
      ...(badge !== undefined && { badge })
    };

    const font = options.font || NOTO_SANS;
    const vnode = defaultOgLayout(layoutOptions, font);

    // Lazy load Takumi renderer
    const { renderTakumi } = await import("../takumi.js");
    const { regular, bold } = await loadOgFonts(font);

    const pngBuffer = await renderTakumi(vnode, {
      width: 1200,
      height: 630,
      fonts: [
        { name: font.name, data: regular, weight: 400, style: "normal" },
        { name: font.name, data: bold, weight: 700, style: "normal" }
      ]
    });

    return new Response(new Blob([new Uint8Array(pngBuffer)], { type: "image/png" }), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, max-age=604800"
      }
    });
  } catch (error) {
    console.error("[OG Handler Error]:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to render Open Graph image",
        message: error instanceof Error ? error.message : String(error)
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store"
        }
      }
    );
  }
}
