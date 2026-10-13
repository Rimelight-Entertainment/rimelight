import type { RLIconProps } from "./icon.types";
import { RLIconTheme } from "./icon.theme";
import { createMemo, omit, type Component } from "solid-js";
import { resolveIcon } from "../../icons";

export const RLIcon: Component<RLIconProps> = (allProps) => {
  const rest = omit(allProps, "name", "custom", "size", "class", "unstyled");
  const classes = createMemo(() => RLIconTheme({ size: allProps.size, class: allProps.class }));
  const resolved = createMemo(() => resolveIcon(allProps.name, allProps["custom"] as any));

  return (
    <span
      class={resolved().isClass ? `${classes().root} ${resolved().content}` : classes().root}
      data-slot="icon"
      aria-hidden="true"
      {...rest}
    />
  );
};
