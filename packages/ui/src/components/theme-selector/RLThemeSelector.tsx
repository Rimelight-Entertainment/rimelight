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

export const RLThemeSelector: Component<RLThemeSelectorProps> = (props) => {
  const rest = omit(props, "mode", "size", "theme", "ui", "class", "children", "onChange");

  const [currentPreference, setCurrentPreference] = createSignal<string>("system");

  const getPreference = () => {
    const stored = getThemePreference();
    if (stored) return stored;
    if (typeof localStorage !== "undefined") {
      const legacy = parseThemePreference(localStorage.getItem("theme"));
      if (legacy) {
        document.cookie = serializeThemePreference(legacy);
        return legacy;
      }
    }
    return "system";
  };

  const applyTheme = (next: string) => {
    setCurrentPreference(next);
    if (typeof document !== "undefined") {
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
    }
    props.onChange?.(next);
  };

  onSettled(() => {
    if (typeof document === "undefined") return;

    let cleanupShortcut: (() => void) | undefined;

    const schedule =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback
        : (cb: () => void) => setTimeout(cb, 50);

    const idleHandle = schedule(() => {
      const pref = getPreference();
      if (pref !== currentPreference()) {
        setCurrentPreference(pref);
      }

      const cycle = () => {
        const cur = currentPreference();
        const next = cur === "system" ? "light" : cur === "light" ? "dark" : "system";
        applyTheme(next);
      };

      cleanupShortcut = defineShortcuts({
        meta_alt_t: {
          handler: cycle,
          label: "Cycle Theme",
          description: "Cycle between system, light, and dark theme mode",
          category: "system",
        },
      });
    });

    return () => {
      if (typeof cancelIdleCallback !== "undefined" && typeof idleHandle === "number") {
        cancelIdleCallback(idleHandle);
      }
      cleanupShortcut?.();
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
