<script setup lang="ts">
import { ref, watch, onMounted, inject, computed, nextTick } from "vue";
import { scv, cx } from "css-variants";
import { useRC } from "@/composables";
import type { ParagraphBlockProps, RichTextContent } from "@/types/blocks";
import { richTextToHtml, parseHtmlToRichText } from "@/utils/richTextHelpers";

/* region Props */
export interface ParagraphBlockEditorProps extends ParagraphBlockProps {
  id: string;
  rc?: {
    root?: string;
  };
}

const { id, text, rc: rcProp } = defineProps<ParagraphBlockEditorProps>();

const { rc } = useRC("ParagraphBlockEditor", rcProp);
/* endregion */

/* region Emits */
defineEmits<{}>();
/* endregion */

/* region Styles */
const paragraphBlockEditorStyles = scv({
  slots: {
    root: "p-2 outline-none min-h-6 focus:ring-2 focus:ring-blue-500 rounded-md transition duration-150 text-base"
  }
});

const styles = computed(() => {
  const resolved = paragraphBlockEditorStyles();
  const result: Record<string, string> = {};
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot]);
  }
  return result as {
    root: string;
  };
});
/* endregion */

/* region State */
const editorRef = ref<HTMLElement | null>(null);
const localHtml = ref(richTextToHtml(text));
const isContentChanging = ref(false);
const editorApi = inject<any>("block-editor-api");
/* endregion */

/* region Meta */
defineOptions({ name: "ParagraphBlockEditor" });
/* endregion */

/* region Lifecycle */
onMounted(() => {
  if (editorRef.value) {
    editorRef.value.innerHTML = localHtml.value;
  }
});

watch(
  () => text,
  (newContent) => {
    if (
      isContentChanging.value ||
      !editorRef.value ||
      (typeof document !== "undefined" && document.activeElement === editorRef.value)
    ) {
      return;
    }
    const newHtml = richTextToHtml(newContent);
    if (editorRef.value.innerHTML !== newHtml) {
      editorRef.value.innerHTML = newHtml;
      localHtml.value = newHtml;
    }
  },
  { deep: true, immediate: true }
);
/* endregion */

/* region Logic */
const commitContentOnBlur = () => {
  if (!editorRef.value || !editorApi) return;
  const rawHtml = editorRef.value.innerText.trim();
  const currentPropText = richTextToHtml(text);
  if (rawHtml === currentPropText) {
    return;
  }
  isContentChanging.value = true;
  const newRichContent: RichTextContent = parseHtmlToRichText(rawHtml);
  editorApi.updateBlockProps(id, { text: newRichContent });
  nextTick(() => {
    isContentChanging.value = false;
  });
};
/* endregion */
</script>

<template>
  <div
    ref="editorRef"
    contenteditable="true"
    :class="styles.root"
    @blur="commitContentOnBlur"
  ></div>
</template>

<style scoped>
</style>