import type { RLThemeSelectorProps } from "./theme-selector.types";
import { RLThemeSelectorTheme } from "./theme-selector.theme";
import { createSignal, onSettled, type Component } from "solid-js";
import { RLSelect } from "../select/RLSelect";
import { defineShortcuts } from "../../shortcuts";
import { uiT } from "../../locale";
import {
  getThemePreference,
  parseThemePreference,
  serializeThemePreference,
  type ThemePreference,
} from "../../theme";

export const RLThemeSelector: Component<RLThemeSelectorProps> = (props) => {
  const { Tag, children, classes, rest, slots, theme } = RLThemeSelectorTheme.setup(props, {
    slots: ["mode", "onValueChange", "color", "size"] as const,
  });

  const [currentPreference, setCurrentPreference] = createSignal<ThemePreference>(
    getThemePreference() ?? "system",
  );

  const themeItems = () => [
    { label: uiT("theme.system"), value: "system", icon: "laptop" },
    { label: uiT("theme.light"), value: "light", icon: "sun" },
    { label: uiT("theme.dark"), value: "dark", icon: "moon" },
  ];

  const applyTheme = (next: string) => {
    const preference = parseThemePreference(next) ?? "system";
    setCurrentPreference(preference);
    if (typeof document !== "undefined") {
      if (preference === "system") {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", preference);
      }
      document.cookie = serializeThemePreference(preference);
    }
    slots.onValueChange()?.(preference);
  };

  onSettled(() => {
    if (typeof document === "undefined") return;

    const pref = getThemePreference() ?? "system";
    if (pref !== currentPreference()) {
      setCurrentPreference(pref);
    }

    const cycle = () => {
      const cur = currentPreference();
      const next = cur === "system" ? "light" : cur === "light" ? "dark" : "system";
      applyTheme(next);
    };

    const cleanupShortcut = defineShortcuts({
      meta_alt_t: {
        handler: cycle,
        label: uiT("theme.cycle"),
        description: uiT("theme.cycle-description"),
        category: "system",
      },
    });

    return () => {
      cleanupShortcut();
    };
  });

  const mode = () => slots.mode() ?? "select";

  const activeIcon = () => {
    const pref = currentPreference();
    if (pref === "light") return "sun";
    if (pref === "dark") return "moon";
    return "i-lucide-laptop";
  };

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      data-theme-selector
      data-mode={mode()}
      data-theme-preference={currentPreference()}
      {...rest}
    >
      <div class={classes().wrapper}>
        <RLSelect
          items={themeItems()}
          value={currentPreference()}
          onChange={(e) => applyTheme(e.currentTarget.value)}
          size={slots.size() ?? "md"}
          layout={mode() === "icon" ? "icon" : "default"}
          color={slots.color() === "auto" ? undefined : slots.color()}
          aria-label={uiT("theme.toggle")}
          class={classes().select}
          leadingIcon={activeIcon()}
        />
      </div>
      {children()}
    </Tag>
  );
};
