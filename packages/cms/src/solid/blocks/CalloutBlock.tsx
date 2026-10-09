import { type Component } from "solid-js";
import type { CalloutVariant } from "../../core/types/blocks";
import type { BlockViewProps } from "./ParagraphBlock";

const variantConfigs: Record<string, { icon: string; classes: string }> = {
  info: { icon: "i-lucide-info", classes: "bg-info-50/50 border-info-200 text-info-800" },
  success: {
    icon: "i-lucide-check-circle",
    classes: "bg-success-50/50 border-success-200 text-success-800",
  },
  warning: {
    icon: "i-lucide-alert-triangle",
    classes: "bg-warning-50/50 border-warning-200 text-warning-800",
  },
  error: {
    icon: "i-lucide-alert-octagon",
    classes: "bg-error-50/50 border-error-200 text-error-800",
  },
  commentary: {
    icon: "i-lucide-message-square",
    classes: "bg-ideation-50/50 border-ideation-200 text-ideation-800",
  },
  ideation: {
    icon: "i-lucide-lightbulb",
    classes: "bg-warning-50/50 border-warning-200 text-warning-800",
  },
  source: { icon: "i-lucide-code", classes: "bg-info-50/50 border-info-200 text-info-800" },
};

export const CalloutBlock: Component<BlockViewProps> = (props) => {
  const variant = () => (props.block.props?.["variant"] as CalloutVariant) ?? "info";
  const to = () => props.block.props?.["to"] as string | undefined;
  const target = () => props.block.props?.["target"] as string | undefined;
  const config = () => variantConfigs[variant()] ?? variantConfigs["info"]!;

  return (
    <div
      class={`cms-callout border rounded-xl p-4 my-4 flex items-start gap-3 text-sm no-underline ${config().classes}`}
      data-block-id={props.block.id}
    >
      <span class={`${config().icon} size-5 shrink-0 mt-0.5`} aria-hidden="true" />
      <div class="flex-1 min-w-0 text-sm">
        {props.children}
        {to() ? (
          <a href={to()} target={target()}>
            {to()}
          </a>
        ) : null}
      </div>
    </div>
  );
};
