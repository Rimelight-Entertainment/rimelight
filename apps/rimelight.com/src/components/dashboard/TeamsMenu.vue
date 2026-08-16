<script lang="ts" setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue"
import { scv } from "css-variants"
import RLVButton from "@rimelight/ui/components/button/RLVButton.vue"
import { useDashboard } from "@/composables"
import { authClient } from "@/auth/auth-client"

/* region Props */
export interface TeamsMenuProps {
  collapsed?: boolean
}

const { collapsed = false } = defineProps<TeamsMenuProps>()
/* endregion */

/* region Emits */
export interface TeamsMenuEmits {}
defineEmits<TeamsMenuEmits>()
/* endregion */

/* region Styles */
const teamsMenuStyles = scv({
  slots: ["root", "triggerButton", "buttonTrailing"],
  base: {
    root: "relative flex flex-col w-full",
    triggerButton: "hover:bg-neutral-50 dark:hover:bg-neutral-800",
    buttonTrailing: "text-neutral-400 dark:text-neutral-500"
  }
})

const styles = teamsMenuStyles()
/* endregion */

/* region State */
const { activeOrganization, activeTeamId, setActiveTeam } = useDashboard()
const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const activeOrgId = computed(() => activeOrganization.value?.id)

// 1. Fetch only teams the user is a part of
const userTeamsRes = ref<any[]>([])

const loadTeams = async () => {
  if (!authClient?.organization?.listUserTeams) return
  try {
    const { data } = await authClient.organization.listUserTeams()
    userTeamsRes.value = data || []
  } catch (e) {
    console.error("Failed to load user teams:", e)
  }
}

watch(
  activeOrgId,
  () => {
    loadTeams()
  },
  { immediate: true }
)

// 2. Filter teams by the active organization
const teams = computed(() => {
  const allUserTeams = userTeamsRes.value || []
  if (!activeOrgId.value) return []
  return allUserTeams.filter((team: any) => team.organizationId === activeOrgId.value)
})

// 3. Current selection
const selectedTeam = computed(() => {
  if (activeTeamId.value) {
    const found = teams.value.find((t: any) => t.id === activeTeamId.value)
    if (found) return found
  }
  return teams.value[0] || null
})

// Auto-select first team if none selected
watch(
  teams,
  (newTeams) => {
    if (newTeams.length > 0 && !activeTeamId.value) {
      setActiveTeam(newTeams[0].id)
    }
  },
  { immediate: true }
)

const items = computed(() => {
  return teams.value.map((team: any) => ({
    label: team.name,
    avatar: team.logo ? { src: team.logo, alt: team.name } : undefined,
    icon: !team.logo ? "i-lucide-users" : undefined,
    onSelect: () => {
      setActiveTeam(team.id)
    }
  }))
})

const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener("click", handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside)
})
/* endregion */

/* region Meta */
defineOptions({
  name: "TeamsMenu"
})
/* endregion */
</script>

<template>
  <div v-if="teams.length > 0" ref="menuRef" :class="styles.root">
    <!-- Trigger Button -->
    <RLVButton
      variant="ghost"
      color="neutral"
      :class="[styles.triggerButton, !collapsed && 'py-2 w-full justify-between']"
      :square="collapsed"
      @click="isOpen = !isOpen"
    >
      <template #leading>
        <img
          v-if="selectedTeam?.logo"
          :src="selectedTeam.logo"
          :alt="selectedTeam.name"
          class="size-5 rounded object-cover shrink-0"
        />
        <span v-else class="i-lucide-users size-5 text-neutral-500 shrink-0" />
      </template>
      <template v-if="!collapsed" #label>
        <span class="truncate text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {{ selectedTeam?.name }}
        </span>
      </template>
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
          <span v-else class="i-lucide-users size-5 text-neutral-400 shrink-0" />
          <span class="truncate">{{ item.label }}</span>
        </button>
      </div>
    </transition>
  </div>
</template>
