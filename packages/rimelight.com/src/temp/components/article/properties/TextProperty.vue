<script setup lang="ts">
import { computed } from 'vue';
import EditableText from '@/components/article/base/EditableText.vue';
import type { TextNode, InlineNode } from '@/types/Block';
import Label from '@/components/base/Label.vue';

interface TextPropertyProps {
  label: string;
  value: string | Array<TextNode | InlineNode> | undefined;
  isEditable: boolean;
}

const props = defineProps<TextPropertyProps>();

const emit = defineEmits<{
  (e: 'update:modelValue', newValue: Array<TextNode | InlineNode>): void;
}>();

const handleEditableTextChange = (newValue: Array<TextNode | InlineNode>) => {
  emit('update:modelValue', newValue);
};

const editableTextValue = computed(() =>
    props.value === undefined ? '' : props.value
);
</script>

<template>
  <dt class="w-24">
    <Label :text="props.label" />
  </dt>
  <EditableText
      :value="editableTextValue"
      @update:modelValue="handleEditableTextChange"
      :character-limit="64"
      :supported-marks="[]"
      placeholder="Enter text..."
      class="w-full text-sm"
      :is-editable="props.isEditable"
      root-tag="dd"
  />
</template>