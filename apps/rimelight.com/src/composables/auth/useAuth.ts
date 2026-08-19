import { authClient } from "@/auth/auth-client"
import { ref, computed } from "vue"

const sessionData = ref<any>(null)
const isLoading = ref<boolean>(false)
const sessionError = ref<any>(null)

export const useAuth = () => {
  const fetchSession = async () => {
    try {
      isLoading.value = true
      const { data, error } = await authClient.getSession()
      if (error) {
        sessionError.value = error
      } else {
        sessionData.value = data
      }
    } catch (err) {
      sessionError.value = err
    } finally {
      isLoading.value = false
    }
  }

  if (typeof window !== "undefined" && !sessionData.value && !isLoading.value) {
    void fetchSession()
  }

  const session = computed(() => (sessionData.value ? { ...sessionData.value } : null))
  const user = computed(() => sessionData.value?.user ?? null)

  return {
    session,
    user,
    isLoading,
    sessionError,
    fetchSession,
    signUp: authClient.signUp.email,
    signIn: authClient.signIn.email,
    signOut: authClient.signOut
  }
}
