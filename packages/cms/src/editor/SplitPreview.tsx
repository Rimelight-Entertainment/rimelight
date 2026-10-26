import { For, Show, createSignal, onCleanup, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { BaseBlock } from "../core/types/blocks";
import { normalizeBlocks } from "../core/blocks/tree";
import { BlockRenderer } from "../solid/BlockRenderer";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";

/**
 * Editor on the left, a live view-mode render of the page on the right, separated by a
 * draggable handle. The ratio is remembered per viewer. Below `lg` the preview stacks under
 * the editor instead (there's no room for two columns).
 */

const RATIO_KEY = "rimelight-cms:preview-ratio";
const MIN = 0.2;
const MAX = 0.8;

const readRatio = () => {
  try {
    const n = Number(localStorage.getItem(RATIO_KEY));
    return n >= MIN && n <= MAX ? n : 0.5;
  } catch {
    return 0.5;
  }
};

export const SplitPane: Component<{
  open: boolean;
  left: JSX.Element;
  right: JSX.Element;
}> = (props) => {
  const [ratio, setRatio] = createSignal(readRatio());
  const [dragging, setDragging] = createSignal(false);
  let container: HTMLDivElement | undefined;

  const setClamped = (r: number) => {
    const next = Math.min(MAX, Math.max(MIN, r));
    setRatio(next);
    try {
      localStorage.setItem(RATIO_KEY, String(next));
    } catch {
      /* storage unavailable: keep in memory */
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setClamped((e.clientX - rect.left) / rect.width);
  };
  const stop = () => {
    setDragging(false);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", stop);
  };
  onCleanup(stop);

  return (
    <div
      ref={(el) => (container = el)}
      class={`flex min-h-0 flex-1 flex-col 2xl:flex-row ${dragging() ? "cursor-col-resize select-none" : ""}`}
    >
      <div
        class="min-h-0 min-w-0 flex-1 overflow-y-auto"
        style={props.open ? { "flex-basis": `${ratio() * 100}%`, "flex-grow": 0 } : {}}
      >
        {props.left}
      </div>
      <Show when={props.open}>
        <div
          role="separator"
          aria-orientation="vertical"
          aria-valuemin={MIN * 100}
          aria-valuemax={MAX * 100}
          aria-valuenow={Math.round(ratio() * 100)}
          aria-label="Resize preview"
          tabindex={0}
          title="Drag to resize · double-click to reset"
          class={`group relative hidden w-1.5 shrink-0 cursor-col-resize items-center justify-center border-x border-default bg-elevated transition-colors hover:bg-primary-500/20 focus-visible:bg-primary-500/30 focus-visible:outline-none 2xl:flex ${dragging() ? "bg-primary-500/30" : ""}`}
          onPointerDown={(e) => {
            e.preventDefault();
            setDragging(true);
            window.addEventListener("pointermove", onPointerMove);
            window.addEventListener("pointerup", stop);
          }}
          onDblClick={() => setClamped(0.5)}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setClamped(ratio() - 0.02);
            else if (e.key === "ArrowRight") setClamped(ratio() + 0.02);
          }}
        >
          <span class="h-8 w-0.5 rounded-full bg-muted/40 group-hover:bg-primary-500" />
        </div>
        {/* While dragging, the pointer may cross the preview; keep events on the window. */}
        <div
          class={`min-h-0 min-w-0 flex-1 overflow-y-auto border-t border-default 2xl:border-t-0 ${dragging() ? "pointer-events-none" : ""}`}
        >
          {props.right}
        </div>
      </Show>
    </div>
  );
};

export type PreviewDevice = "desktop" | "tablet" | "mobile";

const DEVICE_WIDTH: Record<PreviewDevice, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

/** Renders blocks exactly as readers see them (view mode), with a device-width switcher. */
export const PagePreview: Component<{
  title: string;
  blocks: BaseBlock[];
  locale?: string;
  /** Optional label shown in the header, e.g. "Draft" or "v3". */
  badge?: string;
  onClose?: () => void;
  actions?: JSX.Element;
}> = (props) => {
  const [device, setDevice] = createSignal<PreviewDevice>("desktop");
  const blocks = () => normalizeBlocks(props.blocks ?? []);
  return (
    <div class="flex h-full flex-col bg-muted/5">
      <div class="sticky top-0 z-10 flex items-center gap-2 border-b border-default bg-default/90 px-3 py-1.5 backdrop-blur">
        <span class="text-[11px] font-semibold uppercase tracking-wide text-muted">Preview</span>
        <Show when={props.badge}>
          <span class="rounded bg-elevated px-1.5 py-0.5 text-[10px] text-toned">
            {props.badge}
          </span>
        </Show>
        <div class="ml-auto flex items-center gap-0.5 rounded-md border border-default p-0.5">
          <For
            each={
              [
                ["desktop", "i-lucide-monitor", "Desktop"],
                ["tablet", "i-lucide-tablet", "Tablet"],
                ["mobile", "i-lucide-smartphone", "Mobile"],
              ] as const
            }
          >
            {([key, icon, label]) => (
              <RLButton
                size="xs"
                variant={device() === key ? "soft" : "ghost"}
                color={device() === key ? "primary" : "neutral"}
                icon={icon}
                title={label}
                aria-label={label}
                aria-pressed={device() === key ? "true" : "false"}
                onClick={() => {
                  setDevice(key);
                }}
              />
            )}
          </For>
        </div>
        {props.actions}
        <Show when={props.onClose}>
          <RLButton
            size="xs"
            variant="ghost"
            color="neutral"
            icon="i-lucide-x"
            title="Close preview"
            aria-label="Close preview"
            onClick={() => props.onClose?.()}
          />
        </Show>
      </div>
      <div class="flex-1 px-4 py-6">
        <div
          class="mx-auto rounded-lg bg-default shadow-sm ring-1 ring-default transition-[max-width] duration-200"
          style={{ "max-width": DEVICE_WIDTH[device()] }}
        >
          <article class="rimelight-cms-page px-6 py-8">
            <h1 class="mb-6 text-3xl font-bold text-highlighted">{props.title}</h1>
            <For
              each={blocks()}
              fallback={<p class="text-sm text-muted">Nothing to preview yet.</p>}
            >
              {(block, i) => <BlockRenderer block={block} index={i()} locale={props.locale} />}
            </For>
          </article>
        </div>
      </div>
    </div>
  );
};
