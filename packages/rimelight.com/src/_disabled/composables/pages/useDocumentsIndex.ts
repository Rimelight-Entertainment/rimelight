import { computed, reactive, ref, watch, type Ref } from "vue"
import type { PageType } from "@/types/pages"
import { usePaginatedPages } from "./usePaginatedPages"
import { actions } from "astro:actions"

export interface NewDocumentState {
  title: string
  slug: string
}

export interface UseDocumentsIndexOptions {
  draftsInitialLimit?: number
  documentsInitialLimit?: number
  nextLimit?: number
  fetchDraftsImmediate?: boolean
  onToast?: (options: { color: "success" | "error"; title: string; description?: string }) => void
  onNavigate?: (url: string) => void
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
}

export function useDocumentsIndex(
  session: Ref,
  localeRef = ref("en"),
  options: UseDocumentsIndexOptions = {}
) {
  const {
    draftsInitialLimit = 10,
    documentsInitialLimit = 10,
    nextLimit = 9,
    fetchDraftsImmediate,
    onToast,
    onNavigate
  } = options

  const isAuthorizedForDrafts = computed(() => {
    const role = session.value?.user?.role
    return role === "owner" || role === "member" || role === "employee"
  })

  const drafts = usePaginatedPages({
    key: "documents-drafts",
    type: "Document" as PageType,
    status: "draft",
    initialLimit: draftsInitialLimit,
    nextLimit,
    immediate: fetchDraftsImmediate ?? isAuthorizedForDrafts.value
  })

  const documents = usePaginatedPages({
    key: "documents-published",
    type: "Document" as PageType,
    status: "published",
    initialLimit: documentsInitialLimit,
    nextLimit,
    immediate: true
  })

  const newDocumentState = reactive<NewDocumentState>({
    title: "",
    slug: ""
  })

  const isCreateModalOpen = ref(false)
  const isCreating = ref(false)

  watch(
    () => newDocumentState.title,
    (newTitle, oldTitle) => {
      const oldGeneratedSlug = slugify(oldTitle || "")
      if (!newDocumentState.slug || newDocumentState.slug === oldGeneratedSlug) {
        newDocumentState.slug = slugify(newTitle)
      }
    }
  )

  const handleCreateSubmit = async (): Promise<void> => {
    isCreating.value = true

    try {
      const { data, error } = await actions.pages.createPage({
        type: "Document",
        slug: newDocumentState.slug,
        title: { [localeRef.value]: newDocumentState.title },
        description: { [localeRef.value]: "" },
        properties: {},
        blocks: []
      })

      if (error) {
        throw new Error(error.message || "Failed to create document")
      }

      onToast?.({
        color: "success",
        title: "Document created successfully"
      })

      isCreateModalOpen.value = false
      if (data?.slug && onNavigate) {
        onNavigate(`/documents/${data.slug}/edit`)
      }
    } catch (e: any) {
      onToast?.({
        color: "error",
        title: "Failed to create document",
        description: e.message
      })
    } finally {
      isCreating.value = false
    }
  }

  return {
    isAuthorizedForDrafts,
    drafts,
    documents,
    newDocumentState,
    isCreateModalOpen,
    isCreating,
    handleCreateSubmit
  }
}
