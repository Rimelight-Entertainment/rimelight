/**
 * WASM-only Takumi render pipeline.
 *
 * Rimelight runs purely on edge (workerd) runtimes -- never Node -- so this module talks directly
 * to `@takumi-rs/wasm` instead of the `takumi-js` multi-runtime wrapper. That drops the
 * `@takumi-rs/core` native binaries (one per OS/arch) from installs and guarantees no native loader
 * code can end up in the worker bundle.
 *
 * Semantics mirror `takumi-js`'s `render()`: JSX-style element (or HTML string, or raw Takumi node)
 * -> emoji extraction -> remote-image collection -> render, with extracted CSS merged after caller
 * CSS.
 */
import type { CssInput, Node } from "@takumi-rs/helpers";
import type { EmojiType } from "@takumi-rs/helpers/emoji";
import type { FromJsxOptions } from "@takumi-rs/helpers/jsx";
import type {
  ImagesInput,
  Renderer as WasmRenderer,
  RenderOptions as WasmRenderOptions,
} from "@takumi-rs/wasm";

/**
 * Anything `renderTakumi()` accepts: a JSX-style element tree (what `defaultOgLayout()` builds), an
 * HTML string, or a pre-built Takumi node.
 */
export type TakumiInput = object | string;

/**
 * Wrapper-level options on top of the WASM backend's `RenderOptions`. Same shape as `takumi-js`'s
 * `render()` options minus the `renderer`/`module` managed-renderer plumbing (the WASM backend is
 * the only backend here).
 */
export type TakumiRenderOptions = Omit<WasmRenderOptions, "images" | "css"> & {
  /**
   * CSS applied before rendering -- one entry or a list cascading in order. Extracted template CSS
   * is appended after these.
   */
  css?: CssInput | readonly CssInput[];
  /**
   * Images for the render: pre-fetched entries, or an object controlling how remote images (and
   * emoji glyphs) are fetched.
   */
  images?: ImagesInput;
  /**
   * Options forwarded to the JSX transform.
   */
  jsx?: FromJsxOptions;
  /**
   * Emoji provider. `"from-font"` skips remote emoji fetching and sources glyphs from the loaded
   * fonts instead.
   *
   * @default "twemoji"
   */
  emoji?: EmojiType | "from-font";
  /**
   * Abort signal for the whole pipeline.
   */
  signal?: AbortSignal;
};

let rendererPromise: Promise<WasmRenderer> | undefined;

/**
 * Loads and initializes the WASM backend once per isolate, then reuses the `Renderer`. Mirrors
 * `takumi-js`'s backend init: prefers a caller-supplied module, falls back to the per-bundler
 * binary (`workerd` -> compiled Module, `node` -> bytes read from disk, default -> `?url` asset).
 * `@takumi-rs/wasm` guards against double init, so this is a no-op when the backend
 * self-initialized on import (Node).
 */
async function getRenderer(): Promise<WasmRenderer> {
  rendererPromise ??= (async () => {
    const wasm = await import("@takumi-rs/wasm");
    const auto = await import("@takumi-rs/wasm/auto");

    const source: unknown = auto.default;
    const resolved = typeof source === "function" ? await source() : await source;
    const input =
      resolved !== null && typeof resolved === "object" && "default" in resolved
        ? (resolved as { default: unknown }).default
        : resolved;

    // Same call `takumi-js` makes; `undefined` keeps self-initialized backends as-is.
    await wasm.default(
      (input ? { module_or_path: input } : undefined) as Parameters<typeof wasm.default>[0],
    );
    return new wasm.Renderer();
  })().catch((error: unknown) => {
    rendererPromise = undefined;
    throw error;
  });
  return rendererPromise;
}

function isTakumiNode(element: unknown): element is Node {
  if (typeof element !== "object" || element === null || !("type" in element)) return false;
  const type = (element as { type: unknown }).type;
  return type === "container" || type === "text" || type === "image";
}

/**
 * Renders a JSX-style element, HTML string, or Takumi node to image bytes (default PNG) using the
 * WASM backend.
 */
export async function renderTakumi(
  element: TakumiInput,
  options: TakumiRenderOptions = {},
): Promise<Uint8Array> {
  options.signal?.throwIfAborted();
  const renderer = await getRenderer();

  let node: Node;
  let extractedCss: CssInput[] = [];
  if (isTakumiNode(element)) {
    node = element;
  } else if (typeof element === "string") {
    const { fromHtml } = await import("@takumi-rs/helpers/html");
    const out = fromHtml(element);
    node = out.node;
    extractedCss = [...out.css];
  } else {
    const { fromJsx } = await import("@takumi-rs/helpers/jsx");
    const out = await fromJsx(element, options.jsx);
    node = out.node;
    extractedCss = [...out.css];
  }

  const emojiType = options.emoji ?? "twemoji";
  if (emojiType !== "from-font") {
    const { extractEmojis } = await import("@takumi-rs/helpers/emoji");
    node = extractEmojis(node, emojiType);
  }

  const { prepareImages } = await import("@takumi-rs/helpers");
  type PrepareParams = import("@takumi-rs/helpers").PrepareImagesOptions<
    import("@takumi-rs/wasm").ImageLoader
  >;
  const imagesOption = options.images;
  const { sources, fetchCache, fetch, timeout, maxBytes, allowUrl, cache } = (
    Array.isArray(imagesOption) ? { sources: imagesOption } : (imagesOption ?? {})
  ) as PrepareParams & {
    cache?: import("@takumi-rs/wasm").ImageLoader extends { cache?: infer C } ? C : never;
  };
  // `exactOptionalPropertyTypes` forbids passing explicit `undefined` for optional
  // fields, so only forward keys that are actually set.
  const params: PrepareParams = { node };
  if (sources !== undefined) params.sources = sources;
  if (fetchCache !== undefined) params.fetchCache = fetchCache;
  if (fetch !== undefined) params.fetch = fetch;
  if (timeout !== undefined) params.timeout = timeout;
  if (maxBytes !== undefined) params.maxBytes = maxBytes;
  if (allowUrl !== undefined) params.allowUrl = allowUrl;
  if (options.signal !== undefined) params.signal = options.signal;
  const prepared = await prepareImages(params);
  const images: ImagesInput = cache
    ? prepared.map((image) => ({
        ...image,
        cache: ("cache" in image ? image.cache : undefined) ?? cache,
      }))
    : prepared;

  options.signal?.throwIfAborted();

  const { css, jsx: _jsx, images: _images, emoji: _emoji, ...forward } = options;
  return renderer.render(node, {
    ...forward,
    images,
    css: [...(css !== undefined ? (Array.isArray(css) ? css : [css]) : []), ...extractedCss],
  });
}
