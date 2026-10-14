import { useIsRouting } from "@solidjs/router";
import { Show, type Component } from "solid-js";
import { RLNavigationProgressTheme } from "./navigation-progress.theme";
import type { RLNavigationProgressProps } from "./navigation-progress.types";

export const RLNavigationProgress: Component<RLNavigationProgressProps> = (props) => {
  let isRouting = () => false;
  try {
    isRouting = useIsRouting();
  } catch {
    // Router context not available (e.g. standalone rendering or test environments)
  }

  const slots = () =>
    RLNavigationProgressTheme({
      color: (props.color ?? "primary") as any,
      size: props.size ?? "sm",
      class: props.class,
      ui: props.ui,
    });

  return (
    <Show when={isRouting()}>
      <div
        role="progressbar"
        aria-label="Page loading"
        aria-valuemin={0}
        aria-valuemax={100}
        class={slots().root}
      >
        <div class={slots().bar} />
      </div>
    </Show>
  );
};

export default RLNavigationProgress;
