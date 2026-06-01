import { computed, reactive, ref, watch, type Ref } from "vue";
import type { PageType } from "@/types/pages";
import { usePaginatedPages } from "./usePaginatedPages";
import { actions } from "astro:actions";

export interface NewPostState {
  title: string;
  slug: string;
}

export interface UseBlogIndexOptions {
  draftsInitialLimit?: number;
  postsInitialLimit?: number;
  nextLimit?: number;
  fetchDraftsImmediate?: boolean;
  onToast?: (options: { color: "success" | "error"; title: string; description?: string }) => void;
  onNavigate?: (url: string) => void;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function useBlogIndex(session: Ref<any>, localeRef = ref("en"), options: UseBlogIndexOptions = {}) {
  const {
    draftsInitialLimit = 10,
    postsInitialLimit = 10,
    nextLimit = 9,
    fetchDraftsImmediate,
    onToast,
    onNavigate,
  } = options;

  const isAuthorizedForDrafts = computed(() => {
    const role = session.value?.user?.role;
    return role === "owner" || role === "member" || role === "employee";
  });

  const drafts = usePaginatedPages({
    key: "blog-drafts",
    type: "BlogPost" as PageType,
    status: "draft",
    initialLimit: draftsInitialLimit,
    nextLimit,
    immediate: fetchDraftsImmediate ?? isAuthorizedForDrafts.value,
  });

  const posts = usePaginatedPages({
    key: "blog-posts",
    type: "BlogPost" as PageType,
    status: "published",
    initialLimit: postsInitialLimit,
    nextLimit,
    immediate: true,
  });

  const newPostState = reactive<NewPostState>({
    title: "",
    slug: "",
  });

  const isCreateModalOpen = ref(false);
  const isCreating = ref(false);

  watch(
    () => newPostState.title,
    (newTitle, oldTitle) => {
      const oldGeneratedSlug = slugify(oldTitle || "");
      if (!newPostState.slug || newPostState.slug === oldGeneratedSlug) {
        newPostState.slug = slugify(newTitle);
      }
    },
  );

  const handleCreateSubmit = async (): Promise<void> => {
    isCreating.value = true;

    try {
      const { data, error } = await actions.pages.createPage({
        type: "BlogPost",
        slug: newPostState.slug,
        title: { [localeRef.value]: newPostState.title },
        description: { [localeRef.value]: "" },
        properties: {},
        blocks: []
      });

      if (error) {
        throw new Error(error.message || "Failed to create post");
      }

      onToast?.({
        color: "success",
        title: "Post created successfully"
      });

      isCreateModalOpen.value = false;
      if (data?.slug && onNavigate) {
        onNavigate(`/company/blog/${data.slug}/edit`);
      }
    } catch (e: any) {
      onToast?.({
        color: "error",
        title: "Failed to create post",
        description: e.message
      });
    } finally {
      isCreating.value = false;
    }
  };

  return {
    isAuthorizedForDrafts,
    drafts,
    posts,
    newPostState,
    isCreateModalOpen,
    isCreating,
    handleCreateSubmit,
  };
}
