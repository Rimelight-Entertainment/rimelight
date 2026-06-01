import { watch, computed, ref } from "vue";
import { authClient } from "@/auth/auth-client";
import { useAuth } from "../auth/useAuth";

// Global, shared states for Dashboard components
const activeTeamId = ref<string | null>(null);
const isNotificationsSlideoverOpen = ref<boolean>(false);

export const useDashboard = () => {
  const { session } = useAuth();

  // 1. Auth States (Client-only, only if logged in)
  const activeOrgState =
    typeof window !== "undefined" && session.value ? authClient.useActiveOrganization() : null;

  const activeOrganization = computed(() => (activeOrgState as any)?.value?.data || null);

  const setActiveTeam = (id: string | null) => {
    activeTeamId.value = id;
  };

  const refreshActiveOrganization = async () => {
    if (activeOrgState?.value?.refetch) {
      return await activeOrgState.value.refetch();
    }
  };

  // Reset team when organization changes
  watch(activeOrganization, () => {
    activeTeamId.value = null;
  });

  return {
    activeOrganization,
    activeTeamId,
    setActiveTeam,
    refreshActiveOrganization,
    isNotificationsSlideoverOpen,
  };
};
