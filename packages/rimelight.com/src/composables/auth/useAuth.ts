import { authClient } from "@/auth/auth-client"
import { computed } from "vue"

export const useAuth = () => {
  const sessionState = authClient.useSession()
  const session = computed(() => (sessionState.value?.data ? { ...sessionState.value.data } : null))
  const user = computed(() => sessionState.value?.data?.user ?? null)
  const isLoading = computed(() => sessionState.value?.isPending ?? false)
  const sessionError = computed(() => sessionState.value?.error ?? null)

  return {
    session,
    user,
    isLoading,
    sessionError,
    signUp: authClient.signUp.email,
    signIn: authClient.signIn.email,
    signOut: authClient.signOut
  }
}
