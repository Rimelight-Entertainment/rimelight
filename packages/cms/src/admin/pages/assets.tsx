import { createSignal, For, Show, type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { useCmsApi } from "./_shared.tsx";
import type { StorageFile } from "../../storage/index.ts";

export interface AssetsPageProps {
  basePath?: string | undefined;
  apiBase?: string | undefined;
  initialFiles?: StorageFile[] | undefined;
}

function formatFileSize(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(1)} ${units[unit]}`;
}

export const AssetsPage: Component<AssetsPageProps> = (props) => {
  const base = () => props.basePath ?? "/cms";
  const apiBase = () => props.apiBase ?? "/api/cms";
  const mediaBase = () => `${apiBase()}/media`;
  const [search, setSearch] = createSignal("");
  const [typeFilter, setTypeFilter] = createSignal("all");
  const [uploading, setUploading] = createSignal(false);

  const remote = useCmsApi<{ success: boolean; data: { files: StorageFile[] } }>(() =>
    props.initialFiles ? null : mediaBase()
  );
  const files = () => props.initialFiles ?? remote.data()?.data.files ?? [];

  const filtered = () => {
    const q = search().toLowerCase();
    return files().filter((f) => {
      if (q && !f.name.toLowerCase().includes(q) && !f.key.toLowerCase().includes(q)) return false;
      const t = typeFilter();
      if (t === "images") return f.mimeType.startsWith("image/");
      if (t === "videos") return f.mimeType.startsWith("video/");
      if (t === "audio") return f.mimeType.startsWith("audio/");
      if (t === "documents")
        return (
          f.mimeType.includes("pdf") ||
          f.mimeType.includes("text") ||
          f.mimeType.includes("document")
        );
      return true;
    });
  };

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      await fetch(mediaBase(), { method: "POST", body: form });
      await remote.refetch();
    } finally {
      setUploading(false);
    }
  };

  const remove = async (key: string) => {
    await fetch(`${mediaBase()}?key=${encodeURIComponent(key)}`, { method: "DELETE" });
    await remote.refetch();
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <CMSDashboardLayout
      title="Assets"
      description="Manage media library files"
      activeSection="assets"
      basePath={base()}
      toolbarRight={
        <label class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground cursor-pointer">
          {uploading() ? "Uploading…" : "Upload Asset"}
          <input
            type="file"
            class="hidden"
            onChange={(e) => {
              const f = e.currentTarget.files?.[0];
              if (f) void upload(f);
            }}
          />
        </label>
      }
    >
      <div class="flex gap-2 flex-wrap">
        <input
          class="border border-default rounded-md px-3 py-2 bg-default text-sm min-w-52"
          placeholder="Search files…"
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
        />
        <select
          class="border border-default rounded-md px-3 py-2 bg-default text-sm"
          value={typeFilter()}
          onChange={(e) => setTypeFilter(e.currentTarget.value)}
        >
          <option value="all">All types</option>
          <option value="images">Images</option>
          <option value="videos">Videos</option>
          <option value="audio">Audio</option>
          <option value="documents">Documents</option>
        </select>
      </div>

      <Show when={filtered().length === 0}>
        <p class="text-sm text-muted text-center p-8">
          No assets found. Upload your first file to get started.
        </p>
      </Show>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <For each={filtered()}>
          {(file) => (
            <div class="border border-default rounded-lg bg-default p-4 flex flex-col gap-2">
              <Show when={file.mimeType.startsWith("image/")}>
                <img src={file.url} alt={file.name} class="rounded-md max-h-40 object-cover" />
              </Show>
              <div class="flex items-start justify-between gap-2">
                <p class="text-sm font-medium truncate">{file.name}</p>
                <RLBadge variant="soft" color="neutral" size="xs">
                  {formatFileSize(file.size)}
                </RLBadge>
              </div>
              <p class="font-mono text-xs text-muted truncate">{file.key}</p>
              <div class="flex gap-2 mt-1">
                <RLButton variant="ghost" size="xs" onClick={() => void copyUrl(file.url)}>
                  Copy URL
                </RLButton>
                <RLButton variant="ghost" size="xs" onClick={() => void remove(file.key)}>
                  Delete
                </RLButton>
              </div>
            </div>
          )}
        </For>
      </div>
    </CMSDashboardLayout>
  );
};

export default AssetsPage;
