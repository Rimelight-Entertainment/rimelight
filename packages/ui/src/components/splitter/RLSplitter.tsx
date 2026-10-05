import type { RLSplitterProps } from "./splitter.types";
import { RLSplitterTheme } from "./splitter.theme";
import { children, createMemo, createSignal, For, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";

interface DragState {
  i: number;
  startPos: number;
  startA: number;
  startB: number;
}

export const RLSplitter: Component<RLSplitterProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "direction", "defaultSizes", "ui", "class", "children", "panels");

  const childContent = children(() => props.children);

  const isHorizontal = () => (props.direction ?? "horizontal") === "horizontal";

  const [sizes, setSizes] = createSignal<number[]>(
    (() => {
      const ds = props.defaultSizes ?? [50, 50];
      const totalSize = ds.reduce((s, v) => s + v, 0);
      return ds.map((s) => (s / (totalSize || 100)) * 100);
    })(),
  );

  const [drag, setDrag] = createSignal<DragState | null>(null);
  let rootRef: HTMLDivElement | undefined;

  const panelContents = createMemo<JSX.Element[]>(() => {
    if (props.panels && props.panels.length > 0) return props.panels;
    return childContent.toArray();
  });

  const resolvedClasses = createMemo(() =>
    RLSplitterTheme({
      direction: props.direction ?? "horizontal",
      ui: props.ui,
      class: props.class,
    }),
  );

  const containerSize = () =>
    isHorizontal() ? (rootRef?.clientWidth ?? 0) : (rootRef?.clientHeight ?? 0);

  const handlePointerDown = (i: number, e: PointerEvent) => {
    const current = sizes();
    if (current[i + 1] === undefined) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDrag({
      i,
      startPos: isHorizontal() ? e.clientX : e.clientY,
      startA: current[i] ?? 0,
      startB: current[i + 1] ?? 0,
    });
  };

  const handlePointerMove = (i: number, e: PointerEvent) => {
    const state = drag();
    if (!state || state.i !== i) return;
    const delta = isHorizontal() ? e.clientX - state.startPos : e.clientY - state.startPos;
    const size = containerSize();
    if (!size) return;
    const deltaPct = (delta / size) * 100;
    const minPct = (48 / size) * 100;
    const newA = Math.max(minPct, state.startA + deltaPct);
    const newB = Math.max(minPct, state.startB - deltaPct);
    setSizes((prev) => {
      const next = [...prev];
      next[state.i] = newA;
      if (next[state.i + 1] !== undefined) next[state.i + 1] = newB;
      return next;
    });
  };

  const handlePointerUp = (_i: number, e: PointerEvent) => {
    if (!drag()) return;
    if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    }
    setDrag(null);
  };

  const handleKeyDown = (i: number, e: KeyboardEvent) => {
    const current = sizes();
    if (current[i + 1] === undefined) return;
    const forward = isHorizontal() ? e.key === "ArrowRight" : e.key === "ArrowDown";
    const backward = isHorizontal() ? e.key === "ArrowLeft" : e.key === "ArrowUp";
    if (!forward && !backward) return;
    e.preventDefault();
    const stepPct = 2;
    const delta = forward ? stepPct : -stepPct;
    const next = [...current];
    const a = (next[i] ?? 0) + delta;
    const b = (next[i + 1] ?? 0) - delta;
    if (a < 0 || b < 0) return;
    next[i] = a;
    if (next[i + 1] !== undefined) next[i + 1] = b;
    setSizes(next);
  };

  const panelClass = (size: number) => (isHorizontal() ? `w-[${size}%]` : `h-[${size}%]`);

  return (
    <div
      ref={(el) => (rootRef = el)}
      class={resolvedClasses().root}
      data-slot="root"
      data-resizable
      data-direction={props.direction ?? "horizontal"}
      {...rest}
    >
      <For each={sizes()}>
        {(size, i) => (
          <>
            <div
              class={`${resolvedClasses().panel} ${panelClass(size)}`}
              data-slot="panel"
              data-resizable-panel={i()}
            >
              {panelContents()[i()]}
            </div>

            {i() < sizes().length - 1 ? (
              <div
                class={resolvedClasses().handle}
                data-slot="handle"
                data-resizable-handle={i()}
                role="separator"
                aria-orientation={isHorizontal() ? "vertical" : "horizontal"}
                tabindex={0}
                aria-label="Resize panels"
                onPointerDown={(e) => handlePointerDown(i(), e)}
                onPointerMove={(e) => handlePointerMove(i(), e)}
                onPointerUp={(e) => handlePointerUp(i(), e)}
                onKeyDown={(e) => handleKeyDown(i(), e)}
              >
                <RLIcon
                  name={isHorizontal() ? "gripVertical" : "gripHorizontal"}
                  class="size-3.5 text-muted/50"
                  aria-hidden="true"
                />
              </div>
            ) : null}
          </>
        )}
      </For>
    </div>
  );
};
