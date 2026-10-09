import { config as generatedConfig } from "#rimelight/security";
import type { SecurityPluginOptions } from "./types";

function isConfigRecord(obj: unknown): obj is SecurityPluginOptions {
  return typeof obj === "object" && obj !== null && !Array.isArray(obj);
}

let config: SecurityPluginOptions = isConfigRecord(generatedConfig) ? { ...generatedConfig } : {};

/**
 * Returns the active security configuration provided by the Vite plugin.
 */
export function getSecurityConfig(): SecurityPluginOptions {
  return config;
}

/**
 * Internal/test helper to update or reset the security configuration at runtime.
 */
export function setSecurityConfig(next?: SecurityPluginOptions): void {
  config = next ? { ...next } : isConfigRecord(generatedConfig) ? { ...generatedConfig } : {};
}
