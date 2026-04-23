import type { StarlightLocals } from "@astrojs/starlight/types"
import type { StarlightSidebarTopicsRouteData } from "./data"

declare namespace App {
  interface Locals extends StarlightLocals {
    /**
     * Starlight Sidebar Topics data.
     *
     * @see https://starlight-sidebar-topics.netlify.app/docs/guides/custom-topic-list/
     */
    starlightSidebarTopics: StarlightSidebarTopicsRouteData
    starlightRoute: any
  }
}
