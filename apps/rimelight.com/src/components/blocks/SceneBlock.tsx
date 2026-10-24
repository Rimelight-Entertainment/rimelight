import type { Component, ParentProps } from "solid-js";
import { isRichTextEmpty, type BaseBlock } from "@rimelight/cms";
import { RichText } from "@rimelight/cms/solid";

export interface SceneBlockProps extends ParentProps {
  block: BaseBlock;
  locale?: string;
}

export const SceneBlock: Component<SceneBlockProps> = (props) => {
  const p = () => (props.block.props || {}) as any;
  const location = () => p().location;
  const timeOfDay = () => p().timeOfDay;
  const setting = () => p().setting;
  const transition = () => p().transition;
  const description = () => p().description;

  const timeOfDayLabels: Record<string, string> = {
    MORNING: "Morning",
    NOON: "Noon",
    AFTERNOON: "Afternoon",
    EVENING: "Evening",
    NIGHT: "Night",
    OTHER: "Other",
  };

  const settingLabels: Record<string, string> = {
    INTERIOR: "INT.",
    EXTERIOR: "EXT.",
    OTHER: "Other",
  };

  const transitionLabels: Record<string, string> = {
    CUT_TO: "CUT TO",
    CUT_BACK_TO: "CUT BACK TO",
    FADE_TO: "FADE TO",
    NONE: "",
  };

  const settingLabel = () => settingLabels[setting()] || "Other";
  const todLabel = () => timeOfDayLabels[timeOfDay()] || "Other";
  const transitionLabel = () => transitionLabels[transition()] || "";

  const headingParts = () => {
    const parts: string[] = [];
    const s = settingLabel();
    const l = location();
    const t = todLabel();
    if (s && s !== "Other") parts.push(s);
    if (l) parts.push(l);
    if (t && t !== "Other") parts.push(`- ${t}`);
    return parts;
  };

  const hasChildren = () =>
    (props.block.children && props.block.children.length > 0) ||
    (props.block.props?.["children"] && props.block.props["children"].length > 0) ||
    Boolean(props.children);

  return (
    <div class="my-4 p-3 border-l-4 border-sky-400 bg-sky-50/20 rounded-r-lg">
      <div class="flex flex-wrap items-center gap-2 text-sm font-semibold text-sky-800 mb-2">
        {headingParts().map((part) => (
          <span>{part}</span>
        ))}
        {transitionLabel() && (
          <span class="ml-auto text-[10px] italic text-neutral-600">{transitionLabel()}</span>
        )}
      </div>
      {!isRichTextEmpty(description()) && (
        <p class="text-sm text-neutral-700 mb-2">
          <RichText value={description()} locale={props.locale} />
        </p>
      )}
      {hasChildren() && <div class="mt-3">{props.children}</div>}
    </div>
  );
};

export default SceneBlock;
