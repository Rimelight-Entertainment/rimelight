import type { UIConfig } from "./types";

let activeUIConfig: UIConfig = {};
let testOverrides: Partial<UIConfig> | null = null;

export function setUIConfig(config: UIConfig | null | undefined): void {
  activeUIConfig = config ?? {};
}

export function getUIConfig(): UIConfig {
  return testOverrides ? { ...activeUIConfig, ...testOverrides } : activeUIConfig;
}

export function setRimelightUITestConfig(overrides: Partial<UIConfig> | null): void {
  testOverrides = overrides;
}
