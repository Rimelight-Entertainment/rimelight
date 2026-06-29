<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { type PageSearchData, type PageSearchResults } from '@/types/Page';
import { usePageUtils } from '@/composables/usePageUtils';
import { PageType } from '@/types/Page';
import Modal from '@/components/base/Modal.vue';
import Input from '@/components/base/Input.vue';
import Button from '@/components/base/Button.vue';
import LayoutBox from '@/components/base/LayoutBox.vue';
import { debounce } from '@/utils/function-utils';

interface PageSearchAndSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (slug: string) => void;
  allowedPageTypes?: PageType[];
}

const props = defineProps<PageSearchAndSelectModalProps>();

const pageUtils = usePageUtils();

const searchTerm = ref('');
const searchResults = ref<PageSearchResults | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const debouncedSearch = debounce(async () => {
  if (!searchTerm.value.trim()) {
    searchResults.value = null;
    error.value = null;
    return;
  }

  isLoading.value = true;
  error.value = null;
  try {
    searchResults.value = await pageUtils.searchPages(searchTerm.value);
  } catch (err) {
    console.error('Error searching pages:', err);
    error.value = 'Failed to search pages. Please try again.';
    searchResults.value = null;
  } finally {
    isLoading.value = false;
  }
}, 300);

watch(searchTerm, () => {
  debouncedSearch();
});

watch(
    () => props.isOpen,
    (newIsOpen) => {
      if (newIsOpen) {
        searchTerm.value = '';
        searchResults.value = null;
        isLoading.value = false;
        error.value = null;
      }
    }
);

const handleSelect = (slug: string) => {
  props.onSelectPage(slug);
  props.onClose();
  searchTerm.value = '';
  searchResults.value = null;
};

const uniqueFilteredResults = computed<PageSearchData[]>(() => {
  if (!searchResults.value) return [];

  const combinedResults = [
    ...(searchResults.value.matchingTitles || []),
    ...(searchResults.value.matchingCategories || []),
    ...(searchResults.value.matchingTags || []),
  ];

  // Filter by allowedPageTypes if provided
  const filteredByType = props.allowedPageTypes
      ? combinedResults.filter(
          (page) => props.allowedPageTypes?.includes(page.type)
      )
      : combinedResults;

  // Ensure uniqueness by ID and sort by title
  return Array.from(
      new Map<string, PageSearchData>(
          filteredByType.map((page) => [page.id, page])
      ).values()
  ).sort((a, b) => a.title.localeCompare(b.title));
});
</script>

<template>
  <Modal
      :is-open="props.isOpen"
      @close="props.onClose"
      title="Search Page"
      description="Select the page to be linked."
  >
    <LayoutBox direction="vertical" gap="md">
      <Input
          type="text"
          v-model="searchTerm"
          placeholder="Search page by name or slug..."
          class="w-full"
      />
      <div class="mt-md h-60 w-full overflow-y-auto">
        <p v-if="isLoading" class="text-rimelight-primary-400">Searching...</p>
        <p v-else-if="error" class="text-rimelight-error-500">{{ error }}</p>
        <p
            v-else-if="
            !searchResults ||
            (searchResults.matchingTitles.length === 0 &&
              searchResults.matchingCategories.length === 0 &&
              searchResults.matchingTags.length === 0)
          "
            class="text-rimelight-primary-400"
        >
          {{
            searchTerm.trim()
                ? 'No results found.'
                : 'Start typing to search for pages.'
          }}
        </p>
        <p
            v-else-if="uniqueFilteredResults.length === 0"
            class="text-rimelight-primary-400"
        >
          No pages found matching your search and selected filters.
        </p>
        <ul v-else class="document-editor-scrollbar max-h-60 overflow-y-auto">
          <li
              v-for="page in uniqueFilteredResults"
              :key="page.id"
              class="mb-2 cursor-pointer rounded p-2 hover:bg-rimelight-primary-700"
          >
            <button
                type="button"
                @click="handleSelect(page.slug)"
                class="w-full text-left text-rimelight-primary-100"
            >
              <strong class="text-rimelight-accent-blue">
                {{ page.title }}
              </strong>
              <span class="block text-sm text-rimelight-primary-400">
                /{{ page.slug === '' ? 'index' : page.slug }} ({{ page.type }})
              </span>
            </button>
          </li>
        </ul>
      </div>
    </LayoutBox>
    <div
        class="flex w-full justify-end border-t border-rimelight-primary-700 p-md"
    >
      <Button @click="props.onClose" variant="primary"> Cancel </Button>
    </div>
  </Modal>
</template>