import { createSignal, onMount, For, Show, createMemo, type Component } from "solid-js"
import RLSInput from "@rimelight/ui/components/input/RLSInput.tsx"
import RLSButton from "@rimelight/ui/components/button/RLSButton.tsx"
import RLSBadge from "@rimelight/ui/components/badge/RLSBadge.tsx"
import RLSIcon from "@rimelight/ui/components/icon/RLSIcon.tsx"
import RLSTextarea from "@rimelight/ui/components/textarea/RLSTextarea.tsx"

export interface BylineEntity {
  id: string
  name: string
  slug: string
  websiteUrl?: string | null
  bio?: string | null
  avatar?: string | null
  userId?: string | null
  socials?: Record<string, string>
  metadata?: Record<string, any>
  createdAt?: string
}

export const RimelightBylinesManager: Component = () => {
  const [bylines, setBylines] = createSignal<BylineEntity[]>([])
  const [selectedId, setSelectedId] = createSignal<string | null>(null)
  const [searchQuery, setSearchQuery] = createSignal("")
  const [isLoading, setIsLoading] = createSignal(false)
  const [isSaving, setIsSaving] = createSignal(false)
  const [error, setError] = createSignal<string | null>(null)

  // Form State
  const [form, setForm] = createSignal<{
    name: string
    slug: string
    websiteUrl: string
    bio: string
    avatar: string
    userId: string
  }>({
    name: "",
    slug: "",
    websiteUrl: "",
    bio: "",
    avatar: "",
    userId: ""
  })

  const loadBylines = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/cms/bylines")
      if (!res.ok) throw new Error("Failed to load bylines")
      const data = await res.json()
      const list: BylineEntity[] = Array.isArray(data) ? data : []
      setBylines(list)

      if (list.length > 0 && !selectedId()) {
        selectByline(list[0]!)
      } else if (list.length === 0) {
        startNewByline()
      }
    } catch (err: any) {
      setError(err.message || "Failed to load bylines")
    } finally {
      setIsLoading(false)
    }
  }

  onMount(() => {
    void loadBylines()
  })

  const filteredBylines = createMemo(() => {
    const q = searchQuery().toLowerCase().trim()
    if (!q) return bylines()
    return bylines().filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.slug.toLowerCase().includes(q) ||
        (b.bio && b.bio.toLowerCase().includes(q))
    )
  })

  const selectByline = (byline: BylineEntity) => {
    setSelectedId(byline.id)
    setForm({
      name: byline.name || "",
      slug: byline.slug || "",
      websiteUrl: byline.websiteUrl || "",
      bio: byline.bio || "",
      avatar: byline.avatar || "",
      userId: byline.userId || ""
    })
  }

  const startNewByline = () => {
    setSelectedId(null)
    setForm({
      name: "",
      slug: "",
      websiteUrl: "",
      bio: "",
      avatar: "",
      userId: ""
    })
  }

  const handleNameChange = (name: string) => {
    const isNew = !selectedId()
    const autoSlug = isNew
      ? name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
      : form().slug

    setForm((prev) => ({
      ...prev,
      name,
      slug: isNew ? autoSlug : prev.slug
    }))
  }

  const handleSave = async (e?: Event) => {
    e?.preventDefault()
    const f = form()
    if (!f.name.trim()) {
      alert("Display name is required")
      return
    }

    const slug =
      f.slug.trim() ||
      f.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")

    const payload = {
      name: f.name.trim(),
      slug,
      websiteUrl: f.websiteUrl.trim() || null,
      bio: f.bio.trim() || null,
      avatar: f.avatar.trim() || null,
      userId: f.userId.trim() || null
    }

    setIsSaving(true)
    try {
      if (selectedId()) {
        const res = await fetch(`/api/cms/bylines/${selectedId()}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error("Failed to update byline")
        const updated = await res.json()
        setBylines((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
      } else {
        const res = await fetch("/api/cms/bylines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error("Failed to create byline")
        const created = await res.json()
        setBylines((prev) => [created, ...prev])
        setSelectedId(created.id)
      }
    } catch (err: any) {
      alert(err.message || "Failed to save byline")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    const id = selectedId()
    if (!id) return
    const current = bylines().find((b) => b.id === id)
    if (!confirm(`Are you sure you want to delete byline "${current?.name || id}"?`)) return

    try {
      const res = await fetch(`/api/cms/bylines/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete byline")
      setBylines((prev) => prev.filter((b) => b.id !== id))
      const remaining = bylines().filter((b) => b.id !== id)
      if (remaining.length > 0) {
        selectByline(remaining[0]!)
      } else {
        startNewByline()
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete byline")
    }
  }

  return (
    <div class="flex flex-col gap-6 w-full max-w-7xl mx-auto py-2">
      {/* Top Header */}
      <div class="flex items-center justify-between border-b border-default pb-4">
        <div>
          <h1 class="text-2xl font-bold text-highlighted tracking-tight">Bylines</h1>
          <p class="text-xs text-muted mt-0.5">
            Manage author profiles and multi-author attributions across articles and pages.
          </p>
        </div>
      </div>

      {/* 2-Column Master-Detail Layout */}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Search & Byline Cards List (5 Cols) */}
        <div class="lg:col-span-5 flex flex-col gap-3">
          <div class="flex items-center gap-2">
            <div class="flex-1">
              <RLSInput
                value={searchQuery()}
                onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                  setSearchQuery(e.currentTarget.value)
                }
                placeholder="Search bylines..."
                size="sm"
              />
            </div>
            <RLSButton
              variant="solid"
              color="primary"
              size="sm"
              onClick={startNewByline}
              leadingIcon="plus"
              label="New"
            />
          </div>

          <Show when={isLoading()}>
            <div class="p-8 text-center text-xs text-muted animate-pulse">Loading bylines...</div>
          </Show>

          <Show when={error()}>
            <div class="p-4 text-center text-xs text-error-500">{error()}</div>
          </Show>

          <Show when={!isLoading() && filteredBylines().length === 0}>
            <div class="p-8 text-center border border-dashed border-default rounded-xl flex flex-col items-center gap-2">
              <RLSIcon name="user" size="md" class="text-muted/50" />
              <span class="text-xs font-semibold text-highlighted">No bylines found</span>
              <p class="text-[11px] text-muted">
                Create a byline to attribute authors to your posts.
              </p>
            </div>
          </Show>

          <div class="flex flex-col gap-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            <For each={filteredBylines()}>
              {(item) => {
                const isSelected = () => selectedId() === item.id
                return (
                  <button
                    type="button"
                    onClick={() => selectByline(item)}
                    class={`flex items-center gap-3 p-3 rounded-xl border text-left transition cursor-pointer ${
                      isSelected()
                        ? "bg-elevated/90 border-primary shadow-sm"
                        : "bg-background/40 hover:bg-elevated/40 border-default"
                    }`}
                  >
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt={item.name}
                        class="w-10 h-10 rounded-full object-cover shrink-0 border border-default"
                      />
                    ) : (
                      <div class="w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0 border border-primary/20">
                        {item.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div class="flex flex-col min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-1">
                        <span class="text-sm font-semibold text-highlighted truncate">
                          {item.name}
                        </span>
                        <Show when={isSelected()}>
                          <RLSBadge variant="solid" color="primary" size="sm">
                            Active
                          </RLSBadge>
                        </Show>
                      </div>
                      <span class="text-xs font-mono text-muted truncate">{item.slug}</span>
                    </div>
                  </button>
                )
              }}
            </For>
          </div>
        </div>

        {/* Right Column: Edit / Create Form (7 Cols) */}
        <div class="lg:col-span-7 bg-elevated/30 border border-default rounded-2xl p-6 flex flex-col gap-5">
          <div class="flex items-center justify-between border-b border-default pb-3">
            <h3 class="text-lg font-bold text-highlighted">
              {selectedId() ? "Edit byline" : "Create byline"}
            </h3>
            <Show when={selectedId()}>
              <span class="text-xs font-mono text-muted">ID: {selectedId()}</span>
            </Show>
          </div>

          <form onSubmit={handleSave} class="flex flex-col gap-4">
            {/* Display Name */}
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-neutral-700">Display name *</label>
              <RLSInput
                value={form().name}
                onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                  handleNameChange(e.currentTarget.value)
                }
                placeholder="e.g. Guest Contributor, EmDash Editorial"
              />
            </div>

            {/* Slug */}
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-neutral-700">Slug</label>
              <RLSInput
                value={form().slug}
                onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                  setForm((prev) => ({ ...prev, slug: e.currentTarget.value }))
                }
                placeholder="guest-contributor"
              />
            </div>

            {/* Website URL */}
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-neutral-700">Website URL</label>
              <RLSInput
                value={form().websiteUrl}
                onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                  setForm((prev) => ({ ...prev, websiteUrl: e.currentTarget.value }))
                }
                placeholder="https://..."
              />
            </div>

            {/* Bio */}
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-neutral-700">Bio</label>
              <RLSTextarea
                value={form().bio}
                onInput={(e: InputEvent & { currentTarget: HTMLTextAreaElement }) =>
                  setForm((prev) => ({ ...prev, bio: e.currentTarget.value }))
                }
                autoGrow
                placeholder="Short author bio..."
                ui={{
                  root: () => "",
                  textarea: () =>
                    "w-full text-sm py-2 px-3 rounded-lg border border-default bg-background text-highlighted focus:outline-none focus:ring-1 focus:ring-primary resize-none min-h-[80px]"
                }}
              />
            </div>

            {/* Avatar URL & Preview */}
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-neutral-700">Avatar Image URL</label>
              <div class="flex items-center gap-3">
                <Show
                  when={form().avatar}
                  fallback={
                    <div class="w-12 h-12 rounded-xl border border-dashed border-default flex items-center justify-center text-muted/50 shrink-0">
                      <RLSIcon name="image" size="md" />
                    </div>
                  }
                >
                  <img
                    src={form().avatar}
                    alt="Preview"
                    class="w-12 h-12 rounded-xl object-cover border border-default shrink-0"
                  />
                </Show>
                <div class="flex-1">
                  <RLSInput
                    value={form().avatar}
                    onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                      setForm((prev) => ({ ...prev, avatar: e.currentTarget.value }))
                    }
                    placeholder="https://... / avatar.png"
                  />
                </div>
              </div>
            </div>

            {/* Linked User ID */}
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-semibold text-neutral-700">Linked user</label>
              <RLSInput
                value={form().userId}
                onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                  setForm((prev) => ({ ...prev, userId: e.currentTarget.value }))
                }
                placeholder="Optional system User ID or email"
              />
            </div>

            {/* Form Actions */}
            <div class="flex items-center justify-between border-t border-default pt-4 mt-2">
              <Show when={selectedId()} fallback={<div />}>
                <RLSButton
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="sm"
                  onClick={handleDelete}
                  label="Delete"
                  class="!text-error-500 hover:!text-error-600 !border-error-500/30"
                />
              </Show>

              <div class="flex items-center gap-2">
                <RLSButton
                  type="button"
                  variant="outline"
                  color="neutral"
                  size="sm"
                  onClick={startNewByline}
                  label="Cancel"
                />
                <RLSButton
                  type="submit"
                  variant="solid"
                  color="primary"
                  size="sm"
                  disabled={isSaving()}
                  label={isSaving() ? "Saving..." : selectedId() ? "Save Changes" : "Create Byline"}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
