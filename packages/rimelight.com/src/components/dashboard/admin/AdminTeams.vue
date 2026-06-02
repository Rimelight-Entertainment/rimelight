<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue"
import RLVFormField from "@rimelight/ui/components/vue/RLVFormField.vue"
import RLVInput from "@rimelight/ui/components/vue/RLVInput.vue"
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue"

interface Team {
  id: string
  name: string
  slug: string
  logo?: string
  memberCount: number
  createdAt: string
  parentId: string | null
  subteams?: Team[]
}

const teams = ref<Team[]>([])
const pending = ref(true)
const isCreateModalOpen = ref(false)
const isSubmitting = ref(false)
const state = reactive({
  name: "",
  parentId: null as string | null,
  parentName: ""
})

async function fetchTeams() {
  pending.value = true
  try {
    const res = await fetch("/api/admin/teams")
    teams.value = (await res.json()) as Team[]
  } catch (e) {
    console.error(e)
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  fetchTeams()
})

function openCreateSubteamModal(parent: Team) {
  state.parentId = parent.id
  state.parentName = parent.name
  isCreateModalOpen.value = true
}

async function createTeam(e: Event) {
  e.preventDefault()
  isSubmitting.value = true
  try {
    const res = await fetch("/api/admin/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: state.name,
        parentId: state.parentId
      })
    })
    if (!res.ok) throw new Error("Failed to create team")
    alert("Team created successfully.")
    isCreateModalOpen.value = false
    state.name = ""
    state.parentId = null
    state.parentName = ""
    await fetchTeams()
  } catch (err: any) {
    alert("Error: " + err.message)
  } finally {
    isSubmitting.value = false
  }
}

async function deleteTeam(id: string) {
  if (!confirm("Are you sure you want to delete this team?")) return
  try {
    const res = await fetch(`/api/admin/teams/${id}`, { method: "DELETE" })
    if (res.ok) {
      alert("Team removed successfully.")
      await fetchTeams()
    } else {
      alert("Failed to delete team.")
    }
  } catch (err) {
    console.error(err)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-bold text-neutral-900 dark:text-white">Teams</h3>
      <RLVButton
        color="primary"
        @click="
          () => {
            state.parentId = null
            isCreateModalOpen = true
          }
        "
      >
        <span class="i-lucide-plus size-4 mr-1.5" />
        Create Team
      </RLVButton>
    </div>

    <div
      v-if="isCreateModalOpen"
      class="p-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl"
    >
      <h4 class="text-md font-bold mb-1">{{ state.parentId ? "Add Subteam" : "Create Team" }}</h4>
      <p class="text-xs text-neutral-500 mb-4">
        {{
          state.parentId
            ? `Creating subteam for ${state.parentName}`
            : "Set up a new team workspace."
        }}
      </p>
      <form @submit="createTeam" class="space-y-4 max-w-md">
        <RLVFormField v-if="state.parentId" label="Parent Team">
          <input
            :placeholder="state.parentName"
            disabled
            class="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-sm"
          />
        </RLVFormField>
        <RLVFormField label="Team Name" required>
          <RLVInput v-model="state.name" placeholder="e.g. Recruitment" class="w-full" required />
        </RLVFormField>
        <div class="flex gap-2">
          <RLVButton type="submit" :loading="isSubmitting">Create</RLVButton>
          <RLVButton type="button" color="neutral" variant="soft" @click="isCreateModalOpen = false">Cancel</RLVButton>
        </div>
      </form>
    </div>

    <div class="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
      <div v-if="pending" class="p-8 text-center text-sm text-neutral-500">Loading teams...</div>
      <div v-else-if="!teams.length" class="p-8 text-center text-sm text-neutral-500">
        No teams found.
      </div>
      <table v-else class="w-full border-collapse text-left text-sm">
        <thead>
          <tr class="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-bold uppercase text-neutral-500 tracking-wider">
            <th class="p-4">Team</th>
            <th class="p-4">Members</th>
            <th class="p-4">Created At</th>
            <th class="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
          <tr
            v-for="team in teams"
            :key="team.id"
            class="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors"
          >
            <td class="p-4 font-semibold text-neutral-900 dark:text-white flex items-center gap-3">
              <div class="size-8 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center border border-neutral-200 dark:border-neutral-850">
                <img
                  v-if="team.logo"
                  :src="team.logo"
                  :alt="team.name"
                  class="size-full object-cover"
                />
                <span v-else class="i-lucide-users size-4 text-neutral-400" />
              </div>
              {{ team.name }}
            </td>
            <td class="p-4">{{ team.memberCount }} members</td>
            <td class="p-4">{{ new Date(team.createdAt).toLocaleDateString() }}</td>
            <td class="p-4 text-right flex justify-end gap-1">
              <RLVButton
                color="neutral"
                variant="ghost"
                class="size-8 p-0 rounded-xl"
                title="Add Subteam"
                @click="openCreateSubteamModal(team)"
              >
                <span class="i-lucide-plus-circle size-4" />
              </RLVButton>
              <RLVButton
                color="neutral"
                variant="ghost"
                class="size-8 p-0 rounded-xl"
                title="Delete Team"
                @click="deleteTeam(team.id)"
              >
                <span class="i-lucide-trash size-4 text-red-500" />
              </RLVButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
