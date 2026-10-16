import type { RLThemeSelectorProps } from "./theme-selector.types";
import { RLThemeSelectorTheme } from "./theme-selector.theme";
import { createMemo, createSignal, onSettled, omit, type Component } from "solid-js";
import { RLSelect } from "../select/RLSelect";
import { defineShortcuts } from "../../shortcuts";
import {
  getThemePreference,
  parseThemePreference,
  serializeThemePreference,
  type ThemePreference,
} from "../../theme";

const themeItems = [
  { label: "System", value: "system", icon: "laptop" },
  { label: "Light", value: "light", icon: "sun" },
  { label: "Dark", value: "dark", icon: "moon" },
];

export const RLThemeSelector: Component<RLThemeSelectorProps> = (props) => {
  const rest = omit(props, "mode", "size", "theme", "ui", "class", "children", "onChange");

  const [currentPreference, setCurrentPreference] = createSignal<ThemePreference>(
    getThemePreference() ?? "system",
  );

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
    props.onChange?.(preference);
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
        label: "Cycle Theme",
        description: "Cycle between system, light, and dark theme mode",
        category: "system",
      },
    });

    return () => {
      cleanupShortcut();
    };
  });

  const mode = () => props.mode || "select";
  const size = () => props.size || "md";

  const classes = createMemo(() =>
    RLThemeSelectorTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  const activeIcon = () => {
    const pref = currentPreference();
    if (pref === "light") return "sun";
    if (pref === "dark") return "moon";
    return "i-lucide-laptop";
  };

  return (
    <div
      class={classes().root}
      data-theme-selector
      data-mode={mode()}
      data-theme={props.theme}
      data-theme-preference={currentPreference()}
      {...rest}
    >
      <div class={classes().wrapper}>
        <RLSelect
          items={themeItems}
          value={currentPreference()}
          onChange={(e) => applyTheme(e.currentTarget.value)}
          size={size() as any}
          variant={mode() === "icon" ? "icon" : "default"}
          aria-label="Toggle theme"
          class={classes().select}
          leadingIcon={activeIcon()}
        />
      </div>
      {props.children}
    </div>
  );
};
