<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { ChevronsUpDown, LogOut, Monitor, Moon, Sun } from "lucide-vue-next"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.vue"

type Theme = "light" | "dark" | "system"

interface Props {
  userName: string
  userEmail: string
  logoutAction: string
}

const props = defineProps<Props>()
const theme = ref<Theme>("system")

function applyTheme(t: Theme) {
  const root = document.documentElement
  const dark =
    t === "dark" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches)
  root.classList.toggle("dark", dark)
}

function changeTheme(t: Theme) {
  theme.value = t
  localStorage.setItem("admin-theme", t)
  applyTheme(t)
}

onMounted(() => {
  const saved = localStorage.getItem("admin-theme") as Theme | null
  if (saved) {
    theme.value = saved
    applyTheme(saved)
  }

  const mq = window.matchMedia("(prefers-color-scheme: dark)")
  const handler = () => {
    if ((localStorage.getItem("admin-theme") ?? "system") === "system") {
      applyTheme("system")
    }
  }
  mq.addEventListener("change", handler)
  onUnmounted(() => mq.removeEventListener("change", handler))
})

function handleLogout() {
  const form = document.createElement("form")
  form.method = "post"
  form.action = props.logoutAction
  document.body.appendChild(form)
  form.submit()
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger
      class="px-3 py-2 rounded-lg flex gap-3 w-full transition-colors items-center hover:bg-foreground/5 dark:hover:bg-accent/60"
    >
      <div
        class="text-primary-foreground font-medium rounded-full bg-primary/80 flex shrink-0 size-8 items-center justify-center"
      >
        {{ userName.charAt(0).toUpperCase() }}
      </div>
      <div class="text-left flex-1 min-w-0">
        <div class="text-sm font-medium truncate">{{ userName }}</div>
        <div class="text-xs text-muted-foreground truncate">{{ userEmail }}</div>
      </div>
      <ChevronsUpDown class="text-muted-foreground shrink-0 size-4" />
    </DropdownMenuTrigger>

    <DropdownMenuContent
      side="bottom"
      align="start"
      class="w-(--radix-dropdown-menu-trigger-width)"
    >
      <DropdownMenuItem @click="changeTheme('light')">
        <Sun class="text-muted-foreground size-3.5" />
        Light
        <span v-if="theme === 'light'" class="text-xs ml-auto">&#10003;</span>
      </DropdownMenuItem>
      <DropdownMenuItem @click="changeTheme('dark')">
        <Moon class="text-muted-foreground size-3.5" />
        Dark
        <span v-if="theme === 'dark'" class="text-xs ml-auto">&#10003;</span>
      </DropdownMenuItem>
      <DropdownMenuItem @click="changeTheme('system')">
        <Monitor class="text-muted-foreground size-3.5" />
        System
        <span v-if="theme === 'system'" class="text-xs ml-auto">&#10003;</span>
      </DropdownMenuItem>

      <DropdownMenuSeparator />

      <DropdownMenuItem @click="handleLogout">
        <LogOut class="text-muted-foreground size-3.5" />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
