import { getUIConfig } from "./runtime";

export type RimelightIcons = Record<string, string>;

export const DEFAULT_ICON_NAMES = [
  "align-left",
  "arrow-down",
  "arrow-left",
  "arrow-right",
  "arrow-up",
  "bell",
  "check",
  "chevron-down",
  "chevron-left",
  "chevron-right",
  "chevrons-left",
  "chevrons-right",
  "chevrons-up-down",
  "circle-check",
  "cloud-upload",
  "copy",
  "download",
  "external-link",
  "fast-forward",
  "file-question-mark",
  "grip-horizontal",
  "grip-vertical",
  "hard-drive",
  "image",
  "image-upscale",
  "info",
  "layers",
  "laptop",
  "list",
  "loader-circle",
  "lock",
  "menu",
  "minus",
  "moon",
  "pause",
  "play",
  "quote",
  "repeat",
  "repeat-1",
  "rotate-cw",
  "search",
  "skip-back",
  "skip-forward",
  "sparkles",
  "star",
  "sun",
  "triangle-alert",
  "user",
  "volume-1",
  "volume-2",
  "volume-x",
  "x",
] as const;

export const resolveIcon = (name = "", custom?: string): string => {
  const override = name ? getUIConfig()?.icons?.[name] : undefined;
  const raw = custom || override || name;
  if (!raw || raw.startsWith("<")) return "";
  return raw.startsWith("i-") || raw.includes(":") ? raw : `i-lucide-${raw}`;
};
