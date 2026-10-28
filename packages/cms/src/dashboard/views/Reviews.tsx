import { For, Show, createSignal, type Component } from "solid-js";
import { resolveLabel } from "../../core/collections/define";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { useDashboard } from "../context";
import { cmsT } from "../../locale";
import {
  Button,
  Empty,
  Loading,
  Modal,
  PageHeader,
  StatusBadge,
  relativeTime,
  useLoader,
} from "../ui";

/** The review queue: pending/approved versions with approve, reject, diff and publish. */
export const Reviews: Component = () => {
  const { api, href, toast } = useDashboard();
  const queue = useLoader(() => api.versions.reviews());
  const [diff, setDiff] = createSignal<any>(null);
  const [comments, setComments] = createSignal<{ versionId: string; list: any[] } | null>(null);
  const [draft, setDraft] = createSignal("");

  const act = async (fn: () => Promise<unknown>, msg: string) => {
    try {
      await fn();
      toast(msg, "success");
      void queue.reload();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  return (
    <div>
      <PageHeader
        icon="i-lucide-check-check"
        title={cmsT("text.reviews")}
        description="Changes waiting for approval before they can be published."
      />
      <div class="p-6">
        <Loading when={queue.loading() && !queue.data()}>
          <Show
            when={queue.data()?.versions.length}
            fallback={
              <Empty
                icon="i-lucide-check-circle"
                title={cmsT("text.all-caught-up")}
                description="Nothing is waiting for review."
              />
            }
          >
            <div class="flex flex-col gap-3">
              <For each={queue.data()!.versions}>
                {(v) => (
                  <div class="flex flex-wrap items-center gap-3 rounded-xl border border-default p-4">
                    <div class="min-w-0 flex-1">
                      <a
                        href={href(`/e/${v.pageId}`)}
                        class="font-medium text-highlighted hover:underline"
                      >
                        {resolveLabel(v.title) || v.slug}
                      </a>
                      <div class="text-xs text-muted">
                        v{v.versionNumber} · {v.type} · by {v.createdBy} ·{" "}
                        {relativeTime(v.createdAt)} · {v.approvedBy.length} approval(s)
                      </div>
                      <Show when={v.changeSummary}>
                        <p class="mt-1 text-sm text-toned">{v.changeSummary}</p>
                      </Show>
                    </div>
                    <StatusBadge status={v.status} />
                    <Button
                      variant="ghost"
                      icon="i-lucide-git-compare"
                      onClick={async () =>
                        setDiff(
                          (await api.entries.diff(v.pageId, undefined, String(v.versionNumber)))
                            .diff,
                        )
                      }
                    >
                      Diff
                    </Button>
                    <Button
                      variant="ghost"
                      icon="i-lucide-message-square"
                      onClick={async () =>
                        setComments({
                          versionId: v.id,
                          list: (await api.versions.comments(v.id)).comments,
                        })
                      }
                    >
                      Comments
                    </Button>
                    <Show when={v.status === "pending"}>
                      <Button
                        variant="ghost"
                        onClick={() =>
                          void act(
                            () =>
                              api.versions.reject(v.id, prompt("Reason (optional)") ?? undefined),
                            "Rejected",
                          )
                        }
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        icon="i-lucide-check"
                        onClick={() => void act(() => api.versions.approve(v.id), "Approved")}
                      >
                        Approve
                      </Button>
                    </Show>
                    <Show when={v.status === "approved"}>
                      <Button
                        variant="primary"
                        icon="i-lucide-upload"
                        onClick={() =>
                          void act(
                            () => api.entries.publish(v.pageId, { versionId: v.id }),
                            "Published",
                          )
                        }
                      >
                        Publish
                      </Button>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Loading>
      </div>
      <Modal
        open={!!diff()}
        title={cmsT("text.changes-vs-live")}
        onClose={() => setDiff(null)}
        wide
      >
        <Show when={diff()}>
          <For
            each={diff().blocks.filter((b: any) => b.status !== "unchanged")}
            fallback={<p class="text-sm text-muted">{cmsT("text.no-block-changes")}</p>}
          >
            {(b: any) => (
              <div class="text-xs">
                <b class="capitalize">{b.status}</b> {b.type}
              </div>
            )}
          </For>
        </Show>
      </Modal>
      <Modal
        open={!!comments()}
        title={cmsT("text.comments")}
        onClose={() => setComments(null)}
        footer={
          <div class="flex w-full gap-2">
            <RLInput
              class="flex-1"
              value={draft()}
              onInput={(e) => setDraft(e.currentTarget.value)}
              placeholder={cmsT("text.write-a-comment")}
            />
            <Button
              variant="primary"
              disabled={!draft().trim()}
              onClick={async () => {
                const id = comments()!.versionId;
                await api.versions.comment(id, draft());
                setDraft("");
                setComments({ versionId: id, list: (await api.versions.comments(id)).comments });
              }}
            >
              Send
            </Button>
          </div>
        }
      >
        <div class="flex flex-col gap-2">
          <For
            each={comments()?.list ?? []}
            fallback={<p class="text-sm text-muted">{cmsT("text.no-comments-yet")}</p>}
          >
            {(c) => (
              <div class="rounded-lg bg-elevated px-3 py-2 text-sm">
                <div class="text-xs text-muted">
                  {c.userId} · {relativeTime(c.createdAt)}
                </div>
                {c.content}
              </div>
            )}
          </For>
        </div>
      </Modal>
    </div>
  );
};
