import type { UIConfig } from "./types";

let activeUIConfig: UIConfig = {};
let testOverrides: Partial<UIConfig> | null = null;
let resolvedUIConfig: UIConfig = activeUIConfig;

export function setUIConfig(config: UIConfig | null | undefined): void {
  activeUIConfig = config ?? {};
  resolvedUIConfig = testOverrides ? { ...activeUIConfig, ...testOverrides } : activeUIConfig;
}

export function getUIConfig(): UIConfig {
  return resolvedUIConfig;
}

export function setRimelightUITestConfig(overrides: Partial<UIConfig> | null): void {
  testOverrides = overrides;
  resolvedUIConfig = testOverrides ? { ...activeUIConfig, ...testOverrides } : activeUIConfig;
}
