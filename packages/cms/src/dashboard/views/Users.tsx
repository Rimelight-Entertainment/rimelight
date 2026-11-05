import { Show, createMemo, createSignal, onCleanup, onSettled, type Component } from "solid-js";
import { useDashboard } from "../context";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { RLSelect } from "@rimelight/ui/components/select/RLSelect.tsx";
import { RLTable, type TableColumn } from "@rimelight/ui/components/table/RLTable.tsx";
import { Button, Empty, Field, Loading, Modal, PageHeader, formatDate } from "../ui";
import { CMS_ROLES } from "../../auth/roles";
import type { CmsUserRecord } from "../../services/users";

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

const roleLabel = (role: string) => ROLE_LABELS[role] ?? role;

const ROLE_ITEMS = CMS_ROLES.map((role) => ({ label: roleLabel(role), value: role }));

/** Users per page; the list grows with "Load more". */
const PAGE_SIZE = 50;
/** Delay after the last keystroke before the search runs. */
const SEARCH_DEBOUNCE_MS = 250;

/** Server guard codes (see services/users.ts) mapped to readable messages. */
const ERROR_TEXT: Partial<Record<string, string>> = {
  SELF_ROLE_CHANGE: "You can't change your own role.",
  SELF_DISABLE: "You can't disable your own account.",
  LAST_ADMIN: "At least one enabled admin must remain.",
};

const errorText = (err: unknown) => {
  const message = (err as Error).message;
  return ERROR_TEXT[message] ?? message;
};

const statusLabel = (user: CmsUserRecord) => {
  if (user.disabled) return "Disabled";
  return user.linked ? "Active" : "Invited";
};

/** Editable account. Email is the identity provider's join key and is read-only here. */
interface UserDraft {
  id: string;
  email: string;
  name: string;
  role: string;
  disabled: boolean;
  linked: boolean;
}

interface InviteDraft {
  email: string;
  name: string;
  role: string;
}

const toDraft = (u: CmsUserRecord): UserDraft => ({
  id: u.id,
  email: u.email,
  name: u.name ?? "",
  role: u.role,
  disabled: u.disabled,
  linked: u.linked,
});

export const Users: Component = () => {
  const { api, toast, user } = useDashboard();

  const [query, setQuery] = createSignal("");
  const [roleFilter, setRoleFilter] = createSignal("all");
  const [rows, setRows] = createSignal<CmsUserRecord[]>([]);
  const [total, setTotal] = createSignal(0);
  const [loading, setLoading] = createSignal(true);
  const [loadError, setLoadError] = createSignal<string | null>(null);
  const [editing, setEditing] = createSignal<UserDraft | null>(null);
  const [inviting, setInviting] = createSignal<InviteDraft | null>(null);

  // Each request takes a sequence number. A response that is no longer the latest request is
  // dropped, so a slower earlier search cannot overwrite the results of a newer one.
  let requestSeq = 0;
  let searchTimer: ReturnType<typeof setTimeout> | undefined;

  /** Loads one page: replaces the rows (reset), or appends the next page after the rows shown. */
  const fetchPage = async (reset: boolean) => {
    const seq = ++requestSeq;
    const role = roleFilter();
    setLoading(true);
    try {
      const page = await api.users.list({
        search: query().trim() || undefined,
        role: role === "all" ? undefined : role,
        limit: PAGE_SIZE,
        offset: reset ? 0 : rows().length,
      });
      if (seq !== requestSeq) return;
      setTotal(page.total);
      setRows(reset ? page.users : [...rows(), ...page.users]);
      setLoadError(null);
    } catch (err) {
      if (seq !== requestSeq) return;
      setLoadError((err as Error).message);
    } finally {
      if (seq === requestSeq) setLoading(false);
    }
  };

  /** Debounces typing so each keystroke does not issue a request. */
  const scheduleSearch = () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => void fetchPage(true), SEARCH_DEBOUNCE_MS);
  };

  onSettled(() => void fetchPage(true));
  onCleanup(() => clearTimeout(searchTimer));
  const isSelf = (id: string) => user()?.userId === id;
  const filtersActive = () => query().trim() !== "" || roleFilter() !== "all";

  const attempt = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (err) {
      toast(errorText(err), "error");
    }
  };

  const setDraft = (patch: Partial<UserDraft>) => {
    const draft = editing();
    if (draft) setEditing({ ...draft, ...patch });
  };

  const setInvite = (patch: Partial<InviteDraft>) => {
    const draft = inviting();
    if (draft) setInviting({ ...draft, ...patch });
  };

  const openUser = (u: CmsUserRecord) => setEditing(toDraft(u));

  const openInvite = () => setInviting({ email: "", name: "", role: "viewer" });

  const saveUser = () =>
    attempt(async () => {
      const draft = editing();
      if (!draft) return;
      await api.users.update(draft.id, { name: draft.name, role: draft.role });
      setEditing(null);
      toast("User saved");
      void fetchPage(true);
    });

  const toggleDisabled = () =>
    attempt(async () => {
      const draft = editing();
      if (!draft) return;
      if (!draft.disabled && !confirm(`Disable ${draft.email}?`)) return;
      await api.users.setDisabled(draft.id, !draft.disabled);
      setEditing(null);
      toast(draft.disabled ? "User enabled" : "User disabled");
      void fetchPage(true);
    });

  const sendInvite = () =>
    attempt(async () => {
      const draft = inviting();
      if (!draft) return;
      await api.users.invite({ email: draft.email, role: draft.role, name: draft.name });
      setInviting(null);
      toast("Invite created");
      void fetchPage(true);
    });

  const columns = createMemo<TableColumn<CmsUserRecord>[]>(() => [
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <div class="flex flex-col">
          <span class="font-medium text-highlighted">{row.original.name ?? "—"}</span>
          <span class="font-mono text-xs text-toned">{row.original.email}</span>
        </div>
      ),
    },
    {
      id: "role",
      header: "Role",
      cell: ({ row }) => roleLabel(row.original.role),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <span class={row.original.disabled ? "text-error-500" : "text-toned"}>
          {statusLabel(row.original)}
        </span>
      ),
    },
    {
      id: "updated",
      header: "Updated",
      meta: { class: { td: "text-xs text-toned" } },
      cell: ({ row }) => formatDate(row.original.updatedAt),
    },
    {
      id: "actions",
      header: "",
      meta: { class: { td: "text-right" } },
      cell: ({ row }) => (
        <Button variant="ghost" icon="i-lucide-pencil" onClick={() => openUser(row.original)}>
          Edit
        </Button>
      ),
    },
  ]);

  return (
    <div>
      <PageHeader
        icon="i-lucide-user-cog"
        title="Users"
        description="Dashboard accounts, their roles, and invitations. Only admins can manage users."
        actions={
          <Button variant="primary" icon="i-lucide-user-plus" onClick={openInvite}>
            Invite user
          </Button>
        }
      />
      <div class="p-6">
        <div class="flex flex-wrap items-center gap-3">
          <RLInput
            class="max-w-xs"
            placeholder="Search name or email"
            value={query()}
            onInput={(e) => {
              setQuery(e.currentTarget.value);
              scheduleSearch();
            }}
          />
          <RLSelect
            aria-label="Filter role"
            value={roleFilter()}
            items={[{ label: "All roles", value: "all" }, ...ROLE_ITEMS]}
            onChange={(e) => {
              setRoleFilter(e.currentTarget.value);
              clearTimeout(searchTimer);
              void fetchPage(true);
            }}
          />
          <span class="ml-auto text-xs text-muted">
            {rows().length} of {total()} {total() === 1 ? "user" : "users"}
          </span>
        </div>
        <div class="mt-4">
          <Show
            when={!loadError()}
            fallback={
              <Empty
                icon="i-lucide-shield-alert"
                title="Couldn't load users"
                description={loadError() ?? ""}
              />
            }
          >
            <Loading when={loading() && rows().length === 0}>
              <Show
                when={rows().length}
                fallback={
                  <Show
                    when={filtersActive()}
                    fallback={
                      <Empty
                        icon="i-lucide-users"
                        title="No users yet."
                        description="Invite a teammate to give them dashboard access."
                        action={
                          <Button variant="primary" icon="i-lucide-user-plus" onClick={openInvite}>
                            Invite user
                          </Button>
                        }
                      />
                    }
                  >
                    <Empty
                      icon="i-lucide-search-x"
                      title="No matching users"
                      action={
                        <Button
                          onClick={() => {
                            clearTimeout(searchTimer);
                            setQuery("");
                            setRoleFilter("all");
                            void fetchPage(true);
                          }}
                        >
                          Clear filters
                        </Button>
                      }
                    />
                  </Show>
                }
              >
                <RLTable data={rows()} columns={columns()} />
                <Show when={rows().length < total()}>
                  <div class="mt-4 flex justify-center">
                    <Button disabled={loading()} onClick={() => void fetchPage(false)}>
                      Load more
                    </Button>
                  </div>
                </Show>
              </Show>
            </Loading>
          </Show>
        </div>
      </div>

      <Modal
        open={!!editing()}
        title="Edit user"
        description={editing()?.email}
        onClose={() => setEditing(null)}
        footer={
          <Show when={editing()}>
            {(draft) => (
              <>
                <Button
                  variant="ghost"
                  class="mr-auto"
                  disabled={isSelf(draft().id)}
                  onClick={() => void toggleDisabled()}
                >
                  {draft().disabled ? "Enable" : "Disable"}
                </Button>
                <Button variant="primary" onClick={() => void saveUser()}>
                  Save
                </Button>
              </>
            )}
          </Show>
        }
      >
        <Show when={editing()}>
          {(draft) => (
            <div class="flex flex-col gap-3">
              <Field label="Email" hint="Sign-in address, set by the identity provider.">
                <RLInput value={draft().email} disabled />
              </Field>
              <Field label="Name">
                <RLInput
                  value={draft().name}
                  onInput={(e) => setDraft({ name: e.currentTarget.value })}
                />
              </Field>
              <Field
                label="Role"
                hint={
                  isSelf(draft().id) ? "This is your account. You can't change your own role." : ""
                }
              >
                <RLSelect
                  aria-label="Role"
                  value={draft().role}
                  items={ROLE_ITEMS}
                  disabled={isSelf(draft().id)}
                  onChange={(e) => setDraft({ role: e.currentTarget.value })}
                />
              </Field>
              <p class="text-xs text-toned">
                {draft().linked
                  ? "Has signed in."
                  : "Invited. Activates on first sign-in with this email."}
              </p>
            </div>
          )}
        </Show>
      </Modal>

      <Modal
        open={!!inviting()}
        title="Invite user"
        description="Creates the account now. No email is sent: the person signs in with this address and gets the role below."
        onClose={() => setInviting(null)}
        footer={
          <Button variant="primary" onClick={() => void sendInvite()}>
            Send invite
          </Button>
        }
      >
        <Show when={inviting()}>
          {(draft) => (
            <div class="flex flex-col gap-3">
              <Field label="Email">
                <RLInput
                  type="email"
                  placeholder="name@example.com"
                  value={draft().email}
                  onInput={(e) => setInvite({ email: e.currentTarget.value })}
                />
              </Field>
              <Field
                label="Name"
                hint="Optional. The identity provider's name replaces it on sign-in when it provides one."
              >
                <RLInput
                  value={draft().name}
                  onInput={(e) => setInvite({ name: e.currentTarget.value })}
                />
              </Field>
              <Field label="Role">
                <RLSelect
                  aria-label="Invite role"
                  value={draft().role}
                  items={ROLE_ITEMS}
                  onChange={(e) => setInvite({ role: e.currentTarget.value })}
                />
              </Field>
            </div>
          )}
        </Show>
      </Modal>
    </div>
  );
};
