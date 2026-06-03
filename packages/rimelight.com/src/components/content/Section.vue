<script setup lang="ts">
import { computed, inject, provide, useAttrs } from "vue";
import { scv, cx } from "css-variants";
import { useRC } from "@/composables";
import { SECTION_LEVEL_KEY } from "@/composables/pages/injectionKeys";
import { useToast } from "@rimelight/ui/composables";
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue";

/* region Props */
export type SectionLevel = 1 | 2 | 3 | 4 | 5 | 6;
export interface SectionProps {
    level?: SectionLevel;
    title: string;
    description?: string;
    isEditing?: boolean;
    rc?: {
        section?: string;
        link?: string;
        title?: string;
        description?: string;
        separator?: string;
        content?: string;
    };
}
const { title, description, isEditing = false, rc: rcProp } = defineProps<SectionProps>();
const { rc } = useRC("Section", rcProp);
/* endregion */

/* region Emits */
export interface SectionEmits {}
defineEmits<SectionEmits>();
/* endregion */

/* region Slots */
export interface SectionSlots {
    default: (props: {}) => any;
    title: (props: {}) => any;
    description: (props: {}) => any;
}
defineSlots<SectionSlots>();
/* endregion */

/* region Styles */
const sectionStyles = scv({
    slots: ["section", "link", "title", "description", "separator", "content", "anchorButtonWrapper", "anchorButton", "fallbackAnchor"],
    base: {
        section: "flex flex-col scroll-mt-24 w-full",
        link: "",
        title: "font-bold w-full",
        description: "text-muted",
        separator: "py-2",
        content: "flex flex-col gap-md mt-2",
        anchorButtonWrapper: "group relative lg:-ms-2 lg:ps-2 inline-block w-full",
        anchorButton: "absolute top-1/2 -translate-y-1/2 -ms-8 hidden rounded-md p-1 opacity-0 transition group-hover:opacity-100 group-focus:opacity-100 lg:flex",
        fallbackAnchor: "absolute top-1/2 -translate-y-1/2 -ms-8 w-6 h-6 rounded-md p-1 opacity-0 transition lg:flex"
    },
    variants: {
        level: {
            1: { section: "gap-2", description: "text-2xl" },
            2: { section: "gap-1.5", description: "text-xl" },
            3: { section: "gap-1", description: "text-lg" },
            4: { section: "gap-0.5", description: "text-md" },
            5: { section: "gap-0.25", description: "text-sm" },
            6: { section: "gap-0.125", description: "text-xs" }
        }
    }
});

const parentLevel = inject(SECTION_LEVEL_KEY, computed(() => 1));
const level = computed(() => Math.min(6, parentLevel.value + 1));
provide(SECTION_LEVEL_KEY, level);

const styles = computed(() => {
    const resolved = sectionStyles({ level: level.value as SectionLevel });
    const result: Record<string, string> = {};
    for (const [slot, value] of Object.entries(resolved)) {
        result[slot] = cx(value, (rc.value as Record<string, string>)[slot]);
    }
    return result;
});
/* endregion */

/* region State */
const toast = useToast();
const sectionId = computed(() => slugify(title));
const sectionHash = computed(() => `#${sectionId.value}`);
const fullSectionUrl = computed(() => {
    if (typeof window === "undefined") return sectionHash.value;
    return `${window.location.origin}${window.location.pathname}${sectionHash.value}`;
});
/* endregion */

/* region Logic */
function slugify(text: string): string {
    return text.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").replace(/--+/g, "-").replace(/^-+/, "").replace(/-+$/, "");
}
const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
        toast.add({ title: "Heading copied to clipboard!", description: text, color: "primary" });
    } catch {
        toast.add({ title: "Failed to copy heading to clipboard.", description: "An unexpected error occurred. Please try again.", color: "danger" });
    }
};
/* endregion */
</script>

<template>
  <section :id="sectionId" :class="styles.section" v-bind="useAttrs()"
    <component :is="`h${level}`" :id="`${sectionId}-title`" :class="styles.title">
      <a
        v-if="!isEditing"
        :href="`#${sectionId}`"
        :class="[styles.anchorButtonWrapper, styles.link]"
      >
        <RLVButton
          variant="outline"
          color="neutral"
          icon="lucide:link"
          :class="styles.anchorButton"
          @click.prevent="copyToClipboard(fullSectionUrl)"
        />
        <slot name="title">{{ title }}</slot>
      </a>
      <slot v-else name="title">
        {{ title }}
      </slot>
    </component>
    <slot name="description">
      <p v-if="description" :class="styles.description">
        {{ description }}
      </p>
    </slot>
    <hr :class="['border-t border-neutral-200 dark:border-neutral-800 my-2', styles.separator]" />
    <div :class="styles.content">
      <slot />
    </div>
  </section>
</template>
