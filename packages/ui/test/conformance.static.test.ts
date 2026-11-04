import { afterAll, describe, expect, it } from "vite-plus/test";
import path from "node:path";
import * as ts from "typescript/ast";
import {
  attrNode,
  closeAst,
  isExported,
  listComponentFolders,
  listSourceFiles,
  localTypeDecls,
  nameText,
  parseFile,
  propsDecls,
  SRC_DIR,
  staticAttrString,
  type ComponentFolder,
  type PropsDecl,
  typeRefNames,
  UI_ROOT,
  walk,
  walkOwn,
} from "./utils/conformance-ast";

// Static conformance gate for local://ui-conventions.md. Every check runs on TypeScript syntax trees.
// Exception: rule 8 `aria*` and rule 13 kebab-case test identifier and folder NAMES (not source text).

/** Frozen by the conventions: the only components allowed to carry `@status stub`. */
const STUB_FROZEN = [
  "chat",
  "chat-message",
  "chat-messages",
  "chat-palette",
  "chat-prompt",
  "chat-prompt-submit",
  "chat-reasoning",
  "chat-shimmer",
  "chat-tool",
  "color-picker",
  "command-palette",
  "dock",
  "editor",
  "fieldset",
  "floating-action",
  "gallery",
  "knob",
  "listbox",
  "meter",
  "page-aside",
  "page-body",
  "page-header",
  "password",
  "phone-mockup",
  "pricing-plan",
  "pricing-table",
  "prose",
  "qr-code",
  "radio-group",
  "rating",
  "speed-dial",
  "spoiler",
  "tour",
  "user",
  "watermark",
  "window-mockup",
];
const SIZE_KEYS = ["xs", "sm", "md", "lg", "xl"];
const VARIANT_KEYS = ["solid", "outline", "soft", "subtle", "ghost", "link"];
const BANNED_PROP_NAMES = [
  "onClose",
  "dismissable",
  "ariaLabel",
  "leftSlot",
  "rightSlot",
  "prependSlot",
  "appendSlot",
  "beforeSlot",
  "afterSlot",
  "headlineSlot",
  "contentSlot",
  "close",
  "classes",
];
const ICON_PROP_NAMES = ["icon", "leadingIcon", "trailingIcon"];
const NATIVE_ONCHANGE = ["input", "textarea", "select", "checkbox", "switch", "radio-group"];
const I18N_ATTRS = ["aria-label", "title", "alt", "placeholder"];
const RESERVED_PROPS = ["children", "ui", "class", "as", "theme", "classes"];
const RESOLVER_FILE = path.join(SRC_DIR, "resolver.ts");

const components = listComponentFolders();
const rel = (file: string) => path.relative(UI_ROOT, file).replaceAll("\\", "/");

afterAll(closeAst);

/** Throws when a required file is absent, so a missing file fails instead of passing. */
function must(file: string | undefined, what: string): string {
  if (!file) throw new Error(`missing ${what}`);
  return file;
}

function containsIdentifier(node: ts.Node, name: string): boolean {
  let found = false;
  walk(node, (n) => {
    if (ts.isIdentifier(n) && n.text === name) found = true;
  });
  return found;
}

/** True when the props decl reaches InferThemeProps or BaseThemeProps directly or through local aliases. */
function derivesThemeProps(sf: ts.SourceFile, decl: PropsDecl): boolean {
  const locals = localTypeDecls(sf);
  const seen = new Set<string>();
  const check = (node: ts.Node): boolean =>
    typeRefNames(node).some((name) => {
      if (name === "InferThemeProps" || name === "BaseThemeProps") return true;
      const target = locals.get(name);
      if (!target || seen.has(name)) return false;
      seen.add(name);
      return check(target);
    });
  return check(decl);
}

type ComponentFn = ts.ArrowFunction | ts.FunctionExpression | ts.FunctionDeclaration;

function exportedComponent(sf: ts.SourceFile, name: string): ComponentFn | undefined {
  for (const s of sf.statements) {
    if (ts.isFunctionDeclaration(s) && nameText(s.name) === name && isExported(s)) return s;
    if (!ts.isVariableStatement(s) || !isExported(s)) continue;
    for (const d of s.declarationList.declarations) {
      const init = d.initializer;
      if (
        nameText(d.name) === name &&
        init &&
        (ts.isArrowFunction(init) || ts.isFunctionExpression(init))
      )
        return init;
    }
  }
  return undefined;
}

function returnedExpressions(fn: ComponentFn): ts.Node[] {
  const body = fn.body;
  if (!body) return [];
  if (!ts.isBlock(body)) return [body];
  const out: ts.Node[] = [];
  walkOwn(body, (n) => {
    if (ts.isReturnStatement(n) && n.expression) out.push(n.expression);
  });
  return out;
}

const isComponentTag = (el: ts.JsxOpeningLikeElement) =>
  ts.isIdentifier(el.tagName) && /^[A-Z]/.test(el.tagName.text);

/** Collects JSX openers in the subtree. Capitalized wrappers are entered; intrinsic tags are not. */
function jsxOpeners(node: ts.Node, out: ts.JsxOpeningLikeElement[]): void {
  if (ts.isJsxElement(node)) {
    out.push(node.openingElement);
    if (isComponentTag(node.openingElement)) node.forEachChild((c) => jsxOpeners(c, out));
    return;
  }
  if (ts.isJsxSelfClosingElement(node)) {
    out.push(node);
    return;
  }
  node.forEachChild((c) => jsxOpeners(c, out));
}

function rootCandidates(sf: ts.SourceFile, pascal: string): ts.JsxOpeningLikeElement[] | undefined {
  const fn = exportedComponent(sf, `RL${pascal}`);
  if (!fn) return undefined;
  const out: ts.JsxOpeningLikeElement[] = [];
  for (const expr of returnedExpressions(fn)) jsxOpeners(expr, out);
  return out;
}

function slotsListedInSetup(sf: ts.SourceFile): Set<string> {
  const listed = new Set<string>();
  walk(sf, (n) => {
    if (!ts.isCallExpression(n)) return;
    const callee = n.expression;
    const isSetup =
      (ts.isIdentifier(callee) && callee.text === "setup") ||
      (ts.isPropertyAccessExpression(callee) && callee.name.text === "setup");
    if (!isSetup) return;
    for (const opts of n.arguments) {
      if (!ts.isObjectLiteralExpression(opts)) continue;
      for (const prop of opts.properties) {
        if (!ts.isPropertyAssignment(prop) || nameText(prop.name) !== "slots") continue;
        let initializer = prop.initializer;
        while (ts.isAsExpression(initializer) || ts.isParenthesizedExpression(initializer)) {
          initializer = initializer.expression;
        }
        if (!ts.isArrayLiteralExpression(initializer)) continue;
        for (const el of initializer.elements)
          if (ts.isStringLiteralLikeNode(el)) listed.add(el.text);
      }
    }
  });
  return listed;
}

function propertyObject(
  obj: ts.ObjectLiteralExpression,
  key: string,
): ts.ObjectLiteralExpression | undefined {
  for (const prop of obj.properties) {
    if (
      ts.isPropertyAssignment(prop) &&
      nameText(prop.name) === key &&
      ts.isObjectLiteralExpression(prop.initializer)
    ) {
      return prop.initializer;
    }
  }
  return undefined;
}

function keysOf(obj: ts.ObjectLiteralExpression | undefined): string[] {
  return (obj?.properties ?? []).flatMap((p) =>
    ts.isPropertyAssignment(p) ? [nameText(p.name)] : [],
  );
}

/** Variant keys from the `defineTheme(name, { variants: { size, variant } })` literal. */
function themeVariantKeys(sf: ts.SourceFile): { size: string[]; variant: string[] } | undefined {
  let theme: ts.ObjectLiteralExpression | undefined;
  walk(sf, (n) => {
    if (
      !ts.isCallExpression(n) ||
      !ts.isIdentifier(n.expression) ||
      n.expression.text !== "defineTheme"
    )
      return;
    const arg = n.arguments[1];
    if (arg && ts.isObjectLiteralExpression(arg)) theme = arg;
  });
  if (!theme) return undefined;
  const variants = propertyObject(theme, "variants");
  return {
    size: keysOf(variants && propertyObject(variants, "size")),
    variant: keysOf(variants && propertyObject(variants, "variant")),
  };
}

function jsDocComment(tag: ts.JSDocTag): string {
  return ts.getTextOfJSDocComment(tag.comment) ?? "";
}

function isStubProps(decl: PropsDecl): boolean {
  return ts
    .getJSDocTags(decl)
    .some((tag) => tag.tagName.text === "status" && jsDocComment(tag).trim() === "stub");
}

/** Names of every property signature under a props decl, including nested type literals. */
function memberNames(decl: PropsDecl): string[] {
  const names: string[] = [];
  walk(decl, (n) => {
    if (ts.isPropertySignatureDeclaration(n)) names.push(nameText(n.name));
  });
  return names;
}

function isJsxElementType(type: ts.TypeNode | undefined): boolean {
  return type !== undefined && typeRefNames(type).includes("JSX.Element");
}

function isReservedRead(name: string): boolean {
  return RESERVED_PROPS.includes(name) || name.endsWith("Slot");
}

describe("global rules", () => {
  it("rule 6: createUniqueId appears only in src/resolver.ts", () => {
    const offenders = listSourceFiles(SRC_DIR)
      .filter((file) => path.resolve(file) !== RESOLVER_FILE)
      .filter((file) => containsIdentifier(parseFile(file), "createUniqueId"))
      .map(rel);
    expect(offenders).toEqual([]);
  });

  it("rule 12: the @status stub set equals the frozen list", () => {
    const actual = components
      .filter((c) => c.typesFile && propsDecls(parseFile(c.typesFile)).some(isStubProps))
      .map((c) => c.folder);
    const missing = STUB_FROZEN.filter((name) => !actual.includes(name));
    const extra = actual.filter((name) => !STUB_FROZEN.includes(name));
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });
});

describe.each(components)("component $folder", (c: ComponentFolder) => {
  const folder = c.folder;
  const typesSource = () => parseFile(must(c.typesFile, `${folder}.types.ts`));
  const rlSource = () => parseFile(must(c.rlFile, `RL${c.pascal}.tsx`));

  it("rule 13: has RL, types and theme files, folder is kebab-case", () => {
    expect(/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(folder)).toBe(true);
    expect({
      rl: c.rlFile !== undefined,
      types: c.typesFile !== undefined,
      theme: c.themeFile !== undefined,
    }).toEqual({ rl: true, types: true, theme: true });
  });

  it("rule 1: props types have no any and no index signatures", () => {
    const offenders: string[] = [];
    const sources = [c.typesFile ? typesSource() : undefined, c.rlFile ? rlSource() : undefined];
    for (const sf of sources) {
      if (!sf) continue;
      for (const decl of propsDecls(sf)) {
        walk(decl, (n) => {
          if (n.kind === ts.SyntaxKind.AnyKeyword) offenders.push(`${decl.name.text}: any`);
          if (ts.isIndexSignatureDeclaration(n))
            offenders.push(`${decl.name.text}: index signature`);
        });
      }
    }
    expect(offenders).toEqual([]);
  });

  it("rule 2: props types include InferThemeProps or BaseThemeProps", () => {
    const sf = typesSource();
    const missing = propsDecls(sf)
      .filter((decl) => !derivesThemeProps(sf, decl))
      .map((decl) => decl.name.text);
    expect(missing).toEqual([]);
  });

  it("rule 3: RL component reads no reserved or *Slot props", () => {
    const offenders: string[] = [];
    walk(rlSource(), (n) => {
      if (
        ts.isPropertyAccessExpression(n) &&
        ts.isIdentifier(n.expression) &&
        n.expression.text === "props"
      ) {
        if (isReservedRead(n.name.text)) offenders.push(`props.${n.name.text}`);
      }
      if (
        ts.isElementAccessExpression(n) &&
        ts.isIdentifier(n.expression) &&
        n.expression.text === "props"
      ) {
        if (
          ts.isStringLiteralLikeNode(n.argumentExpression) &&
          isReservedRead(n.argumentExpression.text)
        ) {
          offenders.push(`props[${n.argumentExpression.text}]`);
        }
      }
      if (
        ts.isVariableDeclaration(n) &&
        ts.isObjectBindingPattern(n.name) &&
        n.initializer &&
        ts.isIdentifier(n.initializer) &&
        n.initializer.text === "props"
      ) {
        for (const el of n.name.elements) {
          const name = nameText(el.propertyName ?? el.name);
          if (isReservedRead(name)) offenders.push(`destructured ${name}`);
        }
      }
    });
    expect(offenders).toEqual([]);
  });

  it("rule 4: root has data-slot=root and data-theme, or forwards theme to a child", () => {
    const candidates = rootCandidates(rlSource(), c.pascal);
    expect(candidates, `exported RL${c.pascal} with a JSX root`).toBeDefined();
    const ok = (candidates ?? []).some((el) => {
      const slotRoot = staticAttrString(attrNode(el, "data-slot")) === "root";
      return (
        (slotRoot && attrNode(el, "data-theme") !== undefined) ||
        attrNode(el, "theme") !== undefined
      );
    });
    expect(ok).toBe(true);
  });

  it("rule 5: as is honored through Tag or forwarded to a child", () => {
    let ok = false;
    walk(rlSource(), (n) => {
      if (!ts.isJsxOpeningElement(n) && !ts.isJsxSelfClosingElement(n)) return;
      if (ts.isIdentifier(n.tagName) && n.tagName.text === "Tag") ok = true;
      if (attrNode(n, "as")) ok = true;
    });
    expect(ok).toBe(true);
  });

  it("rule 6: no classes alias passed as ui", () => {
    const offenders: string[] = [];
    walk(rlSource(), (n) => {
      const isUiSlot =
        (ts.isJsxAttribute(n) || ts.isPropertyAssignment(n)) && nameText(n.name) === "ui";
      if (isUiSlot && n.initializer && containsIdentifier(n.initializer, "classes"))
        offenders.push("ui={classes}");
    });
    expect(offenders).toEqual([]);
  });

  it("rule 7: theme variant keys use the canonical sets", () => {
    const keys = themeVariantKeys(parseFile(must(c.themeFile, `${folder}.theme.ts`)));
    expect(keys, "defineTheme(name, { variants }) object literal").toBeDefined();
    expect((keys?.size ?? []).filter((k) => !SIZE_KEYS.includes(k))).toEqual([]);
    expect((keys?.variant ?? []).filter((k) => !VARIANT_KEYS.includes(k))).toEqual([]);
  });

  it("rule 8: no banned prop names, aria-camel props, or JSX-typed icon props in types", () => {
    const offenders: string[] = [];
    walk(typesSource(), (n) => {
      if (!ts.isPropertySignatureDeclaration(n)) return;
      const name = nameText(n.name);
      if (BANNED_PROP_NAMES.includes(name) || /^aria[A-Z]/.test(name)) offenders.push(name);
      if (ICON_PROP_NAMES.includes(name) && isJsxElementType(n.type))
        offenders.push(`${name}: JSX.Element`);
    });
    expect(offenders).toEqual([]);
  });

  it("rule 9: onChange only on native-input components", () => {
    const offenders: string[] = [];
    if (!NATIVE_ONCHANGE.includes(folder)) {
      walk(typesSource(), (n) => {
        if (ts.isPropertySignatureDeclaration(n) && nameText(n.name) === "onChange")
          offenders.push("onChange");
      });
    }
    expect(offenders).toEqual([]);
  });

  it("rule 10: no hard-coded English in aria-label, title, alt, placeholder", () => {
    const offenders: string[] = [];
    walk(rlSource(), (n) => {
      if (!ts.isJsxAttribute(n) || !I18N_ATTRS.includes(nameText(n.name))) return;
      const value = staticAttrString(n);
      // Text check on a string literal's value: "a space and letters", per the conventions.
      if (value !== undefined && value.includes(" ") && /[A-Za-z]/.test(value)) {
        offenders.push(`${nameText(n.name)}="${value}"`);
      }
    });
    expect(offenders).toEqual([]);
  });

  it("rule 11: every declared *Slot prop is listed in setup({ slots })", () => {
    const declared = propsDecls(typesSource())
      .flatMap(memberNames)
      .filter((name) => name.endsWith("Slot"));
    const listed = slotsListedInSetup(rlSource());
    const missing = [...new Set(declared)].filter((name) => !listed.has(name));
    expect(missing).toEqual([]);
  });
});
