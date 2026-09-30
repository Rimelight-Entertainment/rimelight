import { Show, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";

export interface RLSurroundItem {
  label: string;
  href: string;
}

export interface RLSurroundProps {
  prev?: RLSurroundItem | null;
  next?: RLSurroundItem | null;
  class?: string;
}

const RLSurround: Component<RLSurroundProps> = (props) => {
  return (
    <Show when={props.prev || props.next}>
      <div
        class={`mt-12 pt-6 border-t border-default flex justify-between gap-4 ${props.class ?? ""}`}
      >
        <Show when={props.prev} fallback={<div />}>
          {(prev) => (
            <a
              href={prev().href}
              class="flex flex-col gap-1 text-left group no-underline max-w-[45%]"
            >
              <span class="text-xs text-muted font-medium flex items-center gap-1 group-hover:text-primary transition-colors">
                <RLIcon name="arrowLeft" class="size-3" /> Previous
              </span>
              <span class="text-sm font-semibold text-highlighted group-hover:text-primary transition-colors truncate">
                {prev().label}
              </span>
            </a>
          )}
        </Show>

        <Show when={props.next} fallback={<div />}>
          {(next) => (
            <a
              href={next().href}
              class="flex flex-col gap-1 text-right group no-underline max-w-[45%]"
            >
              <span class="text-xs text-muted font-medium flex items-center justify-end gap-1 group-hover:text-primary transition-colors">
                Next <RLIcon name="arrowRight" class="size-3" />
              </span>
              <span class="text-sm font-semibold text-highlighted group-hover:text-primary transition-colors truncate">
                {next().label}
              </span>
            </a>
          )}
        </Show>
      </div>
    </Show>
  );
};

export { RLSurround };
