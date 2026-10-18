export interface OgLayoutOptions {
  title: string;
  description?: string | undefined;
  brand?: string | object | undefined;
  badge?: string | undefined;
  date?: string | undefined;
  background?: "dark" | "gradient" | (string & {}) | undefined;
  preview?: boolean | undefined;
}

export interface OgRenderConfig {
  width?: number;
  height?: number;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

/**
 * Builds standard 1200x630 vector SVG Open Graph image markup.
 * Framework-agnostic, zero runtime dependencies, instant edge rendering.
 */
export function defaultOgLayout(options: OgLayoutOptions): string {
  const { title, description, brand, badge, date, background = "dark", preview = false } = options;

  const MAX_TITLE_LEN = 160;
  const MAX_DESC_LEN = 240;
  const safeTitle = escapeXml(
    title.length > MAX_TITLE_LEN ? title.slice(0, MAX_TITLE_LEN - 1) + "…" : title,
  );
  const safeDescription = description
    ? escapeXml(
        description.length > MAX_DESC_LEN
          ? description.slice(0, MAX_DESC_LEN - 1) + "…"
          : description,
      )
    : "";

  const brandText = escapeXml(
    typeof brand === "string"
      ? brand
      : brand && typeof brand === "object"
        ? "Rimelight"
        : (brand ?? "Rimelight"),
  );

  const isGradient = background === "gradient";
  const bgFill =
    background === "dark" ? "#0a0a0a" : isGradient ? "url(#bg-gradient)" : escapeXml(background);

  const accentBar = isGradient
    ? `<rect x="80" y="180" width="60" height="4" rx="2" fill="#60a5fa" />`
    : "";

  const titleFontSize = isGradient ? "52" : "56";
  const descColor = isGradient ? "#94a3b8" : "#a0a0a0";
  const descFontSize = isGradient ? "22" : "24";

  const badgeXml = badge
    ? (() => {
        const safeBadge = escapeXml(badge);
        const badgeWidth = safeBadge.length * 11 + 36;
        const fill = isGradient ? "rgba(96,165,250,0.15)" : "#1a1a1a";
        const stroke = isGradient ? "rgba(96,165,250,0.3)" : "#333333";
        const textColor = isGradient ? "#93c5fd" : "#e5e5e5";
        return `<g>
          <rect x="80" y="520" width="${badgeWidth}" height="38" rx="19" fill="${fill}" stroke="${stroke}" stroke-width="1" />
          <text x="${80 + badgeWidth / 2}" y="544" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="15" font-weight="600" fill="${textColor}">${safeBadge}</text>
        </g>`;
      })()
    : "";

  const dateXml = date
    ? `<text x="1120" y="545" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" fill="#666666">${escapeXml(date)}</text>`
    : "";

  const previewXml = preview
    ? `<g>
        <rect x="4" y="4" width="1192" height="622" fill="none" stroke="#ff4444" stroke-width="6" stroke-dasharray="16 8" />
        <rect x="1030" y="20" width="130" height="38" rx="4" fill="#ff4444" />
        <text x="1095" y="44" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#ffffff" letter-spacing="0.05em">PREVIEW</text>
      </g>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0a0a" />
      <stop offset="100%" stop-color="#1a1a2e" />
    </linearGradient>
    <style>
      .og-title { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: ${titleFontSize}px; font-weight: 700; fill: #ffffff; letter-spacing: -0.02em; }
      .og-desc { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: ${descFontSize}px; font-weight: 400; fill: ${descColor}; }
      .og-brand { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 28px; font-weight: 700; fill: #ffffff; letter-spacing: -0.02em; }
    </style>
  </defs>

  <rect width="1200" height="630" fill="${bgFill}" />

  <!-- Brand Row -->
  <text x="80" y="105" class="og-brand">${brandText}</text>

  <!-- Content -->
  ${accentBar}
  <text x="80" y="300" class="og-title">${safeTitle}</text>
  ${safeDescription ? `<text x="80" y="360" class="og-desc">${safeDescription}</text>` : ""}

  <!-- Footer Row -->
  ${badgeXml}
  ${dateXml}

  ${previewXml}
</svg>`;
}

/**
 * Renders an OG layout to an SVG `Response`.
 */
export async function renderOgResponse(
  options: OgLayoutOptions,
  _config: OgRenderConfig = {},
): Promise<Response> {
  const svg = defaultOgLayout(options);
  return new Response(svg, {
    status: 200,
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
      "CDN-Cache-Control": "public, max-age=31536000",
    },
  });
}

/**
 * Renders the default OG layout to an SVG `Response`.
 */
export async function renderDefaultOg(
  options: OgLayoutOptions,
  config: OgRenderConfig = {},
): Promise<Response> {
  return renderOgResponse(options, config);
}

export { handleOgRequest, type OgHandlerOptions } from "./handler";
export { createHonoOgHandler, type HonoContext } from "./hono";
