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

const OMIT_KEYS = ["mode", "onValueChange", "color", "size"] as const;

export const RLThemeSelector: Component<RLThemeSelectorProps> = (props) => {
  const { Tag, children, classes, rest, theme } = RLThemeSelectorTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  const [currentPreference, setCurrentPreference] = createSignal<ThemePreference>(
    getThemePreference() ?? "system",
  );

  const themeItems = () => [
    { label: uiT("theme.system"), value: "system", icon: "laptop" },
    { label: uiT("theme.light"), value: "light", icon: "sun" },
    { label: uiT("theme.dark"), value: "dark", icon: "moon" },
  ];

  const applyPreference = (next: string) => {
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
    props.onValueChange?.(preference);
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
      applyPreference(next);
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

  const mode = () => props.mode ?? "select";

  const activeIcon = () => {
    const pref = currentPreference();
    if (pref === "light") return "sun";
    if (pref === "dark") return "moon";
    return "laptop";
  };

  return (
    <Tag
      class={classes().root}
      data-slot="root"
      data-theme={theme()}
      data-mode={mode()}
      data-state={currentPreference()}
      {...rest}
    >
      <div class={classes().wrapper} data-slot="wrapper">
        <RLSelect
          variant={mode() === "icon" ? "ghost" : undefined}
          items={themeItems()}
          value={currentPreference()}
          onChange={(e) => applyPreference(e.currentTarget.value)}
          size={props.size ?? "md"}
          layout={mode() === "icon" ? "icon" : "default"}
          color={props.color ?? "primary"}
          aria-label={uiT("theme.toggle")}
          leadingIcon={activeIcon()}
        />
      </div>
      {children()}
    </Tag>
  );
};
