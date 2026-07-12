import { ref, onMounted, type Ref } from "vue"
import type { Page, PageType } from "@/types/pages"
import { actions } from "astro:actions"

export interface UsePaginatedPagesOptions {
  key: string
  type?: PageType
  status: "draft" | "published"
  initialLimit?: number
  nextLimit?: number
  immediate?: boolean
}

export interface UsePaginatedPagesReturn {
  allPages: Ref<Page[]>
  offset: Ref<number>
  hasMore: Ref<boolean>
  isFetchingMore: Ref<boolean>
  hasLoadedNextPage: Ref<boolean>
  initialStatus: Ref<"idle" | "pending" | "success" | "error">
  refresh: () => Promise<void>
  loadNextPage: () => Promise<void>
}

export function usePaginatedPages(options: UsePaginatedPagesOptions) {
  const {
    type = "Default",
    status,
    initialLimit = 10,
    nextLimit = 9,
    immediate = true
  } = options

  const allPages = ref<Page[]>([])
  const offset = ref<number>(0)
  const hasMore = ref<boolean>(true)
  const isFetchingMore = ref<boolean>(false)
  const hasLoadedNextPage = ref<boolean>(false)
  const initialStatus = ref<"idle" | "pending" | "success" | "error">("idle")

  const fetchPages = async (limit: number, pageOffset: number): Promise<Page[]> => {
    const { data, error } = await actions.pages.getPages({
      type,
      status,
      limit,
      offset: pageOffset
    })

    if (error) {
      console.error("[usePaginatedPages] Fetch error:", error)
      throw new Error(error.message || "Failed to fetch pages")
    }

    return data ?? []
  }

  const refresh = async (): Promise<void> => {
    initialStatus.value = "pending"
    try {
      const newPages = await fetchPages(initialLimit, 0)
      allPages.value = [...newPages]
      offset.value = newPages.length
      hasMore.value = newPages.length === initialLimit
      initialStatus.value = "success"
    } catch {
      initialStatus.value = "error"
    }
  }

  const loadNextPage = async (): Promise<void> => {
    if (!hasMore.value || isFetchingMore.value) return

    isFetchingMore.value = true

    try {
      const newPages = await fetchPages(nextLimit, offset.value)

      if (newPages && newPages.length > 0) {
        allPages.value.push(...newPages)
        offset.value += newPages.length
        hasMore.value = newPages.length === nextLimit
      } else {
        hasMore.value = false
      }

      hasLoadedNextPage.value = true
    } catch (e) {
      console.error("[usePaginatedPages] Load next page failed:", e)
    } finally {
      isFetchingMore.value = false
    }
  }

  if (immediate) {
    onMounted(() => {
      void refresh()
    })
  }

  return {
    allPages,
    offset,
    hasMore,
    isFetchingMore,
    hasLoadedNextPage,
    initialStatus,
    refresh,
    loadNextPage
  }
}
