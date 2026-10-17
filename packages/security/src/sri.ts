import { createHash } from "node:crypto";

export function hashContent(buffer: Buffer | ArrayBuffer | Uint8Array | string): string {
  const hash = createHash("sha384")
    .update(buffer as any)
    .digest("base64");
  return `sha384-${hash}`;
}

export async function fetchRemoteSriManifest(
  externalUrls: string[],
): Promise<Record<string, string>> {
  const manifest: Record<string, string> = {};

  await Promise.all(
    externalUrls.map(async (url) => {
      if (!url.startsWith("https://")) return;
      try {
        const parsed = new URL(url);
        if (parsed.hostname.includes("*")) return;
        const pathname = parsed.pathname;
        if (pathname === "/" || pathname === "" || pathname.endsWith("/")) return;

        const response = await fetch(url);
        if (!response.ok) return;
        const buffer = await response.arrayBuffer();
        manifest[url] = hashContent(buffer);
      } catch {}
    }),
  );

  return manifest;
}
