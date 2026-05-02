/// <reference path="./locals.d.ts" />
import type { StarlightPlugin, StarlightUserConfig } from "@astrojs/starlight/types"
import virtual from "vite-plugin-virtual"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { z } from "astro/zod"

import {
  StarlightSidebarTopicsConfigSchema,
  StarlightSidebarTopicsOptionsSchema,
  type StarlightSidebarTopicsUserConfig,
  type StarlightSidebarTopicsUserOptions
} from "./libs/config"
import { throwPluginError } from "./libs/plugin"
import { vitePluginStarlightSidebarTopics } from "./libs/vite"

export type {
  StarlightSidebarTopicsConfig,
  StarlightSidebarTopicsUserConfig,
  StarlightSidebarTopicsOptions,
  StarlightSidebarTopicsUserOptions
} from "./libs/config"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export interface StarlightAddonsConfig {
  copy?: boolean
  share?: boolean
  // Merged config for Topics
  topics?: StarlightSidebarTopicsUserConfig
  topicOptions?: StarlightSidebarTopicsUserOptions
}

export default function starlightAddons(userConfig?: StarlightAddonsConfig): StarlightPlugin {
  // 1. Setup default and merged config for Addons
  const defaultAddonConfig: StarlightAddonsConfig = {
    copy: true,
    share: true
  }

  const addonConfig = { ...defaultAddonConfig, ...userConfig }

  // 2. Validate Sidebar Topics configurations if they exist
  const parsedTopics = StarlightSidebarTopicsConfigSchema.safeParse(addonConfig.topics || [])
  if (!parsedTopics.success) {
    throwPluginError(
      `Invalid topics config: ${parsedTopics.error.issues.map((i) => i.message).join("\n")}`
    )
  }

  const parsedOptions = StarlightSidebarTopicsOptionsSchema.safeParse(addonConfig.topicOptions)
  if (!parsedOptions.success) {
    throwPluginError(`Invalid topic options: ${z.prettifyError(parsedOptions.error)}`)
  }

  const topicsData = parsedTopics.data
  const optionsData = parsedOptions.data

  return {
    name: "rimelight-ui-starlight-addons",
    hooks: {
      "config:setup"({ addIntegration, updateConfig, logger, command, config: starlightConfig }) {
        // --- Sidebar Topics Logic ---
        if ((command === "dev" || command === "build") && topicsData.length > 0) {
          if (starlightConfig.sidebar) {
            throwPluginError(
              "Sidebar detected. To use topics, move your sidebar items into the topics config."
            )
          }

          const topicSidebar: StarlightUserConfig["sidebar"] = topicsData.map((topic, index) => {
            return "items" in topic
              ? { label: String(index), items: topic.items }
              : { label: String(index), items: [] }
          })

          updateConfig({
            sidebar: topicSidebar,
            components: {
              Sidebar: `starlight-sidebar-topics/overrides/Sidebar.astro`
            }
          })
        }

        // --- Addons Logic ---
        if (!addonConfig.copy && !addonConfig.share) {
          logger.warn("StarlightAddons: No features enabled.")
        }

        updateConfig({
          components: {
            // This will merge with the Sidebar override if both exist
            PageTitle: path.join(__dirname, "PageTitle.astro")
          }
        })

        // --- Unified Integration ---
        addIntegration({
          name: "rimelight-ui-starlight-addons-integration",
          hooks: {
            "astro:config:setup": ({ updateConfig: updateAstroConfig }) => {
              updateAstroConfig({
                vite: {
                  plugins: [
                    virtual({
                      "virtual:rimelight-starlight-addons-config": `export default ${JSON.stringify(addonConfig)}`
                    }),
                    // Pass the validated topic data to the vite plugin
                    vitePluginStarlightSidebarTopics(topicsData, optionsData)
                  ]
                }
              } as Record<string, unknown>)
            }
          }
        })
      }
    }
  }
}
