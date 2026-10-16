import type { RLIconProps } from "./icon.types";
import { RLIconTheme } from "./icon.theme";
import { createMemo, omit, type Component } from "solid-js";
import { resolveIcon } from "../../icons";

export const RLIcon: Component<RLIconProps> = (props) => {
  const rest = omit(props, "name", "size", "class", "unstyled");
  const classes = createMemo(() => RLIconTheme({ size: props.size, class: props.class }));
  const resolved = createMemo(() => resolveIcon(props.name));

  return (
    <span
      class={resolved() ? `${classes().root} ${resolved()}` : classes().root}
      data-slot="icon"
      aria-hidden="true"
      {...rest}
    />
  );
};
