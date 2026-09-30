import { createMemo, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import type { PhoneMockupProps } from "./phone-mockup";
import { phoneMockupTheme } from "./phone-mockup.theme";

export interface RLPhoneMockupProps extends PhoneMockupProps {
  children?: JSX.Element;
}

const RLPhoneMockup: Component<RLPhoneMockupProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "ui", "class", "children");

  const resolvedClasses = createMemo(() =>
    phoneMockupTheme({
      ui: props.ui,
      class: props.class,
      ...allProps
    })
  );

  return (
    <div class={resolvedClasses().root} data-slot="root" {...rest}>
      {props.children}
    </div>
  );
};

export { RLPhoneMockup };
