import type { RLImageProps, ImageMetadata } from "./image.types";
import { RLImageTheme } from "./image.theme";
import { createEffect, createSignal, Show, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";
import { createControllable } from "../../controllable";
import { RLButton } from "../button/RLButton";
import { renderSlot } from "../../slot";

const urlOf = (v?: string | ImageMetadata): string | undefined =>
  typeof v === "string" ? v : v?.src;

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
  "onOpenChange",
] as const;

export const RLImage: Component<RLImageProps> = (props) => {
  const { Tag, classes, rest, slots, theme } = RLImageTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: ["captionSlot", "triggerSlot"] as const,
  });

  const isResponsive = () => Boolean(props.mobileSrc && props.desktopSrc);
  const effectiveLight = () => props.lightSrc || props.src;
  const hasColorMode = () =>
    !isResponsive() &&
    Boolean(effectiveLight() && props.darkSrc && effectiveLight() !== props.darkSrc);
  const breakpointVal = () => props.breakpoint ?? 768;
  const activeSrc = () => (isResponsive() ? props.desktopSrc : effectiveLight());
  const activeMeta = (): ImageMetadata | undefined => {
    const src = activeSrc();
    return typeof src === "string" ? undefined : src;
  };

  const activeUrl = () => urlOf(activeSrc());
  const lightUrl = () => urlOf(effectiveLight()) ?? "";
  const darkUrl = () => urlOf(props.darkSrc) ?? "";

  const imgWidth = () => props.width ?? activeMeta()?.width;
  const imgHeight = () => props.height ?? activeMeta()?.height;
  const imgWidthAttr = () => {
    const width = imgWidth();
    return width === undefined ? undefined : String(width);
  };
  const imgHeightAttr = () => {
    const height = imgHeight();
    return height === undefined ? undefined : String(height);
  };
  const fileName = () => {
    const url = activeUrl();
    const rawName = url ? url.split("/").pop() || "image" : "image";
    return rawName.split("?")[0] ?? "";
  };
  const fileExtension = () => {
    const fmt = activeMeta()?.format ?? props.metadata?.format;
    if (fmt) return fmt.toUpperCase();
    const fn = fileName();
    return fn.includes(".") ? (fn.split(".").pop()?.toUpperCase() ?? "IMG") : "IMG";
  };

  const alt = () => props.alt ?? "";
  const loading = () => props.loading ?? "lazy";
  const decoding = () => props.decoding ?? "async";

  const [status, setStatus] = createSignal<"loading" | "ok" | "error">("loading");
  const [open, setOpen] = createControllable(
    () => props.open,
    false,
    (next) => props.onOpenChange?.(next),
  );
  const [zoom, setZoom] = createSignal(false);
  const [metaSizeTxt, setMetaSizeTxt] = createSignal(
    props.metadata?.size !== undefined ? `${props.metadata.size} bytes` : uiT("image.fetching"),
  );
  const [metaFormatTxt, setMetaFormatTxt] = createSignal(fileExtension());

  const triggerLightClasses = RLImageTheme.use(props, () => ({ colorLayer: "light" }));
  const triggerDarkClasses = RLImageTheme.use(props, () => ({ colorLayer: "dark" }));
  const modalClasses = RLImageTheme.use(props, () => ({ modalZoom: zoom() ? "on" : "off" }));
  const modalLightClasses = RLImageTheme.use(props, () => ({
    modalZoom: zoom() ? "on" : "off",
    colorLayer: "light",
  }));
  const modalDarkClasses = RLImageTheme.use(props, () => ({
    modalZoom: zoom() ? "on" : "off",
    colorLayer: "dark",
  }));

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
    (state) => {
      const dialog = dialogRef;
      if (!dialog) return;
      if (state.isOpen) {
        if (!dialog.open) dialog.showModal();
        if (!fetched) {
          fetched = true;
          if (state.src) {
            fetch(state.src)
              .then((r) => r.blob())
              .then((blob) => {
                setMetaSizeTxt(`${(blob.size / 1024).toFixed(2)} KB`);
                const mime = blob.type.split("/").pop()?.toUpperCase();
                if (mime && mime !== "OCTET-STREAM") setMetaFormatTxt(mime);
              })
              .catch(() => setMetaSizeTxt(uiT("image.sizeUnavailable")));
          }
        }
      } else if (dialog.open) {
        dialog.close();
      }
    },
  );

  const fallbackBox = () => (
    <div class={classes().fallback} data-slot="fallback">
      <RLIcon name="image" class={classes().fallbackIcon} aria-hidden="true" />
      <span class={classes().fallbackLabel}>{uiT("image.unavailable")}</span>
    </div>
  );

  const triggerImage = () => {
    if (status() === "error") return fallbackBox();

    if (isResponsive()) {
      return (
        <picture>
          <source media={`(max-width: ${breakpointVal() - 1}px)`} srcset={urlOf(props.mobileSrc)} />
          <source media={`(min-width: ${breakpointVal()}px)`} srcset={urlOf(props.desktopSrc)} />
          <img
            src={urlOf(props.desktopSrc)}
            alt={alt()}
            loading={loading()}
            decoding={decoding()}
            class={classes().triggerImage}
            data-slot="trigger-image"
            onError={handleError}
            onLoad={handleLoad}
          />
        </picture>
      );
    }

    if (hasColorMode()) {
      return (
        <div class={classes().colorMode} data-slot="color-mode">
          <img
            src={lightUrl()}
            alt={alt()}
            loading={loading()}
            decoding={decoding()}
            class={triggerLightClasses().triggerImage}
            data-slot="trigger-image"
            onError={handleError}
            onLoad={handleLoad}
          />
          <img
            src={darkUrl()}
            alt={alt()}
            loading={loading()}
            decoding={decoding()}
            class={triggerDarkClasses().triggerImage}
            data-slot="trigger-image"
          />
        </div>
      );
    }

    return (
      <img
        src={activeUrl()}
        alt={alt()}
        loading={loading()}
        decoding={decoding()}
        width={imgWidthAttr()}
        height={imgHeightAttr()}
        sizes={props.sizes}
        class={classes().triggerImage}
        data-slot="trigger-image"
        onError={handleError}
        onLoad={handleLoad}
      />
    );
  };

  const renderTrigger = () => (
    <Show
      when={slots.triggerSlot()}
      fallback={
        <Show
          when={props.lightbox ?? true}
          fallback={
            <div class={classes().staticTrigger} data-slot="static-trigger">
              {triggerImage()}
            </div>
          }
        >
          <RLButton
            type="button"
            variant="ghost"
            color="neutral"
            class={classes().trigger}
            data-slot="trigger"
            onClick={() => setOpen(true)}
          >
            {triggerImage()}
          </RLButton>
        </Show>
      }
    >
      {renderSlot(slots.triggerSlot())}
    </Show>
  );

  const previewContent = () => {
    if (status() === "error") return fallbackBox();

    if (isResponsive()) {
      return (
        <picture class={classes().previewPicture}>
          <source media={`(max-width: ${breakpointVal() - 1}px)`} srcset={urlOf(props.mobileSrc)} />
          <source media={`(min-width: ${breakpointVal()}px)`} srcset={urlOf(props.desktopSrc)} />
          <img
            src={urlOf(props.desktopSrc)}
            alt={alt()}
            class={modalClasses().image}
            data-slot="image"
          />
        </picture>
      );
    }

    if (hasColorMode()) {
      return (
        <div class={classes().previewColorMode}>
          <img src={lightUrl()} alt={alt()} class={modalLightClasses().image} data-slot="image" />
          <img src={darkUrl()} alt={alt()} class={modalDarkClasses().image} data-slot="image" />
        </div>
      );
    }

    return <img src={activeUrl()} alt={alt()} class={modalClasses().image} data-slot="image" />;
  };

  return (
    <Tag class={classes().root} data-theme={theme()} {...rest} data-slot="root">
      <Show
        when={props.figure ?? Boolean(props.caption)}
        fallback={
          <>
            {renderTrigger()}
            <Show when={props.caption}>
              {(caption) => (
                <p class={classes().caption} data-slot="caption">
                  {caption()}
                </p>
              )}
            </Show>
            {renderSlot(slots.captionSlot())}
          </>
        }
      >
        <figure class={classes().figure} data-slot="figure">
          {renderTrigger()}
          <Show when={props.caption}>
            {(caption) => (
              <figcaption class={classes().caption} data-slot="caption">
                {caption()}
              </figcaption>
            )}
          </Show>
          {renderSlot(slots.captionSlot())}
        </figure>
      </Show>

      <Show when={props.lightbox ?? true}>
        <dialog
          ref={(el) => (dialogRef = el)}
          class={classes().dialog}
          data-slot="dialog"
          onClose={() => setOpen(false)}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div class={classes().dialogBody}>
            <div class={classes().preview} onClick={() => setZoom(!zoom())}>
              {previewContent()}
            </div>

            <hr class={classes().divider} />

            <div class={classes().fileInfo} data-slot="file-info">
              <div class={classes().infoList}>
                <Show when={props.metaSource !== false}>
                  <div class={classes().infoRow}>
                    <RLIcon name="image" class={classes().infoIcon} aria-hidden="true" />
                    <span class={classes().infoLabel}>{uiT("image.source")}</span>
                    <span class={classes().infoSource}>{fileName()}</span>
                  </div>
                </Show>
                <Show when={props.metaFormat !== false}>
                  <div class={classes().infoRow}>
                    <RLIcon
                      name="file-question-mark"
                      class={classes().infoIcon}
                      aria-hidden="true"
                    />
                    <span class={classes().infoLabel}>{uiT("image.format")}</span>
                    <span class={classes().infoValue}>{metaFormatTxt()}</span>
                  </div>
                </Show>
                <Show when={props.metaDimensions !== false}>
                  <div class={classes().infoRow}>
                    <RLIcon name="image-upscale" class={classes().infoIcon} aria-hidden="true" />
                    <span class={classes().infoLabel}>{uiT("image.dimensions")}</span>
                    <span class={classes().infoValue}>
                      {imgWidth() || "?"} x {imgHeight() || "?"}
                    </span>
                  </div>
                </Show>
                <Show when={props.metaSize !== false}>
                  <div class={classes().infoRow}>
                    <RLIcon name="hard-drive" class={classes().infoIcon} aria-hidden="true" />
                    <span class={classes().infoLabel}>{uiT("image.size")}</span>
                    <span class={classes().infoValue}>{metaSizeTxt()}</span>
                  </div>
                </Show>
                <Show when={props.metaAlt !== false}>
                  <div class={classes().infoRow}>
                    <RLIcon name="align-left" class={classes().infoIcon} aria-hidden="true" />
                    <span class={classes().infoLabel}>{uiT("image.alt")}</span>
                    <span class={alt() ? classes().infoAlt : classes().infoAltEmpty}>
                      {alt() || uiT("image.none")}
                    </span>
                  </div>
                </Show>
              </div>

              <Show when={props.metaDownload !== false}>
                <RLButton
                  type="button"
                  variant="ghost"
                  color="neutral"
                  class={classes().download}
                  data-slot="download"
                  onClick={handleDownload}
                >
                  <RLIcon name="download" class={classes().downloadIcon} aria-hidden="true" />
                  {uiT("image.download")}
                </RLButton>
              </Show>
            </div>

            <form method="dialog" class={classes().closeForm}>
              <RLButton
                type="submit"
                variant="ghost"
                color="neutral"
                class={classes().close}
                data-slot="close"
                aria-label={uiT("actions.close")}
                onClick={() => setOpen(false)}
              >
                <RLIcon name="x" class={classes().closeIcon} aria-hidden="true" />
              </RLButton>
            </form>
          </div>
        </dialog>
      </Show>
    </Tag>
  );
};
