/** Only https links are rendered as links or iframes: `javascript:`, `data:` and plain http are refused. */
export function isSafeHttpUrl(raw: string): boolean {
  try {
    return new URL(raw.trim()).protocol === "https:";
  } catch {
    return false;
  }
}

const VIDEO_ID = /^[\w-]+$/;

/**
 * The iframe `src` for a YouTube or Vimeo page URL, or `null` when the URL isn't a recognised
 * video (the caller then shows a plain link). YouTube uses the privacy-enhanced domain.
 */
export function toEmbedUrl(raw: string): string | null {
  if (!isSafeHttpUrl(raw)) return null;
  const url = new URL(raw.trim());
  const host = url.hostname.replace(/^(www|m)\./, "");
  const segments = url.pathname.split("/").filter(Boolean);

  if (host === "youtube.com") {
    const id = url.searchParams.get("v") ?? (segments[0] === "embed" ? segments[1] : undefined);
    return id && VIDEO_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "youtu.be") {
    const id = segments[0];
    return id && VIDEO_ID.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  }
  if (host === "vimeo.com") {
    const id = segments[0];
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}
