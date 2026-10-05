import type { RLMainProps } from "./main.types";
import { RLMainTheme } from "./main.theme";
import { createMemo, omit, type Component, Show } from "solid-js";

export const RLMain: Component<RLMainProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "as", "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    RLMainTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <Show
      when={props.as && props.as !== "main"}
      fallback={
        <main class={`${resolvedClasses().root} rl-main-container`} data-slot="main" {...rest}>
          {props.children}
        </main>
      }
    >
      <div class={`${resolvedClasses().root} rl-main-container`} data-slot="main" {...rest}>
        {props.children}
      </div>
    </Show>
  );
};
