import { type Component, lazy } from "solid-js";
import type { RouteDefinition } from "@solidjs/router";
import { fileRoutes as baseFileRoutes } from "@solidjs/router/fs";

const CmsDashboard = lazy(() =>
  import("@rimelight/cms/client/components").then((m) => ({ default: m.CmsDashboard })),
);

export interface CmsRouteOptions {
  basePath?: string;
}

/**
 * Returns route definitions for the CMS dashboard.
 * Injects routes for `/:locale/cms/*` and `/cms/*`.
 */
export function createCmsRoutes(options: CmsRouteOptions = {}): RouteDefinition[] {
  const base = options.basePath ? options.basePath.replace(/\/$/, "") : "";
  return [
    {
      path: `${base}/:locale/cms/*`,
      component: CmsDashboard as Component,
    },
    {
      path: `${base}/:locale/cms`,
      component: CmsDashboard as Component,
    },
    {
      path: `${base}/cms/*`,
      component: CmsDashboard as Component,
    },
    {
      path: `${base}/cms`,
      component: CmsDashboard as Component,
    },
  ];
}

/**
 * Helper to combine filesystem routes with CMS routes.
 */
export function withCmsRoutes(
  routes: RouteDefinition[] | Parameters<typeof baseFileRoutes>[0],
  options?: CmsRouteOptions,
): RouteDefinition[] {
  const baseRoutes = Array.isArray(routes) ? routes : baseFileRoutes(routes as any);
  return [...createCmsRoutes(options), ...baseRoutes];
}
