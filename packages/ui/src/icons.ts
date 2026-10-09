import uiConfig from "#rimelight/ui";
import { getIconNodes, getIconSvg, ICONS, svg, type IconNode } from "./icons.raw";

export { ICONS, svg, type IconNode };

export const getSvgIcon = (k: string): string => getIconSvg(k) ?? "";

export const DEFAULT_ICONS: Record<keyof typeof ICONS, string> = Object.fromEntries(
  Object.keys(ICONS).map((k) => [k, getSvgIcon(k)]),
) as Record<keyof typeof ICONS, string>;

export type RimelightIcons = Partial<
  Record<keyof typeof ICONS | (string & {}), string | IconNode[]>
>;

export interface ResolvedIcon {
  isClass: boolean;
  content: string;
  nodes?: IconNode[];
}

const EMPTY_ICON: ResolvedIcon = { isClass: false, content: "" };
const cache = new Map<string, ResolvedIcon>();

export const resolveIcon = (name = "", custom?: string | IconNode[]): ResolvedIcon => {
  if (!name && !custom) return EMPTY_ICON;
  if (Array.isArray(custom)) {
    return { isClass: false, content: "", nodes: custom };
  }
  const iconOverride = uiConfig?.icons?.[name as keyof typeof ICONS];
  if (Array.isArray(iconOverride)) {
    return { isClass: false, content: "", nodes: iconOverride };
  }
  const raw: string =
    (typeof custom === "string" ? custom : undefined) ||
    (typeof iconOverride === "string" ? iconOverride : undefined) ||
    name;
  let res = cache.get(raw);
  if (!res) {
    const nodes = getIconNodes(raw);
    if (nodes !== undefined) {
      res = { isClass: false, content: getIconSvg(raw) ?? "", nodes };
    } else if (raw.startsWith("i-") || raw.includes(":")) {
      res = { isClass: true, content: raw };
    } else {
      res = {
        isClass: false,
        content: raw.startsWith("<svg") ? raw : raw.startsWith("<") ? svg(raw) : "",
      };
    }
    cache.set(raw, res);
  }
  return res;
};
