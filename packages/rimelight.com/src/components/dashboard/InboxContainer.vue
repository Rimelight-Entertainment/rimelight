<script lang="ts" setup>
import { ref, computed, onMounted } from "vue"
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue"

interface Mail {
  id: number
  from: {
    name: string
    email: string
    avatar?: any
  }
  subject: string
  body: string
  date: string
  unread: boolean
}

const mails = ref<Mail[]>([])
const selectedMail = ref<Mail | null>(null)
const selectedTab = ref("all")
const replyText = ref("")
const sending = ref(false)

async function fetchMails() {
  try {
    const res = await fetch("/api/mails")
    mails.value = (await res.json()) as Mail[]
  } catch (e) {
    // Fallback Mock Data if API is not yet running
    mails.value = [
      {
        id: 1,
        from: { name: "Daniel Marchi", email: "daniel@rimelight.com" },
        subject: "Welcome to Rimelight Entertainment!",
        body: "Hi team,\n\nWelcome to our new platform! I am excited to have you all here as we continue building the next generation of games. Let's work together to make Grand Tale amazing.\n\nBest,\nDaniel",
        date: new Date().toISOString(),
        unread: true
      },
      {
        id: 2,
        from: { name: "System Administrator", email: "admin@rimelight.com" },
        subject: "Security Alert: New sign-in detected",
        body: "A new sign-in was detected from a Windows device on your account.\n\nIf this was you, you can safely ignore this email.",
        date: new Date(Date.now() - 3600000).toISOString(),
        unread: false
      }
    ]
  }
}

onMounted(() => {
  fetchMails()
})

const filteredMails = computed(() => {
  if (selectedTab.value === "unread") {
    return mails.value.filter((m) => m.unread)
  }
  return mails.value
})

function selectMail(mail: Mail) {
  selectedMail.value = mail
  // Mark as read (mock client-side)
  mail.unread = false
}

function handleReply(e: Event) {
  e.preventDefault()
  if (!replyText.value.trim()) return
  sending.value = true
  setTimeout(() => {
    alert("Reply sent to " + selectedMail.value?.from.name)
    replyText.value = ""
    sending.value = false
  }, 800)
}
</script>

<template>
  <div
    class="flex h-full w-full overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-950"
  >
    <!-- Mails List Column -->
    <div
      class="w-full md:w-2/5 border-r border-neutral-200 dark:border-neutral-800 flex flex-col h-full overflow-hidden"
    >
      <div
        class="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-neutral-900"
      >
        <div>
          <h3 class="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span class="i-lucide-inbox text-neutral-500" />
            Inbox
            <span
              class="px-2 py-0.5 text-xs font-bold bg-neutral-200 dark:bg-neutral-800 rounded-full text-neutral-600 dark:text-neutral-300"
            >
              {{ filteredMails.length }}
            </span>
          </h3>
        </div>
        <div class="flex gap-1">
          <button
            class="px-3 py-1 text-xs rounded-lg font-semibold transition-colors"
            :class="
              selectedTab === 'all'
                ? 'bg-primary-500 text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            "
            @click="selectedTab = 'all'"
          >
            All
          </button>
          <button
            class="px-3 py-1 text-xs rounded-lg font-semibold transition-colors"
            :class="
              selectedTab === 'unread'
                ? 'bg-primary-500 text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            "
            @click="selectedTab = 'unread'"
          >
            Unread
          </button>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto divide-y divide-neutral-200 dark:divide-neutral-800">
        <div
          v-for="mail in filteredMails"
          :key="mail.id"
          class="p-4 cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors border-l-2"
          :class="[
            mail.unread ? 'border-primary-500 font-semibold' : 'border-transparent',
            selectedMail?.id === mail.id ? 'bg-primary-50/50 dark:bg-primary-950/10' : ''
          ]"
          @click="selectMail(mail)"
        >
          <div class="flex justify-between items-center mb-1">
            <span class="text-sm font-bold text-neutral-800 dark:text-neutral-200">{{
              mail.from.name
            }}</span>
            <span class="text-xs text-neutral-500">{{
              new Date(mail.date).toLocaleDateString()
            }}</span>
          </div>
          <h4 class="text-sm font-semibold text-neutral-900 dark:text-white truncate mb-1">
            {{ mail.subject }}
          </h4>
          <p class="text-xs text-neutral-500 line-clamp-2">{{ mail.body }}</p>
        </div>
      </div>
    </div>
    <!-- Active Mail View Column -->
    <div
      class="hidden md:flex flex-1 flex-col h-full overflow-hidden bg-neutral-50 dark:bg-neutral-900/30"
    >
      <div v-if="selectedMail" class="flex flex-col h-full overflow-hidden">
        <div
          class="p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-950"
        >
          <div>
            <h3 class="font-bold text-neutral-900 dark:text-white">{{ selectedMail.subject }}</h3>
            <p class="text-xs text-neutral-500">
              From: {{ selectedMail.from.name }} ({{ selectedMail.from.email }})
            </p>
          </div>
          <RLVButton
            color="neutral"
            variant="ghost"
            class="size-8 p-0 rounded-xl"
            @click="selectedMail = null"
          >
            <span class="i-lucide-x size-4" />
          </RLVButton>
        </div>
        <div class="flex-1 p-6 overflow-y-auto bg-white dark:bg-neutral-950/20">
          <p
            class="text-sm text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed"
          >
            {{ selectedMail.body }}
          </p>
        </div>
        <div
          class="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950"
        >
          <form @submit="handleReply" class="space-y-3">
            <textarea
              v-model="replyText"
              placeholder="Write your reply..."
              rows="3"
              class="w-full p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <div class="flex justify-end gap-2">
              <RLVButton type="submit" :loading="sending">Send Reply</RLVButton>
            </div>
          </form>
        </div>
      </div>
      <div v-else class="flex-1 flex flex-col items-center justify-center text-neutral-400">
        <span class="i-lucide-inbox size-16 mb-2" />
        <p class="text-sm">Select an email to view details.</p>
      </div>
    </div>
  </div>
</template>
