<script setup lang="ts">
import { ref, computed } from 'vue';
import Icon from '@/components/base/Icon.vue';
import { NuxtLink } from '#components';


interface NodeProps {
  node: PageNode | FolderNode;
  depth: number;
  onNavigate: (slug: string) => void;
  onToggleFolder: (folderPath: string) => void;
  expandedFolders: Set<string>;
}

const props = defineProps<NodeProps>();

const isHovered = ref(false);

const paddingLeft = computed(() => props.depth * 16 + 8);

const isNodeExpanded = computed(() =>
    props.node.type === 'folder' ? props.expandedFolders.has(props.node.path) : false
);

const handleFolderClick = () => {
  // This handler is only for folder divs
  if (props.node.type === 'folder') {
    props.onToggleFolder(props.node.path);
  }
};

const handleToggleIconClick = (e: MouseEvent) => {
  e.stopPropagation();
  if (props.node.type === 'folder') {
    props.onToggleFolder(props.node.path);
  }
};

const commonClasses = computed(
    () =>
        `flex cursor-pointer items-center px-md py-sm text-sm transition-colors duration-150 ${
            isHovered.value ? 'bg-rimelight-primary-700' : ''
        }`
);

const handlePageLinkClick = (e: MouseEvent) => {
  if (props.node.type === 'page') {
    if (!e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      props.onNavigate(props.node.slug);
    }
  }
};
</script>

<template>
  <div class="flex flex-col">
    <template v-if="node.type === 'page'">
      <NuxtLink
          :to="`/${node.slug}`"
          @click="handlePageLinkClick"
          :class="commonClasses"
          :style="{ paddingLeft: `${paddingLeft}px` }"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
      >
        <Icon name="page" size="sm" class="mr-sm text-rimelight-primary-500" />
        <span class="text-rimelight-primary-100">{{ node.name }}</span>
      </NuxtLink>
    </template>
    <template v-else>
      <div
          @click="handleFolderClick"
          :class="commonClasses"
          :style="{ paddingLeft: `${paddingLeft}px` }"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
      >
        <Icon
            :name="isNodeExpanded ? 'folderOpen' : 'folderClosed'"
            size="sm"
            class="mr-sm text-rimelight-primary-500"
            @click="handleToggleIconClick"
        />
        <span class="text-rimelight-primary-100">{{ node.name }}</span>
      </div>
    </template>

    <div
        v-if="node.type === 'folder' && isNodeExpanded && node.children.length > 0"
        class="flex flex-col"
    >
      <PageExplorerNode
          v-for="childNode in node.children"
          :key="childNode.type === 'folder' ? `folder-${childNode.path}` : `page-${childNode.slug}`"
          :node="childNode"
          :depth="depth + 1"
          :on-navigate="onNavigate"
          :on-toggle-folder="onToggleFolder"
          :expanded-folders="expandedFolders"
      />
    </div>
  </div>
</template>