<script setup lang="ts">
import { computed } from "vue";
import { scv, cx } from "css-variants";
import { useRC } from "~/composables";
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue";

/* region Props */
export interface ImageSwatchProps {
  name?: string;
  jpg?: string;
  png?: string;
  webp?: string;
  svg?: string;
  rc?: {
    card?: string;
    title?: string;
    content?: string;
    image?: string;
    buttonGroup?: string;
    button?: string;
  };
  t?: (key: string) => string;
}

const {
  name,
  jpg,
  png,
  webp,
  svg,
  rc: rcProp,
  t = (key: string) => {
    const map: Record<string, string> = {
      "swatch.download_jpg": "Download JPG",
      "swatch.download_png": "Download PNG",
      "swatch.download_webp": "Download WEBP",
      "swatch.download_svg": "Download SVG",
    };
    return map[key] || key;
  }
} = defineProps<ImageSwatchProps>();

const { rc } = useRC("ImageSwatch", rcProp);
/* endregion */

/* region Emits */
export interface ImageSwatchEmits {}
defineEmits<ImageSwatchEmits>();
/* endregion */

/* region Slots */
export interface ImageSwatchSlots {}
defineSlots<ImageSwatchSlots>();
/* endregion */

/* region Styles */
const imageSwatchStyles = scv({
  slots: [
    "card",
    "title",
    "content",
    "imageClass",
    "buttonGroup",
    "button",
  ],
  base: {
    card: "w-full rounded-none xl:w-fit",
    title: "text-lg font-bold",
    content: "flex flex-col items-center gap-sm xl:flex-row xl:items-start",
    imageClass: "size-48 object-cover",
    buttonGroup: "flex w-full flex-col justify-center gap-sm",
    button: "w-full xl:w-36",
  },
});

const styles = computed(() => {
  const resolved = imageSwatchStyles();
  const result: Record<string, string> = {};
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot]);
  }
  return result;
});
/* endregion */

/* region State */
const image = computed(() => {
  if (webp) return webp;
  if (png) return png;
  if (jpg) return jpg;
  if (svg) return svg;

  return undefined;
});
/* endregion */
</script>

<template>
  <div :class="['bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm', styles.card]">
    <div v-if="name" class="border-b border-neutral-200 dark:border-neutral-800 pb-2 mb-4">
      <h3 :class="styles.title">{{ name }}</h3>
    </div>
    <div :class="styles.content">
      <img :src="image" :class="[styles.imageClass, rc.image]" :alt="name || ''" />
      <div :class="styles.buttonGroup">
        <RLVButton
          v-if="jpg"
          variant="outline"
          size="sm"
          icon="lucide:download"
          :label="t('swatch.download_jpg')"
          :class="styles.button"
          :href="jpg"
          target="_blank"
        />
        <RLVButton
          v-if="png"
          variant="outline"
          size="sm"
          icon="lucide:download"
          :label="t('swatch.download_png')"
          :class="styles.button"
          :href="png"
          target="_blank"
        />
        <RLVButton
          v-if="webp"
          variant="outline"
          size="sm"
          icon="lucide:download"
          :label="t('swatch.download_webp')"
          :class="styles.button"
          :href="webp"
          target="_blank"
        />
        <RLVButton
          v-if="svg"
          variant="outline"
          size="sm"
          icon="lucide:download"
          :label="t('swatch.download_svg')"
          :class="styles.button"
          :href="svg"
          target="_blank"
        />
      </div>
    </div>
  </div>
</template>
