import { getUIConfig } from "./runtime";
import { DEFAULT_ICON_NAMES, type RimelightIcons } from "./constants/icons";

export { DEFAULT_ICON_NAMES, type RimelightIcons };

export const resolveIcon = (name = "", custom?: string): string => {
  const override = name ? getUIConfig()?.icons?.[name] : undefined;
  const raw = custom || override || name;
  if (!raw || raw.startsWith("<")) return "";
  return raw.startsWith("i-") || raw.includes(":") ? raw : `i-lucide-${raw}`;
};
