<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { scv, cx } from "css-variants";
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue";
import { useRC, useDashboard } from "@/composables";
import { authClient } from "@/auth/auth-client";

/* region Props */
export interface OrganizationsMenuProps {
    collapsed?: boolean;
    rc?: {
        root?: string;
        triggerButton?: string;
        buttonTrailing?: string;
    };
}

const { collapsed = false, rc: rcProp } = defineProps<OrganizationsMenuProps>();
const { rc } = useRC("OrganizationsMenu", rcProp);
/* endregion */

/* region Emits */
export interface OrganizationsMenuEmits {
}
defineEmits<OrganizationsMenuEmits>();
/* endregion */

/* region Styles */
const organizationsMenuStyles = scv({
  slots: ["root", "triggerButton", "buttonTrailing"],
  base: {
    root: "relative flex flex-col w-full",
    triggerButton: "hover:bg-neutral-50 dark:hover:bg-neutral-800",
    buttonTrailing: "text-neutral-400 dark:text-neutral-500"
  }
});

const styles = computed(() => {
  const resolved = organizationsMenuStyles();
  const result: Record<string, string> = {};
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot]);
  }
  return result;
});
/* endregion */

/* region State */
const { activeOrganization, refreshActiveOrganization } = useDashboard();
const isOpen = ref(false);
const menuRef = ref<HTMLElement | null>(null);

// 1. Get List of organizations
const organizationsState = authClient?.useListOrganizations?.();
const organizations = computed(() => organizationsState?.value?.data || []);

const selectedOrganization = computed(() => {
  return (
    activeOrganization.value ||
    (organizations.value && organizations.value.length > 0 ? organizations.value[0] : null)
  );
});

const items = computed(() => {
  const orgs = organizations.value || [];
  return orgs.map((org: any) => ({
    label: org.name,
    avatar: org.logo
      ? {
          src: org.logo,
          alt: org.name
        }
      : undefined,
    icon: !org.logo ? "i-lucide-building" : undefined,
    onSelect: async () => {
      if (authClient?.organization?.setActive) {
        await authClient.organization.setActive({
          organizationId: org.id
        });
        await refreshActiveOrganization();
      }
    }
  }));
});

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
/* endregion */

/* region Meta */
defineOptions({
  name: "OrganizationsMenu"
});
/* endregion */
</script>

<template>
  <div ref="menuRef" :class="styles.root">
    <!-- Trigger Button -->
    <RLVButton
      variant="ghost"
      color="neutral"
      :class="[styles.triggerButton, !collapsed && 'py-2 w-full justify-between']"
      :square="collapsed"
      @click="isOpen = !isOpen"
    >
      <div class="flex items-center gap-2 truncate">
        <img
          v-if="selectedOrganization?.logo"
          :src="selectedOrganization.logo"
          :alt="selectedOrganization.name"
          class="size-5 rounded object-cover shrink-0"
        />
        <span
          v-else-if="selectedOrganization?.name"
          class="i-lucide-building size-5 text-neutral-500 shrink-0"
        />
        <span v-else class="i-lucide-user size-5 text-neutral-500 shrink-0" />
        <span
          v-if="!collapsed"
          class="truncate text-sm font-medium text-neutral-700 dark:text-neutral-300"
        >
          {{ selectedOrganization?.name || "Personal Workspace" }}
        </span>
      </div>
      <template v-if="!collapsed" #trailing>
        <span
          class="i-lucide-chevrons-up-down size-4 text-neutral-400 dark:text-neutral-500 shrink-0 ml-2"
        />
      </template>
    </RLVButton>

    <!-- Custom Dropdown Menu -->
    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-2"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-2"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute left-0 z-50 mt-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-2 shadow-2xl flex flex-col gap-1',
          collapsed ? 'w-40' : 'w-full min-w-[200px]'
        ]"
      >
        <button
          v-for="item in items"
          :key="item.label"
          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
          @click="
            () => {
              item.onSelect()
              isOpen = false
            }
          "
        >
          <img
            v-if="item.avatar"
            :src="item.avatar.src"
            :alt="item.avatar.alt"
            class="size-5 rounded object-cover shrink-0"
          />
          <span v-else class="i-lucide-building size-5 text-neutral-400 shrink-0" />
          <span class="truncate">{{ item.label }}</span>
        </button>
      </div>
    </transition>
  </div>
</template>