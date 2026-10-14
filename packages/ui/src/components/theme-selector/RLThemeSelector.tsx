import type { RLThemeSelectorProps } from "./theme-selector.types";
import { RLThemeSelectorTheme } from "./theme-selector.theme";
import { createMemo, createSignal, onSettled, omit, type Component } from "solid-js";
import { RLSelect } from "../select/RLSelect";
import { defineShortcuts } from "../../shortcuts";
import { getThemePreference, parseThemePreference, serializeThemePreference } from "../../theme";

const themeItems = [
  { label: "System", value: "system", icon: "laptop" },
  { label: "Light", value: "light", icon: "sun" },
  { label: "Dark", value: "dark", icon: "moon" },
];

export const RLThemeSelector: Component<RLThemeSelectorProps> = (allProps) => {
  const props = allProps;
  const rest = omit(allProps, "mode", "size", "theme", "ui", "class", "children", "onChange");

  const [currentPreference, setCurrentPreference] = createSignal<string>("system");

  const getPreference = () => {
    const stored = getThemePreference();
    if (stored) return stored;
    const legacy = parseThemePreference(localStorage.getItem("theme"));
    if (legacy) {
      document.cookie = serializeThemePreference(legacy);
      return legacy;
    }
    return "system";
  };

  const applyTheme = (next: string) => {
    setCurrentPreference(next);
    const resolved =
      next === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : next;
    document.documentElement.setAttribute("data-theme", resolved);
    const preference = parseThemePreference(next) ?? "system";
    document.cookie = serializeThemePreference(preference);
    localStorage.setItem("theme", next);
    props.onChange?.(next);
  };

  onSettled(() => {
    const pref = getPreference();
    applyTheme(pref);

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

    return () => cleanupShortcut();
  });

  const mode = () => props.mode || "select";
  const size = () => props.size || "md";

  const resolvedClasses = createMemo(() =>
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
      class={resolvedClasses().root}
      data-theme-selector
      data-mode={mode()}
      data-theme={props.theme}
      data-theme-preference={currentPreference()}
      {...rest}
    >
      <div class={resolvedClasses().wrapper}>
        <RLSelect
          items={themeItems}
          value={currentPreference()}
          onChange={(e) => applyTheme(e.currentTarget.value)}
          size={size() as any}
          variant={mode() === "icon" ? "icon" : "default"}
          aria-label="Toggle theme"
          class={resolvedClasses().select}
          leadingIcon={activeIcon()}
        />
      </div>
      {props.children}
    </div>
  );
};
