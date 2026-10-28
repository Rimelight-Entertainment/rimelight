import { type Component, For, lazy, Loading } from "solid-js";
import { BlockRenderer, type PublicEntry } from "@rimelight/cms/solid";
import meta from "virtual:rimelight-ui-docs-meta";
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

function parseComponentTag(html: string): { tag: string; props: Record<string, any> } | null {
  const parseTag = (tagHtml: string) => {
    const match = tagHtml.match(/^<(\w+)([^>]*?)\/?>/);
    if (!match) return null;
    const props: Record<string, any> = {};
    const attrRegex = /(\w[\w-]*)(?:=(?:"([^"]*)"|{([^}]*)}|'([^']*)'))?/g;
    let m;
    while ((m = attrRegex.exec((match[2] || "").trim())) !== null) {
      const key = m[1]!;
      if (m[2] !== undefined) props[key] = m[2];
      else if (m[3] !== undefined) {
        const val = m[3].trim();
        props[key] =
          val === "true"
            ? true
            : val === "false"
              ? false
              : /^\d+$/.test(val)
                ? Number(val)
                : val.replace(/^["']|["']$/g, "");
      } else props[key] = true;
    }
    // Older docs use framework-prefixed names (RLAButton / RLVButton); the component is RLButton.
    return { tag: match[1]!.replace(/^RL[AV](?=[A-Z])/, "RL"), props };
  };
  const trimmed = html.trim();
  const componentMatch = trimmed.match(/<(RL\w+)[^>]*\/?>/);
  return parseTag(componentMatch ? componentMatch[0] : trimmed);
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

/** Live component preview with prop toggles (`ComponentShowcaseBlock`). */
const ShowcaseBlock: Component<{ block: PublicEntry["blocks"][number] }> = (props) => {
  const block = props.block as any;
  const parsed = parseComponentTag(block.props.previewHtml || "");
  const Comp = parsed ? componentRegistry[parsed.tag] : null;
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
      {Comp ? (
        <Loading fallback={<div class="h-24" />}>
          <Comp {...(parsed?.props ?? {})} />
        </Loading>
      ) : (
        <div innerHTML={block.props.previewHtml || ""} />
      )}
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
