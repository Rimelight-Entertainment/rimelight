import type { Component } from "solid-js";
import { config, options } from "virtual:rimelight-cms";
import { CmsDashboard } from "./CmsDashboard";

/** Mounted automatically at `/cms/*` and `/:locale/cms/*` by the `cms()` Vite plugin. */
export const CmsDashboardRoute: Component = () => (
  <CmsDashboard
    apiBase={options.apiPath ?? "/api/cms"}
    blocks={config.blocks ?? []}
    renderers={config.renderers}
    locales={config.locales ?? ["en"]}
  />
);

export default CmsDashboardRoute;
