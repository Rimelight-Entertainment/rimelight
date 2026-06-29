<script setup lang="ts">
import {computed, h, nextTick, onMounted, onUnmounted, ref, watch} from 'vue';
import {usePageUtils} from '@/composables/usePageUtils';
import type {SearchResults} from '@/types/Page';

interface MentionSearchInputProps {
  searchTerm: string;
  onSelectPage: (id: string, slug: string, title: string) => void;
  onClose: () => void;
  position: { top: number; left: number };
}

interface PageTitleData {
  id: string;
  slug: string;
  title: string;
}

const props = defineProps<MentionSearchInputProps>();

const pageUtils = usePageUtils();

const searchResults = ref<SearchResults | null>(null);
const debouncedSearchTerm = ref(props.searchTerm);
const selectedIndex = ref(0);
const containerRef = ref<HTMLDivElement | null>(null);
const listItemRefs = ref(new Map<string, HTMLLIElement | null>());

let removeClickListener: (() => void) | null = null;
onMounted(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
        containerRef.value &&
        !containerRef.value.contains(event.target as Node)
    ) {
      props.onClose();
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  removeClickListener = () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
});
onUnmounted(() => {
  if (removeClickListener) {
    removeClickListener();
  }
});

watch(
    () => props.searchTerm,
    (newSearchTerm) => {
      const handler = setTimeout(() => {
        debouncedSearchTerm.value = newSearchTerm;
      }, 300);

      return () => {
        clearTimeout(handler);
      };
    },
    { immediate: true }
);

watch(
    debouncedSearchTerm,
    async (newDebouncedSearchTerm) => {
      if (newDebouncedSearchTerm) {
        try {
          searchResults.value = await pageUtils.searchPages(newDebouncedSearchTerm);
          selectedIndex.value = 0;
        } catch (error) {
          console.error('Failed to search pages for mentions:', error);
          searchResults.value = null;
        }
      } else {
        searchResults.value = null; // Corrected from `setSearchResults(null)`
      }
    },
    { immediate: true }
);

const navigablePages = computed<PageTitleData[]>(() => {
  if (!searchResults.value) return [];

  const combined = [
    ...(searchResults.value.matchingTitles || []),
    ...(searchResults.value.matchingTags || []),
    ...(searchResults.value.matchingCategories || []),
  ];

  return Array.from(
      new Map(combined.map((page) => [page.id, page])).values()
  ).sort((a, b) => a.title.localeCompare(b.title));
});

watch(
    [selectedIndex, navigablePages],
    async () => {
      if (navigablePages.value.length > 0) {
        await nextTick();
        const selectedPageId = navigablePages.value[selectedIndex.value]?.id;
        const selectedItem = selectedPageId
            ? listItemRefs.value.get(selectedPageId)
            : null;

        if (selectedItem) {
          selectedItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    },
    { flush: 'post' }
);

const handleSelect = (page: PageTitleData) => {
  props.onSelectPage(page.id, page.slug, page.title);
  props.onClose();
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (navigablePages.value.length === 0) return;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      selectedIndex.value =
          (selectedIndex.value + 1) % navigablePages.value.length;
      break;
    case 'ArrowUp':
      event.preventDefault();
      selectedIndex.value =
          (selectedIndex.value - 1 + navigablePages.value.length) %
          navigablePages.value.length;
      break;
    case 'Enter':
      event.preventDefault();
      if (navigablePages.value[selectedIndex.value]) {
        handleSelect(navigablePages.value[selectedIndex.value]);
      }
      break;
    case 'Escape':
      event.preventDefault();
      props.onClose();
      break;
    default:
      break;
  }
};

const isItemSelected = computed(() => (pageId: string) => {
  return navigablePages.value[selectedIndex.value]?.id === pageId;
});

const renderCategory = (
    heading: string,
    pages: PageTitleData[] | undefined,
    categoryKey: string
) => {
  if (!pages || pages.length === 0) return null;

  return h('div', { key: categoryKey }, [
    h(
        'h3',
        {
          class:
              'py-xs mt-sm border-b border-rimelight-primary-700 px-sm text-sm font-semibold text-rimelight-primary-300 first:mt-0',
        },
        heading
    ),
    h(
        'ul',
        { class: 'm-0 list-none p-0' },
        pages.map((page) =>
            h(
                'li',
                {
                  key: `${categoryKey}-${page.id}`,
                  ref: (el) => {
                    listItemRefs.value.set(page.id, el as HTMLLIElement);
                  },
                  class: `py-xs cursor-pointer px-sm hover:bg-rimelight-primary-700 ${
                      isItemSelected.value(page.id) ? 'bg-rimelight-primary-600' : ''
                  }`,
                  onClick: () => handleSelect(page),
                  tabindex: 0,
                  role: 'option',
                  'aria-selected': isItemSelected.value(page.id),
                },
                page.title
            )
        )
    ),
  ]);
};
</script>

<template>
  <Teleport to="body">
    <div
        ref="containerRef"
        class="absolute z-50 overflow-hidden rounded border border-rimelight-primary-600 bg-rimelight-primary-800 shadow-lg"
        :style="{
        top: `${props.position.top}px`,
        left: `${props.position.left}px`,
        maxHeight: '300px',
        overflowY: 'auto',
      }"
        @keydown="handleKeyDown"
    >
      <div
          v-if="debouncedSearchTerm === '' && !searchResults"
          class="py-xs px-sm text-rimelight-primary-300"
      >
        Type to search for pages...
      </div>

      <div
          v-else-if="debouncedSearchTerm !== '' && navigablePages.length === 0"
          class="py-xs px-sm text-rimelight-primary-300"
      >
        No pages found.
      </div>

      <template v-else-if="navigablePages.length > 0">
        <div
            class="p-xs border-b border-rimelight-primary-600 text-sm text-rimelight-primary-300"
        >
          Searching for:
          <span class="font-semibold text-rimelight-neutral-50">
            {{ debouncedSearchTerm }}
          </span>
        </div>

        <component
            :is="
            renderCategory(
              'Pages with matching title:',
              searchResults?.matchingTitles,
              'titles'
            )
          "
        />
        <component
            :is="
            renderCategory(
              'Pages with matching categories:',
              searchResults?.matchingCategories,
              'categories'
            )
          "
        />
        <component
            :is="
            renderCategory(
              'Pages with matching tags:',
              searchResults?.matchingTags,
              'tags'
            )
          "
        />
      </template>
    </div>
  </Teleport>
</template>