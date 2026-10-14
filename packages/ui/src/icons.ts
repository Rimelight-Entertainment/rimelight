import { getUIConfig } from "./ui-config";

export type RimelightIcons = Record<string, string>;

export interface ResolvedIcon {
  isClass: boolean;
  content: string;
}

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

const EMPTY_ICON: ResolvedIcon = { isClass: false, content: "" };
const cache = new Map<string, ResolvedIcon>();

const toClass = (name: string): string =>
  name.startsWith("i-") || name.includes(":") ? name : `i-lucide-${name}`;

export const resolveIcon = (name = "", custom?: string): ResolvedIcon => {
  const override = name ? getUIConfig()?.icons?.[name] : undefined;
  const raw = custom || override || name;
  if (!raw || raw.startsWith("<")) return EMPTY_ICON;
  let res = cache.get(raw);
  if (!res) {
    res = { isClass: true, content: toClass(raw) };
    cache.set(raw, res);
  }
  return res;
};
