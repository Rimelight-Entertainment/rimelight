import { For, Show, createSignal, type Component } from "solid-js";
import { useDashboard } from "../context";
import { inputClass } from "../fields/FieldInput";
import { Button, Empty, Loading, Modal, PageHeader, useLoader } from "../ui";

interface MediaFile {
  key: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

const kb = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.ceil(n / 1e3)} KB`);

/** Grid of files with upload, search and type filter. Used as a page and inside the picker. */
const MediaGrid: Component<{ onPick?: (file: MediaFile) => void }> = (props) => {
  const { api, toast } = useDashboard();
  const [search, setSearch] = createSignal("");
  const [type, setType] = createSignal("all");
  const [uploading, setUploading] = createSignal(false);
  const files = useLoader(() => api.media.list({ search: search(), type: type() }));

  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(list)) await api.media.upload(file);
      toast(`Uploaded ${list.length} file(s)`, "success");
      void files.reload();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      class="flex flex-col gap-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        void upload(e.dataTransfer?.files ?? null);
      }}
    >
      <div class="flex flex-wrap items-center gap-2">
        <input class={`${inputClass} max-w-xs`} placeholder="Search files…" value={search()} onInput={(e) => setSearch(e.currentTarget.value)} onChange={() => void files.reload()} />
        <select class={`${inputClass} w-36`} value={type()} onChange={(e) => { setType(e.currentTarget.value); void files.reload(); }}>
          <option value="all">All types</option>
          <option value="images">Images</option>
          <option value="videos">Videos</option>
          <option value="audio">Audio</option>
          <option value="documents">Documents</option>
        </select>
        <label class="ml-auto inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-600">
          <span class={`${uploading() ? "i-lucide-loader-circle animate-spin" : "i-lucide-upload"} size-4`} />
          Upload
          <input type="file" multiple class="hidden" onChange={(e) => void upload(e.currentTarget.files)} />
        </label>
      </div>
      <Show when={!files.error()} fallback={<Empty icon="i-lucide-hard-drive" title="Storage isn't available" description={files.error() ?? ""} />}>
        <Loading when={files.loading() && !files.data()}>
          <Show when={files.data()?.data.files.length} fallback={<Empty icon="i-lucide-image" title="No files" description="Drop files here or use Upload." />}>
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              <For each={files.data()!.data.files as MediaFile[]}>
                {(f) => (
                  <div class="group relative flex flex-col overflow-hidden rounded-lg border border-default">
                    <button type="button" class="flex aspect-square items-center justify-center bg-elevated" onClick={() => props.onPick?.(f)} disabled={!props.onPick}>
                      <Show when={f.mimeType.startsWith("image/")} fallback={<span class="i-lucide-file size-8 text-muted" />}>
                        <img src={f.url} alt={f.name} loading="lazy" class="size-full object-cover" />
                      </Show>
                    </button>
                    <div class="flex items-center gap-1 px-2 py-1.5 text-[11px]">
                      <span class="min-w-0 flex-1 truncate text-highlighted" title={f.name}>{f.name}</span>
                      <span class="text-muted">{kb(f.size)}</span>
                    </div>
                    <Show when={!props.onPick}>
                      <div class="absolute right-1 top-1 hidden gap-1 group-hover:flex">
                        <button type="button" title="Copy URL" class="rounded bg-black/60 p-1 text-white" onClick={() => { void navigator.clipboard.writeText(f.url); toast("URL copied"); }}>
                          <span class="i-lucide-link block size-3.5" />
                        </button>
                        <button type="button" title="Delete" class="rounded bg-black/60 p-1 text-white" onClick={async () => {
                          if (!confirm(`Delete ${f.name}? Entries using it will show a broken image.`)) return;
                          await api.media.remove(f.key);
                          void files.reload();
                        }}>
                          <span class="i-lucide-trash-2 block size-3.5" />
                        </button>
                      </div>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Loading>
      </Show>
    </div>
  );
};

export const MediaLibrary: Component = () => (
  <div>
    <PageHeader icon="i-lucide-image" title="Media" description="Images and files stored in your bucket. Drag files anywhere on this page to upload." />
    <div class="p-6"><MediaGrid /></div>
  </div>
);

export const MediaPicker: Component<{ open: boolean; onClose: () => void; onPick: (file: MediaFile) => void }> = (props) => (
  <Modal open={props.open} title="Choose media" onClose={props.onClose} wide>
    <Show when={props.open}><MediaGrid onPick={props.onPick} /></Show>
  </Modal>
);

