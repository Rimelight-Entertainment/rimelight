import { createMemo, omit, For, type Component } from "solid-js";
import { Dynamic } from "@solidjs/web";
import { resolveIcon } from "../../icons";
import type { RLIconProps } from "./icon.types";
import { iconTheme } from "./icon.theme";

export const RLIcon: Component<RLIconProps> = (allProps) => {
  const rest = omit(allProps, "name", "custom", "size", "class", "unstyled");
  const classes = createMemo(() => iconTheme({ size: allProps.size, class: allProps.class }));
  const resolved = createMemo(() => resolveIcon(allProps.name, allProps["custom"] as any));

  return (
    <span
      class={resolved().isClass ? `${classes().root} ${resolved().content}` : classes().root}
      data-slot="icon"
      aria-hidden="true"
      {...rest}
    >
      {resolved().nodes ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
          width="100%"
          height="100%"
        >
          <For each={resolved().nodes}>
            {([tag, attrs]) => <Dynamic component={tag} {...attrs} />}
          </For>
        </svg>
      ) : null}
    </span>
  );
};
