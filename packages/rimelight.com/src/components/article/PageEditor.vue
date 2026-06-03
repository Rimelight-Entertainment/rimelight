<script setup lang="ts">
import { ref, computed, watch, provide } from "vue";
import type { Page, PageSurround, PageDefinition, PageVersion } from "@/types/pages";
import { scv, cx } from "css-variants";
import { useRC, usePageEditor } from "@/composables";
import { useI18n } from "@/composables/app/useI18n";
import { getLocalizedContent, syncPageWithDefinition, dehydratePageProperties } from "@/utils/page";
import PageTOC from "./PageTOC.vue";
import PagePropertiesEditor from "./PagePropertiesEditor.vue";
import PageRenderer from "./PageRenderer.vue";
import BlockEditor from "./blocks/BlockEditor.vue";
import PageSurroundComponent from "./PageSurround.vue";
import DeletePageModal from "./modals/DeletePageModal.vue";
import PageTreeModal from "./modals/PageTreeModal.vue";
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue";
import RLVInput from "@rimelight/ui/components/vue/RLVInput.vue";
import RLVFormField from "@rimelight/ui/components/vue/RLVFormField.vue";
import PageVersionSelector from "./PageVersionSelector.vue";

/* region Props */
export interface PageEditorProps {
  isSaving: boolean;
  isViewingVersion?: boolean;
  useSurround?: boolean;
  surround?: PageSurround | null;
  surroundStatus?: "idle" | "pending" | "success" | "error";
  resolvePage: (id: string) => Promise<Pick<Page, "title" | "icon" | "slug">>;
  pageDefinitions: Record<string, PageDefinition>;
  onDeletePage?: (id: string) => Promise<void>;
  onFetchPages?: () => Promise<Pick<Page, "title" | "slug" | "type" | "id">[]>;
  onNavigateToPage?: (slug: string) => void;
  onViewPage?: (slug: string) => void;
  basePath?: string;
  isAdmin?: boolean;
  rc?: {
    header?: string;
    headerGroup?: string;
    splitContainer?: string;
    editorColumn?: string;
    container?: string;
    grid?: string;
    toc?: string;
    properties?: string;
    contentWrapper?: string;
    banner?: string;
    icon?: string;
    title?: string;
    surroundSkeleton?: string;
    skeleton?: string;
    metadata?: string;
    resizer?: string;
    previewColumn?: string;
  };
}

const {
  isSaving,
  isViewingVersion = false,
  useSurround = false,
  surroundStatus = "idle",
  surround = null,
  resolvePage,
  onDeletePage,
  onFetchPages,
  onNavigateToPage,
  onViewPage,
  basePath,
  isAdmin = false,
  pageDefinitions,
  rc: rcProp
} = defineProps<PageEditorProps>();
const { rc } = useRC("PageEditor", rcProp);
provide("page-resolver", resolvePage);
/* endregion */

/* region Emits */
export interface PageEditorEmits {
  "save": [value: Page];
  "version-navigate": [version: PageVersion];
  "version-approved": [version: PageVersion];
  "version-rejected": [version: PageVersion];
  "version-reverted": [version: PageVersion];
  "publish": [value: Page];
  "unpublish": [value: Page];
}
const emit = defineEmits<PageEditorEmits>();
/* endregion */

/* region Styles */
const pageEditorStyles = scv({
  slots: {
    header: "h-12 w-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-between px-4 border-b border-default",
    headerGroup: "flex items-center gap-2",
    splitContainer: "flex w-full min-h-0",
    editorColumn: "relative overflow-y-auto p-6 flex-1 w-full min-w-0 max-w-7xl mx-auto",
    container: "flex flex-col py-8 w-full",
    grid: "grid grid-cols-1 lg:grid-cols-24 gap-8 items-start w-full",
    toc: "hidden lg:flex lg:col-span-4 sticky top-20 self-start",
    properties: "order-1 lg:order-2 lg:col-span-6",
    contentWrapper: "order-2 lg:order-1 lg:col-span-14 flex flex-col gap-6 w-full min-w-0",
    banner: "rounded-xl w-full object-cover max-h-[220px]",
    icon: "rounded-full w-12 h-12 object-cover border border-default",
    title: "",
    surroundSkeleton: "grid grid-cols-1 gap-4 sm:grid-cols-2 mt-8",
    skeleton: "h-48 w-full rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse",
    metadata: "flex flex-col gap-1 text-xs text-dimmed p-4 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-default mt-8",
    resizer: "sticky flex flex-col items-center justify-center w-6 cursor-col-resize group px-1 py-16 self-start",
    previewColumn: "sticky self-start overflow-y-auto min-h-0",
    headerText: "text-xs text-neutral-500 dark:text-neutral-400 font-medium whitespace-nowrap",
    headerHighLight: "text-neutral-900 dark:text-white font-semibold",
    headerSeparator: "w-px h-4 bg-neutral-200 dark:bg-neutral-700 mx-2",
    titleWrapper: "flex flex-row gap-2 items-center w-full",
    titleInput: "text-4xl font-bold p-0 focus:ring-0 shadow-none border-0 bg-transparent w-full",
    descriptionInput: "p-0 text-lg text-dimmed focus:ring-0 shadow-none border-0 bg-transparent w-full"
  }
});

const styles = computed(() => {
  const resolved = pageEditorStyles();
  const result: Record<string, string> = {};
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot]);
  }
  return result as Record<string, string>;
});
/* endregion */

/* region State */
const page = defineModel<Page>({ required: true });
const versionId = defineModel<string | null>("currentVersionId", { default: null });
const { undo, redo, canUndo, canRedo, captureSnapshot, resetHistory, pauseHistory, resumeHistory } =
  usePageEditor(page);
const { t, locale } = useI18n();

const showPreview = ref(false);
const isResizing = ref(false);
const editorWidth = ref(50);
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);
const isPageTreeModalOpen = ref(false);
const isFetchingTree = ref(false);
const treePages = ref<Pick<Page, "title" | "slug">[]>([]);

const currentDefinition = computed(() => {
  if (!page.value?.type || !pageDefinitions) return null;
  return pageDefinitions[page.value.type];
});

const previousPage = computed(() => surround?.previous);
const nextPage = computed(() => surround?.next);
const hasSurround = computed(() => !!(surround?.previous || surround?.next));
/* endregion */

/* region Meta */
defineOptions({ name: "PageEditor" });
/* endregion */

/* region Lifecycle */
watch(
  [() => page.value?.id, () => versionId.value, () => page.value?.type, currentDefinition],
  () => {
    if (page.value && currentDefinition.value) {
      console.log("[PageEditor] Syncing page with definition", page.value.id, versionId.value);
      syncPageWithDefinition(page.value, currentDefinition.value);
      if (!page.value.description) {
        page.value.description = { en: "" };
      }
    }
  },
  { immediate: true }
);
/* endregion */

/* region Logic */
const handleViewPage = () => {
  if (onViewPage) {
    onViewPage(page.value.slug);
  } else if (typeof window !== "undefined") {
    window.location.href = `/${page.value.slug}`;
  }
};

const handleSave = () => {
  if (currentDefinition.value) {
    syncPageWithDefinition(page.value, currentDefinition.value);
  }
  const dataToPersist = JSON.parse(JSON.stringify(page.value));
  dataToPersist.properties = dehydratePageProperties(dataToPersist.properties);
  emit("save", dataToPersist);
};

const handlePublishToggle = () => {
  if (currentDefinition.value) {
    syncPageWithDefinition(page.value, currentDefinition.value);
  }
  const dataToPersist = JSON.parse(JSON.stringify(page.value));
  dataToPersist.properties = dehydratePageProperties(dataToPersist.properties);
  if (page.value.postedAt) {
    emit("unpublish", dataToPersist);
  } else {
    emit("publish", dataToPersist);
  }
};

const handleDeleteConfirm = async () => {
  if (!onDeletePage || !page.value.id) return;
  try {
    isDeleting.value = true;
    await onDeletePage(page.value.id);
    isDeleteModalOpen.value = false;
  } catch (err) {
    console.error("Failed to delete page:", err);
  } finally {
    isDeleting.value = false;
  }
};

const handleOpenTree = async () => {
  if (!onFetchPages) return;
  isFetchingTree.value = true;
  try {
    treePages.value = await onFetchPages();
    isPageTreeModalOpen.value = true;
  } catch (e) {
    console.error("Failed to fetch pages for tree", e);
  } finally {
    isFetchingTree.value = false;
  }
};

const handleTreeNavigate = (slug: string) => {
  if (onNavigateToPage) {
    onNavigateToPage(slug);
  }
};

const removeBanner = () => {
  page.value.banner = undefined;
};

defineExpose({ undo, redo, canUndo, canRedo, resetHistory });
/* endregion */
</script>

<template>
  <div class="flex flex-col h-screen overflow-hidden">
    <!-- Header Layer -->
    <div :class="styles.header">
      <div :class="styles.headerGroup">
        <RLVButton
          icon="i-lucide-list-tree"
          variant="ghost"
          color="neutral"
          class="!p-1.5"
          :loading="isFetchingTree"
          :disabled="!onFetchPages"
          @click="handleOpenTree"
        />
        <span :class="styles.headerText">
          {{ t("common.editing", "Editing") }}:
          <span :class="styles.headerHighLight">{{ getLocalizedContent(page.title, locale) }}</span>
        </span>
        <span :class="styles.headerSeparator" />
        <PageVersionSelector
          v-if="page.id"
          v-model:current-version-id="versionId"
          :page-id="page.id"
          :is-admin="isAdmin"
          @version-selected="(v: any) => emit('version-navigate', v)"
          @version-approved="(v: any) => emit('version-approved', v)"
          @version-rejected="(v: any) => emit('version-rejected', v)"
          @version-reverted="(v: any) => emit('version-reverted', v)"
        />
        <RLVButton
          icon="i-lucide-rotate-ccw"
          variant="ghost"
          color="neutral"
          class="!p-1.5"
          :disabled="!canUndo"
          @click="undo"
        />
        <RLVButton
          icon="i-lucide-rotate-cw"
          variant="ghost"
          color="neutral"
          class="!p-1.5"
          :disabled="!canRedo"
          @click="redo"
        />
      </div>

      <div :class="styles.headerGroup">
        <RLVButton
          icon="i-lucide-external-link"
          :label="t('page_editor.view_page', 'View Page')"
          variant="ghost"
          color="neutral"
          @click="handleViewPage"
        />
        <RLVButton
          :icon="showPreview ? 'i-lucide-eye-off' : 'i-lucide-eye'"
          :label="t('page_editor.preview', 'Preview')"
          variant="ghost"
          color="neutral"
          @click="showPreview = !showPreview"
        />
        <span :class="styles.headerSeparator" />
        <slot name="header-actions" />
        <RLVButton
          icon="i-lucide-globe"
          :label="
            page.postedAt
              ? t('page_editor.unpublish', 'Unpublish')
              : t('page_editor.publish', 'Publish')
          "
          color="neutral"
          variant="outline"
          :loading="isSaving"
          @click="handlePublishToggle"
        />
        <RLVButton
          icon="i-lucide-save"
          :label="t('page_editor.save', 'Save')"
          color="primary"
          :loading="isSaving"
          @click="handleSave"
        />
        <RLVButton
          icon="i-lucide-trash-2"
          variant="ghost"
          color="danger"
          class="!p-1.5"
          @click="isDeleteModalOpen = true"
        />
      </div>
    </div>

    <!-- Edit Main Workspace -->
    <div :class="styles.splitContainer">
      <div
        :class="styles.editorColumn"
        :style="{ width: showPreview ? `${editorWidth}%` : '100%' }"
      >
        <div :class="styles.container">
          <div :class="styles.grid">
            <PageTOC :page-blocks="page.blocks || []" :levels="[2, 3, 4]" :class="styles.toc" />
            <PagePropertiesEditor
              v-model="page"
              :on-fetch-pages="onFetchPages"
              :class="styles.properties"
            />

            <div :class="styles.contentWrapper">
              <!-- Banner Container -->
              <div
                class="w-full relative group/banner aspect-[5/1] rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-default mb-4 flex items-center justify-center"
              >
                <img
                  v-if="page.banner?.src"
                  :src="page.banner?.src"
                  :alt="page.banner?.alt || 'Banner'"
                  class="absolute inset-0 size-full object-cover"
                />
                <div
                  v-else
                  class="flex flex-col items-center justify-center text-dimmed gap-1 opacity-50 hover:opacity-100 transition duration-150 cursor-pointer"
                >
                  <span class="i-lucide-image size-8" />
                  <span class="text-xs uppercase font-bold tracking-wider">
                    {{ t("page_editor.add_banner", "Add Banner") }}
                  </span>
                </div>

                <div
                  class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/banner:opacity-100 transition"
                >
                  <RLVButton
                    v-if="page.banner?.src"
                    icon="i-lucide-trash"
                    variant="solid"
                    color="danger"
                    class="!p-1.5"
                    @click="removeBanner"
                  />
                </div>
              </div>

              <!-- Title & Desc Inputs -->
              <div class="border-b border-default pb-4">
                <RLVInput
                  v-model="page.title.en"
                  placeholder="Page Title"
                  class="w-full text-4xl font-bold bg-transparent border-0 focus:ring-0 focus:outline-none p-0"
                />
                <textarea
                  v-if="page.description"
                  v-model="page.description.en"
                  placeholder="Add a description..."
                  rows="2"
                  class="w-full text-lg text-dimmed bg-transparent border-0 focus:ring-0 focus:outline-none p-0 resize-none mt-2"
                />
              </div>

              <!-- Inner Block Editor -->
              <BlockEditor
                v-model="page.blocks"
                @start="pauseHistory"
                @mutation="
                  () => {
                    resumeHistory()
                    captureSnapshot()
                  }
                "
              />

              <template v-if="useSurround">
                <div v-if="surroundStatus === 'pending'" :class="styles.surroundSkeleton">
                  <div :class="styles.skeleton" />
                  <div :class="styles.skeleton" />
                </div>

                <PageSurroundComponent
                  v-else-if="surroundStatus === 'success' && hasSurround"
                  :pageType="page.type"
                  :previousTitle="getLocalizedContent(previousPage?.title, locale)"
                  :previousDescription="getLocalizedContent(previousPage?.description, locale)"
                  :previousTo="previousPage?.slug ? `/${previousPage.slug}` : undefined"
                  :nextTitle="getLocalizedContent(nextPage?.title, locale)"
                  :nextDescription="getLocalizedContent(nextPage?.description, locale)"
                  :nextTo="nextPage?.slug ? `/${nextPage.slug}` : undefined"
                />

                <div :class="styles.metadata">
                  <h6 class="font-bold">Metadata</h6>
                  <span>ID: {{ page.id }}</span>
                  <span v-if="page.createdAt">
                    Created: {{ new Date(page.createdAt).toLocaleString() }}
                  </span>
                  <span v-if="page.updatedAt">
                    Updated: {{ new Date(page.updatedAt).toLocaleString() }}
                  </span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Column (Right Side Split) -->
      <div
        v-if="showPreview"
        :class="styles.previewColumn"
        :style="{
          width: `${100 - editorWidth}%`,
          height: 'calc(100vh - 48px)'
        }"
      >
        <PageRenderer
          v-model="page"
          :resolve-page="resolvePage"
          :use-surround="useSurround"
          :surround="surround"
          :surround-status="surroundStatus"
        />
      </div>
    </div>
  </div>

  <DeletePageModal
    v-model:open="isDeleteModalOpen"
    :loading="isDeleting"
    :page-title="getLocalizedContent(page.title, locale)"
    @confirm="handleDeleteConfirm"
  />

  <PageTreeModal
    v-model:open="isPageTreeModalOpen"
    :pages="treePages"
    :base-path="basePath"
    :loading="isFetchingTree"
    @navigate="handleTreeNavigate"
  />
</template>

<style scoped></style>