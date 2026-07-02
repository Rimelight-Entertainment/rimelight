<script setup lang="ts">
import { computed } from "vue"
import { type PageData } from "@/types/Page"
import Button from "@/components/base/Button.vue"
import Article from "@/components/article/Article.vue"
import TableOfContents from "@/components/article/TableOfContents.vue"
import PropertyPanel from "@/components/article/PropertyPanel.vue"
import Breadcrumb from "@/components/article/Breadcrumb.vue"
import NewPageModal from "@/components/article/modals/NewPageModal.vue"
import MovePageModal from "@/components/article/modals/MovePageModal.vue"
import ConvertPageModal from "@/components/article/modals/ConvertPageModal.vue"
import AddCategoryModal from "@/components/article/modals/AddCategoryModal.vue"
import NavigatePagesModal from "@/components/article/modals/NavigatePagesModal.vue"
import PlaceBlockModal from "@/components/article/modals/PlaceBlockModal.vue"
import EditableText from "@/components/article/base/EditableText.vue"
import LayoutBox from "@/components/base/LayoutBox.vue"

import { usePageEditor } from "@/composables/usePageEditor"
import { useTableOfContents } from "@/composables/useTableOfContents"
import { usePropertyPanel } from "@/composables/usePropertyPanel"
import { useBreadcrumbs } from "@/composables/useBreadcrumbs"
import { useRenderBlocks } from "@/composables/useRenderBlocks"

interface PageEditorProps {
  initialPageData: PageData
  locale: string
  isEditable: boolean
}

const props = defineProps<PageEditorProps>()

const {
  pageData,
  draggedBlockType,
  saveStatus,
  error,
  displayLastModified,
  isNewPageModalOpen,
  setIsNewPageModalOpen,
  isMovePageModalOpen,
  setIsMovePageModalOpen,
  setIsConvertPageModalOpen,
  isConvertPageModalOpen,
  openAddBlockModal,
  isModalOpen,
  placeBlockModalRef,
  groupedBlocksForRendering,
  filteredAvailableBlocks,
  focusedIndex,
  searchTerm,
  modalPosition,
  isDocumentDropInvalid,
  pageTemplate,
  editorCallbacks,
  handleNewPageCreated,
  handlePageMoved,
  handleConvertPage,
  handleMainPageTitleChange,
  handleDebugBlockSelect,
  closeModal,
  handleSearchTermChange,
  isCategoryModalOpen,
  categorySearchTerm,
  focusedCategoryIndex,
  addCategoryButtonRef,
  categoryModalPosition,
  handleRemoveCategory,
  handleAddCategory,
  openCategoryModal,
  closeCategoryModal,
  handleCategorySearchTermChange,
  filteredCategories,
  isNavigatePagesModalOpen,
  pageStructure,
  browsePagesButtonRef,
  navigatePagesModalPosition,
  openNavigatePagesModal,
  closeNavigatePagesModal,
  handleNavigatePagesNavigate
} = usePageEditor({ initialPageData: props.initialPageData, isEditable: props.isEditable })

const blocksForTableOfContents = computed(() => pageData.value.blocks)

const { headings: pageHeadings, navigateToSection: handleNavigateToSection } =
  useTableOfContents(blocksForTableOfContents)

const { pageTitle, pageProperties, handlePageTitleChange, handlePagePropertiesChange } =
  usePropertyPanel({
    pageData
  })

const breadcrumbs = useBreadcrumbs(pageData)

const renderedDocumentBlocks = computed(() => {
  return useRenderBlocks(
    pageData.value.blocks,
    props.isEditable,
    editorCallbacks,
    0,
    draggedBlockType.value,
    editorCallbacks?.isChildAllowedInParent || (() => true)
  )
})
</script>

<template>
  <LayoutBox direction="vertical" class="mx-auto mt-12 max-w-[1440px] bg-rimelight-primary-800">
    <nav>
      <LayoutBox direction="vertical">
        <LayoutBox direction="horizontal" justify-content="between" align-items="center">
          <LayoutBox v-if="props.isEditable" direction="horizontal" gap="sm"> </LayoutBox>
          <LayoutBox v-else direction="horizontal" gap="sm"> </LayoutBox>

          <LayoutBox v-if="props.isEditable" direction="horizontal" gap="sm">
            <Button
              :ref="browsePagesButtonRef"
              @click="openNavigatePagesModal"
              variant="primary"
              size="sm"
              start-icon="folderOpen"
              text="Browse Pages"
            />
            <Button
              :to="{ path: pageData.slug, query: {} }"
              variant="primary"
              size="sm"
              text="View Page"
            />
            <Button
              @click="setIsNewPageModalOpen(true)"
              variant="primary"
              size="sm"
              text="New Page"
            />
            <Button
              @click="setIsMovePageModalOpen(true)"
              variant="primary"
              size="sm"
              text="Move Page"
            />
            <Button
              @click="setIsConvertPageModalOpen(true)"
              variant="primary"
              size="sm"
              text="Convert Page"
            />
          </LayoutBox>
          <LayoutBox v-else direction="horizontal" gap="sm">
            <Button
              :to="{ path: pageData.slug, query: { mode: 'editor' } }"
              variant="primary"
              size="sm"
              text="Edit Page"
            />
          </LayoutBox>
        </LayoutBox>

        <LayoutBox
          direction="horizontal"
          justify-content="between"
          align-items="center"
          gap="sm"
          class="bg-rimelight-primary-900"
        >
          <LayoutBox v-if="props.isEditable" direction="horizontal" gap="sm">
            <Button variant="primary" size="sm" start-icon="undo" />
            <Button variant="primary" size="sm" start-icon="redo" />
          </LayoutBox>
          <LayoutBox v-else> </LayoutBox>

          <LayoutBox v-if="props.isEditable" direction="horizontal" align-items="center" gap="sm">
            <span class="text-sm text-rimelight-primary-500"> [Editor] </span>
            <span class="text-sm text-rimelight-primary-500">
              Save Status:
              <template v-if="saveStatus === 'idle'">Ready</template>
              <template v-else-if="saveStatus === 'saving'">Saving...</template>
              <template v-else-if="saveStatus === 'saved'">Saved!</template>
              <template v-else-if="saveStatus === 'error'">Save Failed!</template>
              <span v-if="error" class="ml-sm text-rimelight-danger-500">
                {{ error }}
              </span>
            </span>
            <Button variant="primary" size="sm" start-icon="add" @click="openAddBlockModal" />
          </LayoutBox>
          <LayoutBox v-else> </LayoutBox>
        </LayoutBox>
      </LayoutBox>
    </nav>

    <article>
      <LayoutBox direction="vertical" gap="lg" padding="xl" class="bg-rimelight-primary-700">
        <LayoutBox direction="horizontal" gap="xl">
          <TableOfContents
            v-if="pageHeadings.length > 0"
            :headings="pageHeadings"
            @navigate="handleNavigateToSection"
          />

          <LayoutBox direction="vertical" gap="lg" class="flex-grow">
            <LayoutBox
              v-if="breadcrumbs.length > 0"
              direction="horizontal"
              align-items="center"
              class="sticky top-10 z-20 -mt-6 mb-4 bg-rimelight-primary-700 pt-6"
            >
              <Breadcrumb :items="breadcrumbs" />
            </LayoutBox>

            <EditableText
              :value="pageTitle"
              @update:value="handleMainPageTitleChange"
              :is-editable="props.isEditable"
              :supported-marks="[]"
              class="-mt-2 text-5xl font-bold text-rimelight-primary-100"
            />

            <LayoutBox
              v-if="pageData.categories"
              direction="horizontal"
              align-items="center"
              gap="sm"
              class="flex-wrap"
            >
              <template v-if="pageData.categories.length > 0">
                <LayoutBox
                  v-for="(category, index) in pageData.categories"
                  :key="`${category}-${index}`"
                  direction="horizontal"
                  align-items="center"
                  class="rounded-md bg-rimelight-primary-900 px-md py-sm text-sm text-rimelight-primary-100"
                >
                  {{ category }}
                  <Button
                    v-if="props.isEditable"
                    variant="ghost"
                    size="xs"
                    start-icon="close"
                    class="ml-sm pr-sm"
                    @click="handleRemoveCategory(category)"
                  />
                </LayoutBox>
              </template>
              <span v-else-if="props.isEditable" class="text-sm text-rimelight-primary-500">
                No categories added.
              </span>

              <Button
                v-if="props.isEditable"
                :ref="addCategoryButtonRef"
                variant="ghost"
                size="sm"
                start-icon="add"
                text="Add Category"
                @click="openCategoryModal"
                class="ml-md"
              />
            </LayoutBox>

            <Article
              :is-editable="props.isEditable"
              :blocks-data="pageData.blocks"
              :is-drag-invalid="isDocumentDropInvalid"
            >
              <template #default>
                <component
                  :is="block"
                  v-for="(block, index) in renderedDocumentBlocks"
                  :key="index"
                />
              </template>
            </Article>
          </LayoutBox>

          <PropertyPanel
            v-if="
              pageTemplate.propertyPanelSchema &&
              Object.keys(pageTemplate.propertyPanelSchema).length > 0
            "
            :page-title="pageTitle"
            :page-properties="pageProperties"
            :display-schema="pageTemplate.propertyPanelSchema"
            :is-editable="props.isEditable"
            @page-title-change="handlePageTitleChange"
            @page-properties-change="handlePagePropertiesChange"
          />
        </LayoutBox>

        <hr />
        <span class="text-sm text-rimelight-primary-100">
          Last modified: {{ displayLastModified }}
        </span>
      </LayoutBox>
    </article>
  </LayoutBox>

  <NewPageModal
    :is-open="isNewPageModalOpen"
    @close="setIsNewPageModalOpen(false)"
    @page-created="handleNewPageCreated"
  />
  <MovePageModal
    :is-open="isMovePageModalOpen"
    @close="setIsMovePageModalOpen(false)"
    :current-slug="props.initialPageData.slug"
    :current-page-id="props.initialPageData.id"
    @page-moved="handlePageMoved"
  />
  <ConvertPageModal
    :is-open="isConvertPageModalOpen"
    @close="setIsConvertPageModalOpen(false)"
    @convert="handleConvertPage"
  />

  <AddCategoryModal
    v-if="isCategoryModalOpen && props.isEditable"
    :available-categories="filteredCategories"
    :focused-index="focusedCategoryIndex"
    :search-term="categorySearchTerm"
    @select="handleAddCategory"
    @close="closeCategoryModal"
    @search-term-change="handleCategorySearchTermChange"
    :position="categoryModalPosition"
  />
  <NavigatePagesModal
    v-if="isNavigatePagesModalOpen"
    :page-structure="pageStructure"
    @close="closeNavigatePagesModal"
    @navigate="handleNavigatePagesNavigate"
    :position="navigatePagesModalPosition"
  />
  <PlaceBlockModal
    v-if="isModalOpen && props.isEditable"
    :ref="placeBlockModalRef"
    :grouped-blocks="groupedBlocksForRendering"
    :flat-blocks="filteredAvailableBlocks"
    :focused-index="focusedIndex"
    :search-term="searchTerm"
    @select="handleDebugBlockSelect"
    @close="closeModal"
    @search-term-change="handleSearchTermChange"
    :position="modalPosition"
  />
</template>

<style scoped></style>
