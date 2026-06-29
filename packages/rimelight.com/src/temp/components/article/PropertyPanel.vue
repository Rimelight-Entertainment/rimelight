<script setup lang="ts">
import { computed } from 'vue';
import type { PropertyPanelSchema } from '@/types/Page';
import type { InlineNode, TextNode } from '@/types/Block';
import NumberProperty from './properties/NumberProperty.vue';
import TextProperty from './properties/TextProperty.vue';
import TextArrayProperty from './properties/TextArrayProperty.vue';
import EnumProperty from './properties/EnumProperty.vue';
import LinkedPageProperty from './properties/LinkedPageProperty.vue';
import PageArrayProperty from './properties/PageArrayProperty.vue';
import EditableText from '@/components/article/base/EditableText.vue';
import LayoutBox from '@/components/base/LayoutBox.vue';

interface PropertyPanelProps {
  pageTitle: string;
  pageProperties: Record<string, unknown>;
  displaySchema?: Record<string, Record<string, PropertyPanelSchema>>;
  isEditable?: boolean;
  className?: string;
}

const props = withDefaults(defineProps<PropertyPanelProps>(), {
  isEditable: false,
});

const emit = defineEmits<{
  (e: 'update:pageTitle', updatedTitle: string): void;
  (e: 'update:pageProperties', updatedProperties: Record<string, unknown>): void;
}>();

const handleTitleChange = (newValue: Array<TextNode | InlineNode>) => {
  const newTitleString = newValue
      .map((node) => {
        if ('text' in node) {
          return node.text;
        }
        return '';
      })
      .join('');
  emit('update:pageTitle', newTitleString);
};

const handlePropertyChange = (key: string, newValue: unknown) => {
  const updatedProperties = {
    ...props.pageProperties,
    [key]: newValue,
  };
  emit('update:pageProperties', updatedProperties);
};

const propertyComponentMap = {
  number: NumberProperty,
  text: TextProperty,
  'text-array': TextArrayProperty,
  enum: EnumProperty,
  page: LinkedPageProperty,
  'page-array': PageArrayProperty,
};

const sortedCategoryKeys = computed(() => {
  if (!props.displaySchema) return [];
  return Object.keys(props.displaySchema);
});

const getSortedPropertyKeys = (categoryProperties: Record<string, PropertyPanelSchema>) => {
  return Object.keys(categoryProperties).sort((a, b) => {
    const orderA = categoryProperties[a]?.order ?? Infinity;
    const orderB = categoryProperties[b]?.order ?? Infinity;
    return orderA - orderB;
  });
};
</script>

<template>
  <aside>
    <LayoutBox
        direction="vertical"
        class="max-w-[256] min-w-[256] border border-rimelight-primary-500 bg-rimelight-primary-800 shadow-lg"
    >
      <div class="bg-rimelight-primary-500 p-sm shadow-lg">
        <EditableText
            :value="props.pageTitle"
            @update:modelValue="handleTitleChange"
            :is-editable="props.isEditable"
            :supported-marks="[]"
            class="w-full text-center text-lg font-bold text-rimelight-primary-100"
            root-tag="h1"
        />
      </div>

      <template v-if="props.displaySchema && Object.keys(props.displaySchema).length > 0">
        <template v-for="categoryKey in sortedCategoryKeys" :key="categoryKey">
          <template v-if="props.displaySchema[categoryKey]">
            <section>
              <h2
                  v-if="
                  props.displaySchema[categoryKey] &&
                  Object.keys(props.displaySchema[categoryKey]).length > 0
                "
                  class="bg-rimelight-primary-600 p-sm text-center text-md font-semibold text-rimelight-primary-100"
              >
                {{ categoryKey === '_uncategorized_' ? 'Other Details' : categoryKey }}
              </h2>
              <dl>
                <div
                    v-for="propKey in getSortedPropertyKeys(props.displaySchema[categoryKey])"
                    :key="propKey"
                    class="flex flex-col gap-sm p-md"
                >
                  <component
                      :is="propertyComponentMap[props.displaySchema[categoryKey][propKey].type]"
                      :label="props.displaySchema[categoryKey][propKey].label"
                      :value="props.pageProperties[propKey]"
                      :is-editable="props.isEditable"
                      @update:modelValue="(newValue) => handlePropertyChange(propKey, newValue)"
                      :options="props.displaySchema[categoryKey][propKey].options"
                      :allowed-page-types="props.displaySchema[categoryKey][propKey].allowedPageTypes"
                      :block-id="`prop-${propKey}`"
                  />
                </div>
              </dl>
            </section>
          </template>
        </template>
      </template>
      <template v-else>
      </template>
    </LayoutBox>
  </aside>
</template>