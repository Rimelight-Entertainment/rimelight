import { watch, computed, ref } from "vue"
import { authClient } from "@/auth/auth-client"
import { useAuth } from "../auth/useAuth"

// Global, shared states for Dashboard components
const activeTeamId = ref<string | null>(null)
const isNotificationsSlideoverOpen = ref<boolean>(false)
const activeOrgData = ref<any>(null)

export const useDashboard = () => {
  const { session } = useAuth()

  const refreshActiveOrganization = async () => {
    if (typeof window === "undefined" || !session.value) return
    const { data } = await authClient.organization.getFullOrganization()
    activeOrgData.value = data ?? null
  }

  if (typeof window !== "undefined" && session.value && !activeOrgData.value) {
    void refreshActiveOrganization()
  }

  const activeOrganization = computed(() => activeOrgData.value)

  const setActiveTeam = (id: string | null) => {
    activeTeamId.value = id
  }

  // Reset team when organization changes
  watch(activeOrganization, () => {
    activeTeamId.value = null
  })

  return {
    activeOrganization,
    activeTeamId,
    setActiveTeam,
    refreshActiveOrganization,
    isNotificationsSlideoverOpen
  }
}
