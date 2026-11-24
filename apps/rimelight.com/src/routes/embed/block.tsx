import { type ComponentProps, createSignal, onSettled, Show } from "solid-js";
import { BlockRenderer } from "@rimelight/cms/solid";
import { siteBlockRenderers } from "#components/blocks";

type Block = ComponentProps<typeof BlockRenderer>["block"];

/**
 * Reads one block from the URL fragment: base64url of the block's JSON object. Null when the fragment is missing,
 * is not base64url, or is not a JSON object with a string `type`.
 */
export function readBlockFromHash(hash: string): Block | null {
  const raw = hash.replace(/^#/, "");
  if (raw === "") return null;
  try {
    const base64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(padded), (ch) => ch.charCodeAt(0));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as { type?: unknown }).type === "string"
    ) {
      return parsed as Block;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Web-only block embed for the Rimelight Space app (CMS.6, decision 0049). The app opens
 * /embed/block#<base64url block JSON> in a native web view. There is no site chrome: this route sits outside the
 * [locale] folder and the (app) layout, so no header or footer renders.
 */
export default function EmbedBlockPage() {
  const [block, setBlock] = createSignal<Block | null>(null);

  onSettled(() => {
    const read = () => setBlock(() => readBlockFromHash(window.location.hash));
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  });

  return (
    <Show when={block()}>
      {(b) => <BlockRenderer block={b()} components={siteBlockRenderers} />}
    </Show>
  );
}
