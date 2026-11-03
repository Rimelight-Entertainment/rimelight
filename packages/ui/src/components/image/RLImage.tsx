import type { RLImageProps, ImageMetadata } from "./image.types";
import { RLImageTheme } from "./image.theme";
import { createEffect, createSignal, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

const urlOf = (v?: string | ImageMetadata): string | undefined =>
  typeof v === "string" ? v : (v as ImageMetadata | undefined)?.src;

const widthOf = (v?: string | ImageMetadata): string | number | undefined =>
  v && typeof v !== "string" ? (v as ImageMetadata).width : undefined;

const heightOf = (v?: string | ImageMetadata): string | number | undefined =>
  v && typeof v !== "string" ? (v as ImageMetadata).height : undefined;

const formatOf = (v?: string | ImageMetadata): string | undefined =>
  v && typeof v !== "string" ? (v as ImageMetadata).format : undefined;

const OMIT_KEYS = [
  "src",
  "lightSrc",
  "darkSrc",
  "mobileSrc",
  "desktopSrc",
  "breakpoint",
  "formats",
  "widths",
  "sizes",
  "densities",
  "alt",
  "height",
  "width",
  "loading",
  "decoding",
  "caption",
  "figure",
  "lightbox",
  "metadata",
  "open",
  "metaSource",
  "metaFormat",
  "metaDimensions",
  "metaSize",
  "metaAlt",
  "metaDownload",
] as const;

export const RLImage: Component<RLImageProps> = (props) => {
  const { classes, rest, slots } = RLImageTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["captionSlot", "triggerSlot"] as const,
  });

  const isInteractive = () => props.lightbox ?? true;
  const isFigure = () => props.figure ?? Boolean(props.caption);
  const isResponsive = () => Boolean(props.mobileSrc && props.desktopSrc);
  const effectiveLight = () =>
    props.lightSrc || (!props.darkSrc ? props.src : props.src || props.lightSrc);
  const effectiveDark = () => props.darkSrc;
  const hasColorMode = () =>
    !isResponsive() &&
    Boolean(effectiveLight() && effectiveDark() && effectiveLight() !== effectiveDark());
  const breakpointVal = () => props.breakpoint ?? 768;
  const activeSrc = () => (isResponsive() ? props.desktopSrc : effectiveLight() || props.src);

  const activeUrl = () => urlOf(activeSrc());
  const lightUrl = () => (effectiveLight() ? (urlOf(effectiveLight()) ?? "") : "");
  const darkUrl = () => (effectiveDark() ? (urlOf(effectiveDark()) ?? "") : "");

  const imgWidth = () => props.width ?? widthOf(activeSrc());
  const imgHeight = () => props.height ?? heightOf(activeSrc());
  const imgFormat = () => formatOf(activeSrc()) ?? props.metadata?.format;
  const fileName = () => {
    const url = activeUrl();
    const rawName = url ? url.split("/").pop() || "image" : "image";
    return rawName.split("?")[0] ?? "";
  };
  const fileExtension = () => {
    const fmt = imgFormat();
    if (fmt) return fmt.toUpperCase();
    const fn = fileName();
    return fn.includes(".") ? (fn.split(".").pop()?.toUpperCase() ?? "IMG") : "IMG";
  };

  const alt = () => props.alt ?? "";
  const loading = () => props.loading ?? "lazy";
  const decoding = () => props.decoding ?? "async";

  // Always set `src` so server HTML includes it. Native `loading="lazy"` already defers the fetch.
  const show = () => true;
  const [status, setStatus] = createSignal<"loading" | "ok" | "error">("loading");
  const [open, setOpen] = createSignal(() => Boolean(props.open));
  const [zoom, setZoom] = createSignal(false);
  const [metaSizeTxt, setMetaSizeTxt] = createSignal<string>(() =>
    props.metadata?.size !== undefined ? `${props.metadata.size} bytes` : "fetching...",
  );
  const [metaFormatTxt, setMetaFormatTxt] = createSignal<string>(() => fileExtension());

  let dialogRef: HTMLDialogElement | undefined;
  let fetched = false;

  const handleError = () => setStatus("error");
  const handleLoad = () => setStatus("ok");

  const activeModalSrc = () => {
    if (typeof document === "undefined") return activeUrl() ?? "";
    const rootTheme = document.documentElement.getAttribute("data-theme");
    const isDark =
      rootTheme === "dark" ||
      (typeof window !== "undefined" &&
        (window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false) &&
        rootTheme !== "light");
    if (isDark && darkUrl()) return darkUrl();
    return lightUrl() || activeUrl() || "";
  };

  const openDialog = () => setOpen(true);

  const handleDownload = async () => {
    const url = activeModalSrc();
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = (url.split("/").pop() || "").split("?")[0] || `image-${Date.now()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  createEffect(
    () => ({ isOpen: open(), src: activeModalSrc() }),
    ({ isOpen, src }) => {
      const dialog = dialogRef;
      if (!dialog) return;
      if (isOpen) {
        if (!dialog.open) dialog.showModal();
        if (!fetched) {
          fetched = true;
          if (src) {
            fetch(src)
              .then((r) => r.blob())
              .then((blob) => {
                setMetaSizeTxt(`${(blob.size / 1024).toFixed(2)} KB`);
                const mime = blob.type.split("/").pop()?.toUpperCase();
                if (mime && mime !== "OCTET-STREAM") setMetaFormatTxt(mime);
              })
              .catch(() => setMetaSizeTxt("unavailable"));
          }
        }
      } else if (dialog.open) {
        dialog.close();
      }
    },
  );

  const fallbackBox = () => (
    <div class="flex w-full h-full min-h-40 items-center justify-center gap-2 rounded-lg bg-elevated text-muted">
      <RLIcon name="image" class="size-8" aria-hidden="true" />
      <span class="text-sm">{uiT("image.unavailable")}</span>
    </div>
  );

  const triggerImage = () => {
    if (status() === "error") return fallbackBox();

    if (isResponsive()) {
      return (
        <picture>
          <source
            media={`(max-width: ${breakpointVal() - 1}px)`}
            srcset={show() ? urlOf(props.mobileSrc) : undefined}
          />
          <source
            media={`(min-width: ${breakpointVal()}px)`}
            srcset={show() ? urlOf(props.desktopSrc) : undefined}
          />
          <img
            src={show() ? urlOf(props.desktopSrc) : undefined}
            alt={alt()}
            loading={loading()}
            decoding={decoding()}
            class={classes().triggerImage}
            onError={handleError}
            onLoad={handleLoad}
          />
        </picture>
      );
    }

    if (hasColorMode()) {
      return (
        <div class="rl-image-color-mode w-full h-full relative overflow-hidden rounded-[inherit] flex items-center justify-center">
          <img
            src={show() ? lightUrl() : undefined}
            alt={alt()}
            loading={loading()}
            decoding={decoding()}
            class={`${classes().triggerImage} rl-img-light w-full h-full object-cover rounded-[inherit]`}
            onError={handleError}
            onLoad={handleLoad}
          />
          <img
            src={show() ? darkUrl() : undefined}
            alt={alt()}
            loading={loading()}
            decoding={decoding()}
            class={`${classes().triggerImage} rl-img-dark w-full h-full object-cover rounded-[inherit] hidden`}
          />
        </div>
      );
    }

    return (
      <img
        src={show() ? activeUrl() : undefined}
        alt={alt()}
        loading={loading()}
        decoding={decoding()}
        width={imgWidth() !== undefined ? String(imgWidth()) : undefined}
        height={imgHeight() !== undefined ? String(imgHeight()) : undefined}
        sizes={props.sizes}
        class={classes().triggerImage}
        onError={handleError}
        onLoad={handleLoad}
      />
    );
  };

  const renderTrigger = () =>
    slots.triggerSlot() ? (
      slots.triggerSlot()
    ) : isInteractive() ? (
      <button type="button" class={classes().trigger} data-image-trigger onClick={openDialog}>
        {triggerImage()}
      </button>
    ) : (
      <div class="overflow-hidden rounded-[inherit] block">{triggerImage()}</div>
    );

  return (
    <div class={classes().root} data-slot="root" data-theme={props.theme} {...rest}>
      {isFigure() ? (
        <figure class={classes().figure} data-slot="figure">
          {renderTrigger()}
          {props.caption && (
            <figcaption class={classes().caption} data-slot="caption">
              {props.caption}
            </figcaption>
          )}
          {slots.captionSlot()}
        </figure>
      ) : (
        <>
          {renderTrigger()}
          {props.caption && (
            <p class={classes().caption} data-slot="caption">
              {props.caption}
            </p>
          )}
          {slots.captionSlot()}
        </>
      )}

      {isInteractive() && (
        <dialog
          ref={(el) => (dialogRef = el)}
          class={classes().dialog}
          data-image-dialog
          onClose={() => setOpen(false)}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div class="flex flex-col bg-default text-highlighted max-h-[90vh]">
            <div
              class="flex-1 min-h-0 flex items-center justify-center p-4 overflow-hidden"
              onClick={() => setZoom(!zoom())}
            >
              {status() === "error" ? (
                fallbackBox()
              ) : isResponsive() ? (
                <picture class="max-w-full max-h-[65vh] flex items-center justify-center overflow-hidden">
                  <source
                    media={`(max-width: ${breakpointVal() - 1}px)`}
                    srcset={show() ? urlOf(props.mobileSrc) : undefined}
                  />
                  <source
                    media={`(min-width: ${breakpointVal()}px)`}
                    srcset={show() ? urlOf(props.desktopSrc) : undefined}
                  />
                  <img
                    src={show() ? urlOf(props.desktopSrc) : undefined}
                    alt={alt()}
                    class={`${classes().image}${zoom() ? " max-w-none max-h-none" : ""}`}
                    data-modal-img
                  />
                </picture>
              ) : hasColorMode() ? (
                <div class="rl-image-color-mode max-w-full max-h-[65vh] relative flex items-center justify-center overflow-hidden">
                  <img
                    src={show() ? lightUrl() : undefined}
                    alt={alt()}
                    class={`${classes().image} rl-img-light${zoom() ? " max-w-none max-h-none" : ""}`}
                    data-modal-img
                    data-light-src={lightUrl()}
                    data-dark-src={darkUrl()}
                  />
                  <img
                    src={show() ? darkUrl() : undefined}
                    alt={alt()}
                    class={`${classes().image} rl-img-dark hidden${zoom() ? " max-w-none max-h-none" : ""}`}
                    data-modal-img-dark
                  />
                </div>
              ) : (
                <img
                  src={show() ? activeUrl() : undefined}
                  alt={alt()}
                  class={`${classes().image}${zoom() ? " max-w-none max-h-none" : ""}`}
                  data-modal-img
                />
              )}
            </div>

            <hr class="border-default mx-4 mb-3 shrink-0" />

            <div class={classes().fileInfo}>
              <div class="flex flex-col gap-xs text-sm">
                {props.metaSource !== false && (
                  <div class="flex flex-row gap-xs items-center">
                    <RLIcon name="image" class="size-4 shrink-0 text-muted" aria-hidden="true" />
                    <span class="text-muted">{uiT("image.source")}</span>
                    <span class="text-dimmed truncate max-w-[40vw]">{fileName()}</span>
                  </div>
                )}
                {props.metaFormat !== false && (
                  <div class="flex flex-row gap-xs items-center">
                    <RLIcon
                      name="file-question-mark"
                      class="size-4 shrink-0 text-muted"
                      aria-hidden="true"
                    />
                    <span class="text-muted">{uiT("image.format")}</span>
                    <span class="text-dimmed" data-metadata-format>
                      {metaFormatTxt()}
                    </span>
                  </div>
                )}
                {props.metaDimensions !== false && (
                  <div class="flex flex-row gap-xs items-center">
                    <RLIcon
                      name="image-upscale"
                      class="size-4 shrink-0 text-muted"
                      aria-hidden="true"
                    />
                    <span class="text-muted">{uiT("image.dimensions")}</span>
                    <span class="text-dimmed">
                      {imgWidth() || "?"} x {imgHeight() || "?"}
                    </span>
                  </div>
                )}
                {props.metaSize !== false && (
                  <div class="flex flex-row gap-xs items-center">
                    <RLIcon
                      name="hard-drive"
                      class="size-4 shrink-0 text-muted"
                      aria-hidden="true"
                    />
                    <span class="text-muted">{uiT("image.size")}</span>
                    <span class="text-dimmed" data-metadata-size>
                      {metaSizeTxt()}
                    </span>
                  </div>
                )}
                {props.metaAlt !== false && (
                  <div class="flex flex-row gap-xs items-center">
                    <RLIcon
                      name="align-left"
                      class="size-4 shrink-0 text-muted"
                      aria-hidden="true"
                    />
                    <span class="text-muted">{uiT("image.alt")}</span>
                    <span
                      class={`text-dimmed truncate max-w-[30vw]${alt() ? "" : " italic opacity-50"}`}
                    >
                      {alt() || "none"}
                    </span>
                  </div>
                )}
              </div>

              {props.metaDownload !== false && (
                <button
                  type="button"
                  class={classes().download}
                  data-image-download
                  onClick={handleDownload}
                >
                  <RLIcon name="download" class="size-4 shrink-0" aria-hidden="true" />
                  Download Original
                </button>
              )}
            </div>

            <form method="dialog" class="absolute top-2 right-2">
              <button
                type="submit"
                class={classes().closeButton}
                aria-label={uiT("actions.close")}
                onClick={() => setOpen(false)}
              >
                <RLIcon name="x" class="size-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </dialog>
      )}

      <style>{`
        :root[data-theme="dark"] .rl-img-light,
        [data-theme="dark"] .rl-img-light,
        [data-theme="dark"] .rl-image-color-mode .rl-img-light,
        .rl-image-color-mode[data-theme="dark"] .rl-img-light {
          display: none !important;
        }

        :root[data-theme="dark"] .rl-img-dark,
        [data-theme="dark"] .rl-img-dark,
        [data-theme="dark"] .rl-image-color-mode .rl-img-dark,
        .rl-image-color-mode[data-theme="dark"] .rl-img-dark {
          display: block !important;
        }

        :root[data-theme="light"] .rl-img-light,
        [data-theme="light"] .rl-img-light,
        [data-theme="light"] .rl-image-color-mode .rl-img-light,
        .rl-image-color-mode[data-theme="light"] .rl-img-light {
          display: block !important;
        }

        :root[data-theme="light"] .rl-img-dark,
        [data-theme="light"] .rl-img-dark,
        [data-theme="light"] .rl-image-color-mode .rl-img-dark,
        .rl-image-color-mode[data-theme="light"] .rl-img-dark {
          display: none !important;
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .rl-img-light {
            display: none !important;
          }
          :root:not([data-theme="light"]) .rl-img-dark {
            display: block !important;
          }
          :root:not([data-theme="light"]) [data-theme="light"] .rl-img-light {
            display: block !important;
          }
          :root:not([data-theme="light"]) [data-theme="light"] .rl-img-dark {
            display: none !important;
          }
        }

        @supports (background-image: light-dark(none, none)) {
          .rl-image-color-mode {
            background-image: light-dark(var(--rl-img-light), var(--rl-img-dark));
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
          }
          .rl-image-color-mode > .rl-img-light,
          .rl-image-color-mode > .rl-img-dark {
            opacity: 0 !important;
            visibility: hidden !important;
          }
        }
      `}</style>
    </div>
  );
};
