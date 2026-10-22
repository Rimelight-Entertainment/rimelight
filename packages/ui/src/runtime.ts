import { config } from "virtual:rimelight-ui";
import type { UIConfig } from "./types";
import { PALETTES } from "./constants/palettes";

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeof val === "object" && val !== null && !Array.isArray(val);
}

let configOverrides: Partial<UIConfig> | null = null;

export const getUIConfig = (): UIConfig => {
  const base: UIConfig = isRecord(config) ? config : {};

  return configOverrides ? { ...base, ...configOverrides } : base;
};

export const setUIConfig = (next?: UIConfig | null): void => {
  configOverrides = next ? { ...next } : null;
};

export const getColorPalettes = (): string[] => {
  const customColors = getUIConfig()?.colors || {};
  return Array.from(new Set([...Object.keys(PALETTES), ...Object.keys(customColors)]));
};
