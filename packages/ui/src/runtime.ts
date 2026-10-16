import generated from "virtual:rimelight-ui";
import type { UIConfig } from "./types";

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

let configOverrides: Partial<UIConfig> | null = null;

export const getUIConfig = (): UIConfig => {
  const base: UIConfig = isRecord((generated as any)?.config)
    ? ((generated as any).config as UIConfig)
    : isRecord(generated) && !("config" in (generated as any))
      ? (generated as unknown as UIConfig)
      : {};

  return configOverrides ? { ...base, ...configOverrides } : base;
};

export const setUIConfig = (next?: UIConfig | null): void => {
  configOverrides = next ? { ...next } : null;
};

// Aliases matching standard naming and test helper conventions
export const getUiConfig = getUIConfig;
export const setUiConfig = setUIConfig;
export const setRimelightUITestConfig = (overrides: Partial<UIConfig> | null): void => {
  if (overrides === null) {
    setUIConfig();
  } else {
    setUIConfig({ ...getUIConfig(), ...overrides });
  }
};
