import type { Component } from "solid-js";
import { createMemo } from "solid-js";
import type { RLIconProps } from "./icon.types";
import { RLIconTheme } from "./icon.theme";
import { resolveIcon } from "../../icons";

const OMIT_KEYS = ["name", "unstyled"] as const;

export const RLIcon: Component<RLIconProps> = (props) => {
  const { classes, rest } = RLIconTheme.setup(props, { omit: OMIT_KEYS });
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
