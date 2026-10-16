export * from "./components/index";

export type {
  Theme,
  BuiltinThemeColor,
  ThemeColor,
  ClassValue,
  ThemeConfig,
  ColorModeInput,
  PresetOptions,
  UIConfig,
} from "./types";

export {
  THEME_COOKIE,
  parseThemePreference,
  getThemePreference,
  getDocumentTheme,
  serializeThemePreference,
  type ThemePreference,
} from "./theme";

export { DEFAULT_ICON_NAMES, resolveIcon, type RimelightIcons } from "./icons";

export {
  cx,
  defineTheme,
  getUIConfig,
  setUIConfig,
  getUiConfig,
  setUiConfig,
  setRimelightUITestConfig,
} from "./resolver";

export {
  normalizeModifier,
  formatShortcutKeys,
  activeShortcutsStore,
  setActiveShortcutsStore,
  shortcutsModalOpen,
  setShortcutsModalOpen,
  openShortcutsModal,
  closeShortcutsModal,
  toggleShortcutsModal,
  defineShortcuts,
  type Handler,
  type ShortcutConfig,
  type ShortcutsConfig,
  type ShortcutsOptions,
  type RegisteredShortcut,
} from "./shortcuts";
