<script setup lang="ts">
import { computed, ref } from "vue"
import { useRC } from "@/composables"
import { scv, cx } from "css-variants"
import { getLocalizedContent } from "@/utils/page"
import { useI18n } from "@/composables/app/useI18n"
import type { Page } from "@/types/pages"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"

/* region Props */
export interface TreeItem {
  label: string
  icon?: string
  slug?: string
  path: string
  children?: TreeItem[]
  defaultExpanded?: boolean
}

export interface PageTreeModalProps {
  loading?: boolean
  pages?: Pick<Page, "title" | "slug">[]
  basePath?: string
  rc?: {
    header?: string
    headerTitle?: string
    closeButton?: string
    body?: string
    footer?: string
  }
}

const { loading, pages = [], basePath, rc: rcProp } = defineProps<PageTreeModalProps>()
const { rc } = useRC("PageTreeModal", rcProp)
/* endregion */

/* region Emits */
export interface PageTreeModalEmits {
  close: []
  navigate: [slug: string]
}
const emit = defineEmits<PageTreeModalEmits>()
/* endregion */

/* region Styles */
const pageTreeModalStyles = scv({
  slots: {
    headerClass: "flex items-center justify-between px-4 py-3 border-b border-default",
    headerTitleClass: "text-base font-semibold leading-6",
    closeButtonClass: "-my-1",
    bodyClass: "p-4 min-h-[300px] max-h-[60vh] overflow-y-auto space-y-2",
    footerClass: "flex justify-end gap-2 p-4 border-t border-default",
    loadingWrapper: "p-4 flex justify-center items-center py-12",
    emptyWrapper: "p-4 text-center text-neutral-500 py-12",
    itemWrapper:
      "flex items-center gap-2 py-1.5 w-full hover:bg-neutral-50 dark:hover:bg-neutral-800/50 px-2 rounded-md transition cursor-pointer text-left",
    itemLabel: "text-sm",
    arrowIcon: "w-4 h-4 text-neutral-400 shrink-0"
  }
})

const styles = computed(() => {
  const resolved = pageTreeModalStyles()
  const result: Record<string, string> = {}
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot])
  }
  return result as Record<string, string>
})
/* endregion */

/* region State */
const open = defineModel<boolean>("open", { default: false })
const { t, locale } = useI18n()
const expandedNodes = ref<Record<string, boolean>>({})

const treeItems = computed<TreeItem[]>(() => {
  if (!pages || pages.length === 0) return []
  const nodeMap = new Map<string, TreeItem>()
  const rootNodes: TreeItem[] = []
  const cleanBasePath = basePath ? basePath.replace(/^\/|\/$/g, "") : ""

  const getNode = (
    path: string,
    partLabel: string,
    pageObj?: Pick<Page, "title" | "slug">
  ): TreeItem => {
    if (!nodeMap.has(path)) {
      const label = pageObj
        ? getLocalizedContent(pageObj.title, locale.value) || partLabel
        : partLabel.charAt(0).toUpperCase() + partLabel.slice(1)
      const newNode: TreeItem = {
        label,
        path,
        slug: pageObj ? pageObj.slug : undefined,
        icon: pageObj ? "i-lucide-file" : "i-lucide-folder",
        children: []
      }
      nodeMap.set(path, newNode)
    } else if (pageObj) {
      const node = nodeMap.get(path)!
      node.label = getLocalizedContent(pageObj.title, locale.value) || node.label
      node.slug = pageObj.slug
      node.icon = "i-lucide-file-text"
    }
    return nodeMap.get(path)!
  }

  pages.forEach((page) => {
    const cleanSlug = page.slug.replace(/^\/|\/$/g, "")
    let relativePath = cleanSlug
    if (cleanBasePath && cleanSlug.startsWith(cleanBasePath)) {
      relativePath = cleanSlug.slice(cleanBasePath.length).replace(/^\//, "")
    } else if (cleanBasePath) {
      if (cleanSlug === cleanBasePath) {
        relativePath = ""
      }
    }
    const parts = relativePath.split("/").filter(Boolean)
    if (parts.length === 0) {
      const node = getNode("__root__", "Overview", page)
      if (!rootNodes.includes(node)) {
        rootNodes.push(node)
      }
      return
    }
    let currentPath = ""
    let parent: TreeItem | null = null
    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part
      const isLast = index === parts.length - 1
      const pageObj = isLast ? page : undefined
      const node = getNode(currentPath, part, pageObj)
      if (index === 0) {
        if (!rootNodes.includes(node)) {
          rootNodes.push(node)
        }
      } else {
        if (parent && !parent.children?.some((c) => c.path === node.path)) {
          if (!parent.children) {
            parent.children = []
          }
          parent.children.push(node)
        }
      }
      parent = node
    })
  })

  const processNodes = (nodes: TreeItem[]) => {
    nodes.sort((a, b) => a.label.localeCompare(b.label))
    for (const node of nodes) {
      if (node.slug && node.children && node.children.length > 0) {
        const indexNode: TreeItem = {
          label: `Overview: ${node.label}`,
          slug: node.slug,
          path: `${node.path}:index`,
          icon: "i-lucide-file-text",
          children: []
        }
        if (!node.children.some((c) => c.path === indexNode.path)) {
          node.children.unshift(indexNode)
        }
        node.slug = undefined
        node.icon = "i-lucide-folder"
      }
      if (node.children && node.children.length > 0) {
        processNodes(node.children)
      }
    }
  }

  processNodes(rootNodes)
  return rootNodes
})
/* endregion */

defineOptions({ name: "PageTreeModal" })

/* region Logic */
const handleSelect = (node: TreeItem) => {
  if (node.slug) {
    emit("navigate", node.slug)
    open.value = false
  } else {
    expandedNodes.value[node.path] = !expandedNodes.value[node.path]
  }
}

const isExpanded = (node: TreeItem) => {
  return expandedNodes.value[node.path] ?? false
}
/* endregion */
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    @click.self="open = false"
  >
    <div
      class="bg-white dark:bg-neutral-900 border border-default rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col"
    >
      <div :class="styles.headerClass">
        <h3 :class="styles.headerTitleClass">
          {{ t("editor.page_hierarchy", "Page Hierarchy") }}
        </h3>
        <RLVButton
          color="neutral"
          variant="ghost"
          leading-icon="i-lucide-x"
          class="!p-1.5"
          :class="styles.closeButtonClass"
          @click="open = false"
        />
      </div>

      <div :class="styles.bodyClass">
        <div v-if="loading" :class="styles.loadingWrapper">
          <span class="i-lucide-loader-2 size-6 animate-spin text-neutral-400" />
        </div>

        <div v-else-if="treeItems.length === 0" :class="styles.emptyWrapper">
          {{ t("editor.no_pages_found", "No pages found.") }}
        </div>

        <div v-else class="space-y-1">
          <!-- Recursive tree template helper -->
          <div v-for="item in treeItems" :key="item.path" class="space-y-1">
            <button :class="styles.itemWrapper" @click="handleSelect(item)">
              <span
                v-if="item.children && item.children.length > 0"
                :class="[
                  isExpanded(item) ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right',
                  styles.arrowIcon
                ]"
              />
              <span v-else class="w-4 shrink-0" />
              <span v-if="item.icon" :class="[item.icon, 'size-4 shrink-0 opacity-60']" />
              <span
                :class="[
                  styles.itemLabel,
                  item.slug
                    ? 'text-neutral-900 dark:text-neutral-100 font-medium'
                    : 'text-neutral-500'
                ]"
              >
                {{ item.label }}
              </span>
            </button>

            <!-- Children panel -->
            <div
              v-if="item.children && item.children.length > 0 && isExpanded(item)"
              class="pl-4 border-l border-default ml-4 space-y-1"
            >
              <button
                v-for="sub in item.children"
                :key="sub.path"
                :class="styles.itemWrapper"
                @click="handleSelect(sub)"
              >
                <span v-if="sub.icon" :class="[sub.icon, 'size-4 shrink-0 opacity-60']" />
                <span
                  :class="[
                    styles.itemLabel,
                    sub.slug
                      ? 'text-neutral-900 dark:text-neutral-100 font-medium'
                      : 'text-neutral-500'
                  ]"
                >
                  {{ sub.label }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div :class="styles.footerClass">
        <RLVButton
          color="neutral"
          variant="ghost"
          :label="t('common.close', 'Close')"
          @click="open = false"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
