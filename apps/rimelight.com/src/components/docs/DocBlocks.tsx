import { type Component, For, lazy, Loading } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLErrorBoundary } from "@rimelight/ui/components/error-boundary/RLErrorBoundary.tsx";
import { BlockRenderer, type PublicEntry } from "@rimelight/cms/solid";
import { componentMeta as meta } from "@rimelight/ui/meta";
import { generateThemeCode } from "#docs/utils";
import ComponentShowcase from "#components/ComponentShowcase";
import { rimelightCustomBlocks } from "#components/blocks";

/**
 * Renders a doc's blocks. Two docs-specific extras on top of the normal block renderers:
 * `ComponentShowcaseBlock` renders a live RL component with prop toggles, and
 * `ApiDocumentationBlock` gets the component's extracted metadata (props / theme) injected.
 */

// Every RL component, for live showcases. Each one is its own lazy chunk, so a docs page only
// downloads the components it actually previews instead of all of them.
const componentLoaders: Record<string, () => Promise<any>> = import.meta.glob(
  "../../../../../packages/ui/src/components/*/RL*.tsx",
);
const componentRegistry: Record<string, Component<any>> = {};
for (const [p, load] of Object.entries(componentLoaders)) {
  const fileName = p.split("/").pop()?.replace(".tsx", "");
  if (!fileName) continue;
  componentRegistry[fileName] = lazy(() =>
    load().then((mod) => ({ default: mod.default ?? mod[fileName] })),
  );
}

const themeModules: Record<string, any> = import.meta.glob(
  "../../../../../packages/ui/src/components/*/*.theme.ts",
  { eager: true },
);
const themeRegistry: Record<string, any> = {};
for (const [p, mod] of Object.entries(themeModules)) {
  const match = p.match(/\/([\w-]+)\/\1\.theme\.ts$/);
  if (match?.[1]) {
    const themeFn = mod.default || Object.values(mod).find((v) => typeof v === "function");
    if (themeFn) themeRegistry[match[1]] = themeFn;
  }
}

function generateCombinationClasses(
  themeFn: any,
  propsConfig: Record<string, string[]>,
  defaultProps: Record<string, any>,
) {
  const keys = Object.keys(propsConfig);
  const values = keys.map((k) => propsConfig[k] || []);
  const result: Record<string, any> = {};
  let initialThemeClasses: Record<string, string> = {};
  try {
    initialThemeClasses = themeFn(defaultProps || {});
  } catch {}
  const cartesian = (arrays: string[][]): string[][] => {
    if (arrays.length === 0) return [[]];
    const [first, ...rest] = arrays;
    const restProduct = cartesian(rest);
    return (first ?? []).flatMap((val) => restProduct.map((combo) => [val, ...combo]));
  };
  for (const combo of cartesian(values)) {
    const props: Record<string, any> = {};
    keys.forEach((k, i) => (props[k] = combo[i]));
    try {
      result[keys.map((k) => `${k}:${props[k]}`).join("|")] = themeFn(props);
    } catch {}
  }
  return { combinationClasses: result, initialThemeClasses };
}

/** Blocks with ApiDocumentationBlock metadata filled in, at any depth (copies; never mutates). */
export function withDocsMeta(blocks: PublicEntry["blocks"]): PublicEntry["blocks"] {
  const all = meta as Record<string, any>;
  return blocks.map((block) => {
    const children = block.children ? { children: withDocsMeta(block.children) } : {};
    if (block.type !== "ApiDocumentationBlock") return { ...block, ...children };
    const compMeta = all[block.props["componentName"]];
    if (!compMeta) return { ...block, ...children };
    return {
      ...block,
      ...children,
      props: {
        ...block.props,
        meta: compMeta,
        ...(compMeta.theme
          ? { themeCode: generateThemeCode(block.props["componentName"], compMeta.theme) }
          : {}),
      },
    };
  });
}

/** One node of a showcase preview: a live RL component, or a static HTML chunk. Built at migration time. */
type PreviewNode =
  | { html: string }
  | { tag: string; props: Record<string, any>; children: PreviewNode[] };

function renderPreviewNode(node: PreviewNode): JSX.Element {
  if ("html" in node) return <span class="contents" innerHTML={node.html} />;
  const Comp = componentRegistry[node.tag];
  if (!Comp) return <span class="text-xs text-danger">Unknown component: {node.tag}</span>;
  return (
    <Loading fallback={<div class="h-24" />}>
      <Comp {...node.props}>
        {node.children.length ? (
          <For each={node.children}>{(c) => renderPreviewNode(c)}</For>
        ) : undefined}
      </Comp>
    </Loading>
  );
}

/** Live component preview with prop toggles (`ComponentShowcaseBlock`). */
const ShowcaseBlock: Component<{ block: PublicEntry["blocks"][number] }> = (props) => {
  const block = props.block as any;
  const preview = (): PreviewNode[] => block.props.preview ?? [];
  console.log(
    block.props.componentName,
    JSON.stringify(block.props.preview ?? "MISSING").slice(0, 200),
    Object.keys(block.props).join(","),
  );
  const compKey = (block.props.componentName || "")
    .replace(/^RL[AV]?(?=[A-Z])/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();
  const themeFn = themeRegistry[compKey];
  let showcase = {};
  if (themeFn && block.props.propsConfig && Object.keys(block.props.propsConfig).length) {
    try {
      const { combinationClasses, initialThemeClasses } = generateCombinationClasses(
        themeFn,
        block.props.propsConfig,
        block.props.defaultProps || {},
      );
      showcase = {
        combinationClasses,
        initialThemeClasses,
        themeSlots: Object.keys(initialThemeClasses).filter(
          (k) => k !== "class" && k !== "className",
        ),
      };
    } catch {}
  }
  return (
    <ComponentShowcase
      componentName={block.props.componentName}
      propsConfig={block.props.propsConfig}
      defaultProps={block.props.defaultProps}
      togglingPattern={block.props.togglingPattern}
      playground={block.props.playgroundUrl}
      {...showcase}
    >
      <RLErrorBoundary
        fallbackSlot={(err: unknown) => (
          <div class="text-sm text-danger">Preview failed to render: {String(err)}</div>
        )}
      >
        <For each={preview()}>{(node) => renderPreviewNode(node)}</For>
      </RLErrorBoundary>
    </ComponentShowcase>
  );
};

/** Renderer overrides for docs: site blocks + live showcases (applied at every depth). */
const DOCS_COMPONENTS = { ...rimelightCustomBlocks, ComponentShowcaseBlock: ShowcaseBlock };

export const DocBlocks: Component<{ blocks: PublicEntry["blocks"]; locale: string }> = (props) => (
  <For each={props.blocks}>
    {(block) => <BlockRenderer block={block} locale={props.locale} components={DOCS_COMPONENTS} />}
  </For>
);
