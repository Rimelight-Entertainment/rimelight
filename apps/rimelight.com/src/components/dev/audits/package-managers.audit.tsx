import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLPackageManagers } from "@rimelight/ui/components/package-managers/RLPackageManagers.tsx";
import type { ComponentAuditDefinition, TestScenario } from "./types";

const TYPES = ["add", "create", "dlx", "exec", "install", "remove", "run"] as const;

const PackageManagersSandbox = (): JSX.Element => {
  const [type, setType] = createSignal<(typeof TYPES)[number]>("add");
  const [dev, setDev] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <For each={TYPES}>
          {(t) => (
            <button type="button" onClick={() => setType(t)}>
              type: {t}
            </button>
          )}
        </For>
        <button type="button" onClick={() => setDev((v) => !v)}>
          dev: {dev() ? "on" : "off"}
        </button>
      </div>
      <RLPackageManagers pkg="@rimelight/ui" type={type()} dev={dev()} />
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "default",
    title: "Default (add, all managers)",
    description: "pkg with default type add and all six managers listed.",
    render: () => <RLPackageManagers pkg="react" />,
  },
  {
    id: "types",
    title: "Every command type",
    description: "add, create, dlx, exec, install, remove, and run.",
    render: () => (
      <div class="flex flex-col gap-6">
        <For each={TYPES}>{(t) => <RLPackageManagers pkg="vite" type={t} />}</For>
      </div>
    ),
  },
  {
    id: "managers",
    title: "managers subset",
    description: "managers limits the tabs to the given list.",
    render: () => <RLPackageManagers pkg="zod" managers={["npm", "pnpm"]} />,
  },
  {
    id: "dev-args-comment-prefix",
    title: "dev, args, comment, prefix",
    description:
      "dev adds the dev flag. args append to the command. comment is rendered with {PKG} replaced. prefix prepends to the command.",
    render: () => (
      <RLPackageManagers
        pkg="typescript"
        type="add"
        dev
        args="--exact"
        comment="Adds {PKG} as a dev dependency"
        prefix="cd app &&"
      />
    ),
  },
  {
    id: "no-pkg",
    title: "No pkg",
    description: "Without pkg the command renders with no package name.",
    render: () => <RLPackageManagers type="install" managers={["bun"]} />,
  },
];

export const packageManagersAudit: ComponentAuditDefinition = {
  id: "package-managers",
  name: "Package Managers",
  category: "Utility",
  status: "Auditing",
  description:
    "Tabbed install command across npm, pnpm, yarn, deno, bun, and vp, with a copy button.",
  importPath: "@rimelight/ui/components/package-managers/RLPackageManagers.tsx",
  renderSandbox: () => <PackageManagersSandbox />,
  testScenarios,
};
