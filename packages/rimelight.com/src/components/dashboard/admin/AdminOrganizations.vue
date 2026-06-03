<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { authClient } from "@/auth/auth-client";
import RLVFormField from "@rimelight/ui/components/vue/RLVFormField.vue";
import RLVInput from "@rimelight/ui/components/vue/RLVInput.vue";
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue";

interface Organization {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    memberCount: number;
    createdAt: string;
    teams: {
        id: string;
        name: string;
    }[];
}

const orgs = ref<Organization[]>([]);
const pending = ref(true);
const isCreateModalOpen = ref(false);
const isSubmitting = ref(false);
const state = reactive({ name: "", slug: "" });

async function fetchOrgs() {
  pending.value = true;
  try {
    const res = await fetch("/api/admin/organizations");
    orgs.value = (await res.json()) as Organization[];
  } catch (e) {
    console.error(e);
  } finally {
    pending.value = false;
  }
}

onMounted(() => {
  fetchOrgs();
});

async function onSubmit(e: Event) {
  e.preventDefault();
  isSubmitting.value = true;
  try {
    const { data, error } = await authClient.organization.create({
      name: state.name,
      slug: state.slug,
      keepCurrentActiveOrganization: true
    });
    if (error) {
      alert("Error: " + (error.message || "Failed to create organization"));
      return;
    }
    alert(`Organization ${data?.name} created successfully.`);
    isCreateModalOpen.value = false;
    state.name = "";
    state.slug = "";
    await fetchOrgs();
  } catch (err) {
    alert("An unknown error occurred during submission.");
  } finally {
    isSubmitting.value = false;
  }
}

async function deleteOrg(id: string) {
  if (!confirm("Are you sure you want to delete this organization?")) return;
  try {
    const res = await fetch(`/api/admin/organizations/${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Organization deleted successfully.");
      await fetchOrgs();
    } else {
      alert("Failed to delete organization.");
    }
  } catch (e) {
    console.error(e);
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-bold text-neutral-900 dark:text-white">Organizations</h3>
      <RLVButton color="primary" @click="isCreateModalOpen = true">
        <span class="i-lucide-plus size-4 mr-1.5" />
        Create Organization
      </RLVButton>
    </div>

    <!-- Create Org Form / Modal Sim -->
    <div
      v-if="isCreateModalOpen"
      class="p-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl"
    >
      <h4 class="text-md font-bold mb-1">Create Organization</h4>
      <p class="text-xs text-neutral-500 mb-4">Set up a new workspace for your teams.</p>
      <form @submit="onSubmit" class="space-y-4 max-w-md">
        <RLVFormField label="Organization Name" required>
          <RLVInput v-model="state.name" placeholder="Acme Corp" class="w-full" required />
        </RLVFormField>
        <RLVFormField label="Slug" required>
          <RLVInput v-model="state.slug" placeholder="acme-corp" class="w-full" required />
        </RLVFormField>
        <div class="flex gap-2">
          <RLVButton type="submit" :loading="isSubmitting">Create</RLVButton>
          <RLVButton type="button" color="neutral" variant="soft" @click="isCreateModalOpen = false"
            >Cancel</RLVButton          >
        </div>
      </form>
    </div>

    <!-- Organizations Table -->
    <div
      class="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden"
    >
      <div v-if="pending" class="p-8 text-center text-sm text-neutral-500">
        Loading organizations...
      </div>
      <div v-else-if="!orgs.length" class="p-8 text-center text-sm text-neutral-500">
        No organizations found.
      </div>
      <table v-else class="w-full border-collapse text-left text-sm">
        <thead>
          <tr
            class="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-xs font-bold uppercase text-neutral-500 tracking-wider"
          >
            <th class="p-4">Organization</th>
            <th class="p-4">Slug</th>
            <th class="p-4">Members</th>
            <th class="p-4">Teams</th>
            <th class="p-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-200 dark:divide-neutral-800">
          <tr
            v-for="org in orgs"
            :key="org.id"
            class="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/50 transition-colors"
          >
            <td class="p-4 font-semibold text-neutral-900 dark:text-white flex items-center gap-3">
              <div
                class="size-8 rounded-full overflow-hidden bg-neutral-100 flex items-center justify-center border border-neutral-200 dark:border-neutral-850"
              >
                <img
                  v-if="org.logo"
                  :src="org.logo"
                  :alt="org.name"
                  class="size-full object-cover"                />
                <span v-else class="i-lucide-building-2 size-4 text-neutral-400" />
              </div>
              {{ org.name }}
            </td>
            <td class="p-4 font-mono text-xs">{{ org.slug }}</td>
            <td class="p-4">{{ org.memberCount }}</td>
            <td class="p-4">
              <div v-if="org.teams?.length" class="flex flex-wrap gap-1.5">
                <span
                  v-for="team in org.teams"
                  :key="team.id"
                  class="px-2 py-0.5 text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 rounded-md"
                >
                  {{ team.name }}
                </span>
              </div>
              <span v-else class="text-xs text-neutral-400 italic">No teams</span>
            </td>
            <td class="p-4 text-right">
              <RLVButton
                color="neutral"
                variant="ghost"
                class="size-8 p-0 rounded-xl"
                @click="deleteOrg(org.id)"
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