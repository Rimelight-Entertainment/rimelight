import type { Component } from "solid-js";
import { createMemo } from "solid-js";
import type { RLIconProps } from "./icon.types";
import { RLIconTheme } from "./icon.theme";
import { resolveIcon } from "../../icons";

const OMIT_KEYS = ["name"] as const;

export const RLIcon: Component<RLIconProps> = (props) => {
  const { Tag, classes, rest, theme } = RLIconTheme.setup(props, { as: "span", omit: OMIT_KEYS });
  const resolved = createMemo(() => resolveIcon(props.name));

  return (
    <Tag
      class={[classes().root, resolved()].filter(Boolean).join(" ")}
      data-slot="root"
      data-theme={theme()}
      aria-hidden="true"
      {...rest}
    />
  );
};
