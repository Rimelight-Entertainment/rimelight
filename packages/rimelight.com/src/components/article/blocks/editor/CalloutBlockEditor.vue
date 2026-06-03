<script setup lang="ts">
import { computed, inject, ref, onMounted, onUnmounted } from "vue";
import type { CalloutBlockProps, CalloutVariant, Block } from "@/types/blocks";
import { scv, cx } from "css-variants";
import { useRC } from "@/composables";
import { useI18n } from "@/composables/app/useI18n";
import CalloutBlockRenderer from "../renderer/CalloutBlockRenderer.vue";
import BlockEditor from "../BlockEditor.vue";

/* region Props */
export interface CalloutBlockEditorProps extends CalloutBlockProps {
    id: string;
    rc?: {
        root?: string;
    };
}
const { id, rc: rcProp, children, variant = "info", to, target } = defineProps<CalloutBlockEditorProps>();
const { rc } = useRC("CalloutBlockEditor", rcProp);
/* endregion */

/* region Styles */
const calloutBlockEditorStyles = scv({ slots: { root: "", iconTrigger: "cursor-pointer hover:opacity-75 transition-opacity outline-none", childrenWrapper: "w-full mt-2", dropdownMenu: "absolute z-50 mt-1 w-64 rounded-md border border-default bg-white dark:bg-neutral-900 shadow-lg p-1 flex flex-col gap-1", dropdownItem: "flex items-start gap-2 w-full text-left p-2 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition duration-150 outline-none cursor-pointer", itemIcon: "size-4 text-dimmed mt-0.5 shrink-0", itemContent: "flex flex-col gap-0.5 min-w-0", itemLabel: "font-medium text-sm truncate text-neutral-900 dark:text-neutral-100", itemDescription: "text-xs text-dimmed font-normal leading-snug whitespace-normal" } });
const styles = computed(() => {
    const resolved = calloutBlockEditorStyles();
    const result: Record<string, string> = {};
    for (const [slot, value] of Object.entries(resolved)) {
        result[slot] = cx(value, (rc.value as Record<string, string>)[slot]);
    }
    return result as Record<string, string>;
});
/* endregion */

/* region State */
const editorApi = inject<any>("block-editor-api");
const { t } = useI18n();
const isDropdownOpen = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const dropdownRef = ref<HTMLElement | null>(null);
const variants: CalloutVariant[] = ["info", "success", "warning", "error", "commentary", "ideation", "source"];
const variantConfigs: Record<CalloutVariant, {
    icon: string;
    title: string;
    tooltip: string;
}> = {
    info: { icon: "i-lucide-info", title: "Info", tooltip: "General informative callout" },
    success: { icon: "i-lucide-check-circle", title: "Success", tooltip: "Success status callout" },
    warning: { icon: "i-lucide-alert-triangle", title: "Warning", tooltip: "Important warnings" },
    error: { icon: "i-lucide-alert-octagon", title: "Error", tooltip: "Errors and critical issues" },
    commentary: { icon: "i-lucide-message-square", title: "Commentary", tooltip: "Side notes and discussions" },
    ideation: { icon: "i-lucide-lightbulb", title: "Ideation", tooltip: "Ideas and brainstorms" },
    source: { icon: "i-lucide-code", title: "Source", tooltip: "Code snippets and sources" }
};
const dropdownItems = computed(() => {
    return variants.map((type) => {
        const config = variantConfigs[type];
        return {
            type,
            label: t(`callout.${type}`, config.title),
            icon: config.icon,
            description: t(`callout.${type}_desc`, config.tooltip),
            onSelect: () => {
                if (editorApi) {
                    editorApi.updateBlockProps(id, { variant: type });
                }
                isDropdownOpen.value = false;
            }
        };
    });
});
const currentIcon = computed(() => {
    return variantConfigs[variant]?.icon || "i-lucide-info";
});
const localChildren = computed({
    get: () => children ?? [],
    set: (newChildren) => {
        if (editorApi && id) {
            const childrenCopy = JSON.parse(JSON.stringify(newChildren));
            editorApi.updateBlockProps(id, { children: childrenCopy });
        }
    }
});
const toggleDropdown = (e: MouseEvent) => {
    e.stopPropagation();
    isDropdownOpen.value = !isDropdownOpen.value;
};
const handleClickOutside = (e: MouseEvent) => {
    if (isDropdownOpen.value && dropdownRef.value && !dropdownRef.value.contains(e.target as Node) && triggerRef.value && !triggerRef.value.contains(e.target as Node)) {
        isDropdownOpen.value = false;
    }
};
onMounted(() => {
    if (typeof document !== "undefined") {
        document.addEventListener("click", handleClickOutside);
    }
});
onUnmounted(() => {
    if (typeof document !== "undefined") {
        document.removeEventListener("click", handleClickOutside);
    }
});
function handleChildrenMutation() {
    console.log("[CalloutBlockEditor] Mutation event received (handled by setter)");
}
/* endregion */

defineOptions({
    name: "CalloutBlockEditor"
});
</script><template>  <div :class="styles.root">    <div      class="border rounded-xl p-4 my-4 flex items-start gap-3 bg-neutral-50/50 dark:bg-neutral-950/10 border-neutral-200 dark:border-neutral-900/50"    >      <div class="relative">        <span          ref="triggerRef"          :class="[            currentIcon,            'size-5 shrink-0 mt-0.5 cursor-pointer hover:opacity-75 transition-opacity outline-none'          ]"          @click="toggleDropdown"        />        <div v-if="isDropdownOpen" ref="dropdownRef" :class="styles.dropdownMenu">          <button            v-for="item in dropdownItems"            :key="item.type"            :class="styles.dropdownItem"            @click="item.onSelect"          >            <span :class="[item.icon, styles.itemIcon]" />            <div :class="styles.itemContent">              <span :class="styles.itemLabel">{{ item.label }}</span>              <span :class="styles.itemDescription">{{ item.description }}</span>            </div>          </button>        </div>      </div>      <div :class="styles.childrenWrapper">        <BlockEditor          v-model="localChildren"          :container-id="id"          @mutation="handleChildrenMutation"          @end="handleChildrenMutation"        />      </div>    </div>  </div></template><style scoped></style>