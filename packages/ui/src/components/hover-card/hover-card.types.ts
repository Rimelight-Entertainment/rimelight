import type { JSX } from "@solidjs/web";

export interface RLHoverCardProps {
  triggerLabel?: string;
  placement?: "top" | "bottom" | "left" | "right";
  ui?: any;
  class?: any;
  children?: JSX.Element;
  triggerSlot?: JSX.Element;
  [key: string]: unknown;
}
