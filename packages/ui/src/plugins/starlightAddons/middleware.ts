import { defineRouteMiddleware } from "@astrojs/starlight/route-data"
import type { APIContext } from "astro"
import { getRelativeLocaleUrl } from "astro:i18n"
import picomatch from "picomatch"
import config from "virtual:starlight-sidebar-topics/config"
import options from "virtual:starlight-sidebar-topics/options"
import type { StarlightSidebarTopicsSharedConfig } from "./libs/config"
import type { StarlightSidebarTopicsSharedOptions } from "./libs/config"
import type { StarlightEntry } from "./libs/content"

import type { StarlightSidebarTopicsRouteData } from "./data"
import { getTranslation } from "./libs/i18n"
import { ensureLeadingSlash } from "./libs/pathname"
import { throwPluginError } from "./libs/plugin"
import {
  getCurrentTopic,
  getTopicById,
  isTopicFirstPage,
  isTopicLastPage,
  type Topic
} from "./libs/sidebar"

type StarlightRouteLike = {
  entry: StarlightEntry
  hasSidebar: boolean
  id: string
  pagination: { prev?: unknown; next?: unknown }
  sidebar: any[]
}

export const onRequest = defineRouteMiddleware((context) => {
  // Locals are augmented to include starlightRoute for typing without casts
  const { starlightRoute } = context.locals
  const { entry, hasSidebar, id, pagination, sidebar } = starlightRoute

  const topicsConfig = config as unknown as StarlightSidebarTopicsSharedConfig
  const topicsOptions = options as unknown as StarlightSidebarTopicsSharedOptions

  let currentTopic: Topic | undefined

  if (hasSidebar) {
    currentTopic = getCurrentTopic(topicsConfig, sidebar, id, entry)

    if (!currentTopic) {
      const normalizedId = ensureLeadingSlash(id)

      for (const [topicId, patterns] of Object.entries(topicsOptions.topics)) {
        if (!picomatch(patterns)(normalizedId)) continue
        currentTopic = getTopicById(topicsConfig, sidebar, topicId)
        break
      }
    }

    if (!currentTopic) {
      if (picomatch(options.exclude)(ensureLeadingSlash(id))) {
        attachRouteData(context, currentTopic)
        return
      }

      throwPluginError(
        `Failed to find the topic for the \`${id}\` page.`,
        `Either include this page in the sidebar configuration of the desired topic using the \`items\` property, associate an unlisted page with a topic using the \`topic\` frontmatter property or the \`topics\` option, or exclude this page from any topic using the \`exclude\` option.

Learn more in the following guides:

- [Unlisted pages](https://starlight-sidebar-topics.netlify.app/docs/guides/unlisted-pages/)
- [Excluded pages](https://starlight-sidebar-topics.netlify.app/docs/guides/excluded-pages/)`
      )
    }

    starlightRoute.sidebar = currentTopic.sidebar

    if (isTopicFirstPage(sidebar, id)) {
      pagination.prev = undefined
    }

    if (isTopicLastPage(sidebar, id)) {
      pagination.next = undefined
    }
  }

  attachRouteData(context, currentTopic)
})

function attachRouteData(context: APIContext, currentTopic: Topic | undefined) {
  context.locals.starlightSidebarTopics = getRouteData(context.currentLocale, currentTopic)
}

function getRouteData(
  currentLocale: APIContext["currentLocale"],
  currentTopic: Topic | undefined
): StarlightSidebarTopicsRouteData {
  // Build route data with strongly typed config
  const topicConfigs = config as unknown as StarlightSidebarTopicsSharedConfig
  return {
    isPageWithTopic: currentTopic !== undefined,
    topics: topicConfigs.map((topic) => {
      const isLinkTopic = topic.type === "link"

      const topicRouteData: StarlightSidebarTopicsRouteData["topics"][number] = {
        isCurrent:
          isLinkTopic || !currentTopic
            ? false
            : topic.label === currentTopic.config.label && topic.link === currentTopic.config.link,
        label:
          typeof topic.label === "string"
            ? topic.label
            : getTranslation(currentLocale, topic.label, topic.link, "topic label"),
        link:
          !isLinkTopic && currentLocale
            ? getRelativeLocaleUrl(currentLocale, topic.link)
            : topic.link
      }

      if (topic.badge) {
        topicRouteData.badge = {
          text:
            typeof topic.badge.text === "string"
              ? topic.badge.text
              : getTranslation(currentLocale, topic.badge.text, topic.link, "topic badge text"),
          variant: topic.badge.variant
        }
      }

      if (topic.icon) {
        topicRouteData.icon = topic.icon
      }

      return topicRouteData
    })
  }
}
