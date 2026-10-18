import { defaultOgLayout, type OgLayoutOptions } from "./index";
import type { OgRouteOptions } from "../types";

export interface OgHandlerOptions extends OgRouteOptions {
  allowedImageDomains?: string[];
}

/**
 * Generic Web Request handler for dynamic Open Graph image generation.
 * Emits pure vector SVG (1200x630) with strict input bounding and CDN cache headers.
 */
export async function handleOgRequest(
  request: Request,
  options: OgHandlerOptions = {},
): Promise<Response> {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    const rawTitle = params.get("title") || params.get("text") || options.brand || "Rimelight";
    const rawDescription = params.get("description") || "";
    const badge = params.get("badge") || params.get("type") || undefined;
    const isDocs = params.get("isDocs") === "true" || url.pathname.includes("docs");
    const date = params.get("date") || undefined;

    const brand = params.get("brand") || options.brand || "Rimelight";
    const background =
      (params.get("bg") as any) ||
      (isDocs ? options.docsBackground || "gradient" : options.defaultBackground || "dark");
    const preview = params.get("preview") === "true";

    const title = rawTitle.slice(0, 200);
    const description = rawDescription ? rawDescription.slice(0, 300) : undefined;

    const layoutOptions: OgLayoutOptions = {
      title,
      brand,
      background,
      preview,
      ...(description !== undefined && { description }),
      ...(badge !== undefined && { badge }),
      ...(date !== undefined && { date }),
    };

    const svg = defaultOgLayout(layoutOptions);

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
        "CDN-Cache-Control": "public, max-age=604800",
      },
    });
  } catch (error) {
    console.error("[OG Handler Error]:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to render Open Graph image",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
