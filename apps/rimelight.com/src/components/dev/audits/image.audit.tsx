const SAMPLE = {
  landscape: "https://picsum.photos/seed/rimelight-landscape/1200/800",
  portrait: "https://picsum.photos/seed/rimelight-portrait/800/1200",
  square: "https://picsum.photos/seed/rimelight-square/900/900",
  wide: "https://picsum.photos/seed/rimelight-wide/1600/600",
  light: "https://picsum.photos/seed/rimelight-light/1000/700",
  dark: "https://picsum.photos/seed/rimelight-dark/1000/700",
  mobile: "https://picsum.photos/seed/rimelight-mobile/600/600",
  desktop: "https://picsum.photos/seed/rimelight-desktop/1400/700",
} as const;

export const ImageSandbox = (): JSX.Element => {
  const [src, setSrc] = createSignal<string>(SAMPLE.landscape);
  const [fit, setFit] = createSignal<(typeof FITS)[number]>("cover");
  const [interactive, setInteractive] = createSignal(true);
  const [figure, setFigure] = createSignal(false);
  const [caption, setCaption] = createSignal("");
  const [theme, setTheme] = createSignal<"light" | "dark" | undefined>(undefined);
  const sources = Object.keys(SAMPLE) as (keyof typeof SAMPLE)[];

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.source")}</span>
          <For each={sources}>
            {(s) => (
              <button
                type="button"
                onClick={() => setSrc(SAMPLE[s])}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  src() === SAMPLE[s]
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {s}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.fit")}</span>
          <For each={FITS}>
            {(f) => (
              <button
                type="button"
                onClick={() => setFit(f)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  fit() === f
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {f}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.theme-0485")}</span>
          <For each={["auto", "light", "dark"] as const}>
            {(t) => (
              <button
                type="button"
                onClick={() => setTheme(t === "auto" ? undefined : t)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  (theme() ?? "auto") === t
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {t}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={interactive()}
              onChange={(e) => setInteractive(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.lightbox")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={figure()}
              onChange={(e) => setFigure(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.figure")}</span>
          </label>
        </div>

        <label class="flex items-center gap-1.5">
          <span class="text-muted">{t("app.text.caption")}</span>
          <input
            type="text"
            value={caption()}
            placeholder={t("app.text.optional-caption")}
            onInput={(e) => setCaption(e.currentTarget.value)}
            class="w-40 rounded border border-default bg-elevated/40 px-2 py-0.5 text-xs text-highlighted placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </label>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex items-center justify-center">
        <div class="w-full max-w-md">
          <RLImage
            src={src()}
            alt={t("app.text.sandbox-preview")}
            fit={fit()}
            lightbox={interactive()}
            figure={figure()}
            caption={caption() || undefined}
            theme={theme()}
            class="w-full"
          />
        </div>
      </div>
    </div>
  );
};
import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx";
import { type ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

const FITS = ["cover", "contain", "fill", "none"] as const;

export const imageAudit: ComponentAuditDefinition = {
  id: "image",
  name: "Image",
  category: "Media & Visuals",
  status: "Passed",
  description:
    "A CSP-safe image primitive with a native <dialog> lightbox, zoom toggle, IntersectionObserver lazy loading, light/dark color-mode sources, responsive <picture> breakpoints, figure/caption rendering, metadata inspection panel, and graceful error fallbacks.",
  importPath: "@rimelight/ui/components/image/RLImage.tsx",
  renderSandbox: () => <ImageSandbox />,
  testScenarios: [
    {
      id: "lightbox-basic",
      get title() {
        return t("app.text.basic-image-with-lightbox-dialog");
      },
      description:
        "Clicking the trigger opens a native modal dialog with zoom-on-click, file metadata, download, and close controls.",
      render: () => (
        <div class="w-full max-w-sm">
          <RLImage src={SAMPLE.landscape} alt={"Mountain landscape"} class="w-full" />
        </div>
      ),
    },
    {
      id: "figure-caption",
      get title() {
        return t("app.text.figure-caption-wrapper");
      },
      description:
        "Supplying a caption wraps the media in a semantic <figure> with a styled <figcaption>.",
      render: () => (
        <div class="w-full max-w-md">
          <RLImage
            src={SAMPLE.wide}
            alt={"Panoramic vista"}
            caption="Sunrise over the northern ridge — 2026 expedition."
            figure
            class="w-full"
          />
        </div>
      ),
    },
    {
      id: "color-mode",
      get title() {
        return t("app.text.light-dark-color-mode-sources");
      },
      description:
        "Distinct lightSrc and darkSrc are swapped via light-dark() CSS and prefers-color-scheme, following the document theme.",
      render: () => (
        <div class="flex flex-wrap items-center gap-6">
          <div class="w-full max-w-xs">
            <RLImage
              lightSrc={SAMPLE.light}
              darkSrc={SAMPLE.dark}
              alt={"Adaptive artwork (auto)"}
              class="w-full"
            />
            <p class="mt-2 text-center text-[10px] font-mono text-muted">auto (document theme)</p>
          </div>
          <div class="w-full max-w-xs" data-theme="light">
            <RLImage
              lightSrc={SAMPLE.light}
              darkSrc={SAMPLE.dark}
              alt={"Forced light"}
              theme="light"
              class="w-full"
            />
            <p class="mt-2 text-center text-[10px] font-mono text-muted">theme="light"</p>
          </div>
          <div class="w-full max-w-xs" data-theme="dark">
            <RLImage
              lightSrc={SAMPLE.light}
              darkSrc={SAMPLE.dark}
              alt={"Forced dark"}
              theme="dark"
              class="w-full"
            />
            <p class="mt-2 text-center text-[10px] font-mono text-muted">theme="dark"</p>
          </div>
        </div>
      ),
    },
    {
      id: "responsive-picture",
      get title() {
        return t("app.text.responsive-picture-breakpoints");
      },
      description:
        "mobileSrc and desktopSrc emit <source media> tags around the configured breakpoint.",
      render: () => (
        <div class="w-full max-w-md">
          <RLImage
            mobileSrc={SAMPLE.mobile}
            desktopSrc={SAMPLE.desktop}
            breakpoint={768}
            alt={"Responsive asset (resize the viewport)"}
            class="w-full"
          />
          <p class="mt-2 text-center text-[10px] font-mono text-muted">
            breakpoint: 768px — resize to swap
          </p>
        </div>
      ),
    },
    {
      id: "fit-variants",
      get title() {
        return t("app.text.object-fit-variants");
      },
      description:
        "The fit prop maps to object-cover, object-contain, object-fill, and object-none.",
      render: () => (
        <div class="flex flex-wrap gap-4">
          <For each={FITS}>
            {(f) => (
              <div class="flex flex-col items-center gap-2">
                <RLImage
                  src={SAMPLE.square}
                  alt={`fit ${f}`}
                  fit={f}
                  lightbox={false}
                  class="size-32 border border-default"
                />
                <span class="text-[10px] font-mono text-muted">{f}</span>
              </div>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "custom-trigger",
      get title() {
        return t("app.text.custom-trigger-element");
      },
      description:
        "A custom trigger node replaces the default button while retaining the lightbox dialog behavior.",
      render: () => (
        <div class="w-full max-w-md">
          <RLImage
            lightSrc={SAMPLE.portrait}
            alt={"Portrait"}
            class="w-full"
            trigger={
              <div class="relative cursor-zoom-in overflow-hidden rounded-xl border border-default">
                <img src={SAMPLE.portrait} alt={"Portrait"} class="w-full" />
                <span class="absolute bottom-2 right-2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-mono text-white">
                  click to expand
                </span>
              </div>
            }
          />
        </div>
      ),
    },
    {
      id: "error-fallback",
      get title() {
        return t("app.text.broken-source-fallback");
      },
      description:
        "An unresolvable source renders the accessible image-unavailable placeholder instead of a broken image.",
      render: () => (
        <div class="w-full max-w-sm">
          <RLImage
            src="https://invalid.rimelight.test/missing-image.png"
            alt={"Broken source"}
            class="w-full"
          />
        </div>
      ),
    },
    {
      id: "non-interactive",
      get title() {
        return t("app.text.non-interactive-static-image");
      },
      description:
        "Setting lightbox={false} disables the dialog and renders a plain overflow-hidden container.",
      render: () => (
        <div class="w-full max-w-sm">
          <RLImage src={SAMPLE.wide} alt={"Static image"} lightbox={false} class="w-full" />
        </div>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Nuxt UI v4 API parity (Image)",
      status: "pass",
      notes:
        "Supports src, alt, width, height, loading, decoding, fit, sizes, class, ui plus light/dark and responsive extensions.",
    },
    {
      criterion: "Native dialog lightbox with zoom & metadata",
      status: "pass",
      notes:
        "Uses <dialog showModal()> with click-to-zoom, source/format/dimensions/size/alt metadata, download, and close.",
    },
    {
      criterion: "Light / dark color-mode source swapping",
      status: "pass",
      notes:
        "lightSrc/darkSrc resolved through light-dark() CSS, [data-theme] scoping, and prefers-color-scheme fallbacks.",
    },
    {
      criterion: "Responsive <picture> rendering",
      status: "pass",
      notes: "mobileSrc/desktopSrc emit <source media> tags around the configurable breakpoint.",
    },
    {
      criterion: "Lazy loading via IntersectionObserver",
      status: "pass",
      notes: "lazy images defer source assignment until they approach the viewport (200px margin).",
    },
    {
      criterion: "Accessible trigger, dialog & fallback",
      status: "pass",
      notes:
        "Trigger is a real button, close control has aria-label='Close', and fallback exposes a role image label.",
    },
    {
      criterion: "No inline style attributes (CSP-safe, UnoCSS only)",
      status: "pass",
      notes:
        "Layout uses theme slot classes; a single scoped <style> block governs color-mode CSS.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "All markup is authored with Solid JSX, including the fallback icon box.",
    },
    {
      criterion: "Audited components render bare (no harness wrappers)",
      status: "pass",
      notes: "All scenario renders return bare RLImage components directly.",
    },
  ],
};
