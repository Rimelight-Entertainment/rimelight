import { getUIConfig } from "./runtime";
import { DEFAULT_ICONS, toIconClass, type RimelightIcons } from "./constants/icons";

export { DEFAULT_ICONS, toIconClass, type RimelightIcons };

/**
 * Resolves an icon to a UnoCSS class. Precedence: `custom` prop, then the
 * `UIConfig.icons` override for `name`, then the built-in default for `name`,
 * then `name` itself.
 */
export const resolveIcon = (name = "", custom?: string): string => {
  const override = name ? getUIConfig()?.icons?.[name] : undefined;
  const mapped = name && Object.hasOwn(DEFAULT_ICONS, name) ? DEFAULT_ICONS[name] : undefined;
  return toIconClass(custom || override || mapped || name);
};
