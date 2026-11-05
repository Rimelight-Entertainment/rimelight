import { afterAll, describe, expect, it } from "vite-plus/test";
import path from "node:path";
import * as ts from "typescript/ast";
import {
  attrNode,
  closeAst,
  COMPONENTS_DIR,
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

// Static conformance gate for the UI component conventions. Every check runs on TypeScript syntax trees.
// Exception: rule 13 checks kebab-case folder NAMES from the filesystem, not source text. Rule 8 checks AST prop names: aria props are kebab-case (`aria-label`), never camelCase `aria*`.

/** Frozen by the conventions: the only components allowed to carry `@status stub`. */
const STUB_FROZEN = [
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
  "rating",
  "speed-dial",
  "spoiler",
  "tour",
  "user",
  "watermark",
  "window-mockup",
];

/** Internal (non-public) props types that are not theme surfaces; exempt from rule 2. */
const RULE2_INTERNAL_PROPS = ["ContextMenuLayerProps", "SidebarItemListProps"];
const SIZE_KEYS = ["xs", "sm", "md", "lg", "xl"];
const VARIANT_KEYS = ["solid", "outline", "soft", "subtle", "ghost", "link", "unstyled"];
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

const COMPONENT_FILES = listSourceFiles(COMPONENTS_DIR);
const PRESET_FILE = path.join(SRC_DIR, "preset.ts");
const PALETTES_FILE = path.join(SRC_DIR, "constants", "palettes.ts");
const componentSourceFiles = (): string[] => COMPONENT_FILES.filter((file) => /\.tsx?$/.test(file));
const rlFiles = (): string[] =>
  COMPONENT_FILES.filter((file) => /^RL.*\.tsx$/.test(path.basename(file)));
const themeFiles = (): string[] => COMPONENT_FILES.filter((file) => file.endsWith(".theme.ts"));
const typesFiles = (): string[] => COMPONENT_FILES.filter((file) => file.endsWith(".types.ts"));

const NATIVE_FORM_TAGS = ["input", "textarea", "select"];
const RAW_COLOR_NAMES: Record<string, true> = {
  slate: true,
  gray: true,
  zinc: true,
  red: true,
  orange: true,
  amber: true,
  yellow: true,
  lime: true,
  green: true,
  emerald: true,
  teal: true,
  cyan: true,
  sky: true,
  blue: true,
  indigo: true,
  violet: true,
  purple: true,
  fuchsia: true,
  pink: true,
  rose: true,
  black: true,
  white: true,
};
const NUMBERED_STEP = /-(?:50|100|200|300|400|500|600|700|800|900|950)$/;
const COLOR_UTILITY = /^(?:bg|text|border|ring)-/;
const COLOR_VALUE = /^(?:bg|text|border|ring)-(.+)$/;
/** Values that are sizes, keywords, or widths rather than colors. */
const NON_COLOR_VALUE =
  /^(?:\d|(?:xs|sm|base|lg|xl|left|center|right|top|bottom|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|uppercase|lowercase|capitalize|fixed|local|scroll|cover|contain|none|solid|dashed|dotted|double|hidden|collapse|separate|inset|auto)$|(?:clip|repeat|no-repeat|gradient|linear|radial|conic|origin|blend|spacing|opacity|shadow)(?:-|$)|offset-\d|[xytrblse](?:-|$))/;
const COLOR_LITERAL =
  /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![0-9a-zA-Z_-])|\b(?:rgba?|hsla?)\(/i;
const IMPORTANT_MODIFIER = /(?:^|[\s:])!(?=[a-z[-])/;
const DATA_NAME = /^data-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ARIA_STATE_DATA = [
  "data-expanded",
  "data-selected",
  "data-checked",
  "data-invalid",
  "data-pressed",
  "data-busy",
];
const REPLACED_PLACEMENT_CALLBACK_NAMES = [
  "direction",
  "toggleSide",
  "badgePosition",
  "onPageChange",
];
const BANNED_SLOT_PROPS = ["closeButton", "leftSlot", "rightSlot", "textSlot"];
const RAW_ELEMENT_OWNERS: Record<string, { folder: string; file: string }[]> = {
  button: [{ folder: "button", file: "RLButton.tsx" }],
  a: [
    { folder: "link", file: "RLLink.tsx" },
    { folder: "button", file: "RLButton.tsx" },
  ],
  label: [{ folder: "label", file: "RLLabel.tsx" }],
  img: [
    { folder: "image", file: "RLImage.tsx" },
    { folder: "avatar", file: "RLAvatar.tsx" },
    { folder: "logo", file: "RLLogo.tsx" },
  ],
};

/** 1-based line where a node starts. */
function lineOf(sf: ts.SourceFile, node: ts.Node): number {
  return sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;
}

/** `file:line` of every node where `hit` is true; each line is reported once. */
function findIn(
  files: string[],
  hit: (node: ts.Node, sf: ts.SourceFile, file: string) => boolean,
): string[] {
  const offenders = new Set<string>();
  for (const file of files) {
    const sf = parseFile(file);
    walk(sf, (node) => {
      if (hit(node, sf, file)) offenders.add(`${rel(file)}:${lineOf(sf, node)}`);
    });
  }
  return [...offenders];
}

function unwrapExpr(node: ts.Node): ts.Node {
  let current = node;
  while (ts.isAsExpression(current) || ts.isParenthesizedExpression(current)) {
    current = current.expression;
  }
  return current;
}

/** Value of a JSX attribute: the expression inside `{...}`, or the literal itself. */
function jsxValue(init: ts.Node | undefined): ts.Node | undefined {
  if (!init) return undefined;
  return ts.isJsxExpression(init) ? init.expression : init;
}

function isTextNode(node: ts.Node | undefined): boolean {
  return node !== undefined && (ts.isStringLiteralLikeNode(node) || ts.isTemplateExpression(node));
}

/** Text of a string, template piece, or JSX text node. */
function literalText(node: ts.Node): string | undefined {
  if (
    ts.isStringLiteralLikeNode(node) ||
    ts.isTemplateHead(node) ||
    ts.isTemplateMiddle(node) ||
    ts.isTemplateTail(node) ||
    ts.isJsxText(node)
  ) {
    return node.text;
  }
  return undefined;
}

function calleeName(call: ts.CallExpression): string {
  const callee = call.expression;
  if (ts.isIdentifier(callee)) return callee.text;
  if (ts.isPropertyAccessExpression(callee)) return callee.name.text;
  return "";
}

function containsJsx(node: ts.Node): boolean {
  let found = false;
  walk(node, (n) => {
    if (ts.isJsxElement(n) || ts.isJsxSelfClosingElement(n) || ts.isJsxFragment(n)) found = true;
  });
  return found;
}

function hasNativeFormControl(sf: ts.SourceFile): boolean {
  let found = false;
  walk(sf, (n) => {
    if (
      (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) &&
      ts.isIdentifier(n.tagName) &&
      NATIVE_FORM_TAGS.includes(n.tagName.text)
    ) {
      found = true;
    }
  });
  return found;
}

/** Names of the top-level object literal exported as `exportName`. */
function exportedObjectKeys(file: string, exportName: string): string[] {
  for (const statement of parseFile(file).statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const decl of statement.declarationList.declarations) {
      if (!ts.isIdentifier(decl.name) || decl.name.text !== exportName || !decl.initializer)
        continue;
      const init = unwrapExpr(decl.initializer);
      if (!ts.isObjectLiteralExpression(init)) {
        throw new Error(`${exportName} is not an object literal in ${rel(file)}`);
      }
      return init.properties.filter(ts.isPropertyAssignment).map((prop) => nameText(prop.name));
    }
  }
  throw new Error(`missing export ${exportName} in ${rel(file)}`);
}

/** Base of each class token: variant prefix, `[...]` value, and `/opacity` removed. */
function utilityBases(text: string): string[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (token) =>
        token
          .slice(token.lastIndexOf(":") + 1)
          .replace(/\[[^\]]*\]/g, "")
          .split("/")[0] ?? "",
    );
}

function isRawColorOrStep(base: string): boolean {
  if (base.split("-").some((segment) => RAW_COLOR_NAMES[segment] === true)) return true;
  return COLOR_UTILITY.test(base) && NUMBERED_STEP.test(base);
}

function isUnknownColorName(base: string, allowed: Set<string>): boolean {
  const value = COLOR_VALUE.exec(base)?.[1];
  if (value === undefined || NON_COLOR_VALUE.test(value)) return false;
  return !allowed.has(value.replace(/-\d+$/, ""));
}

/** True when a data-* attribute name or literal value breaks the data rules. */
function isBadDataAttr(name: string, value: ts.Node | undefined): boolean {
  if (!DATA_NAME.test(name) || ARIA_STATE_DATA.includes(name)) return true;
  if (value === undefined) return false;
  if (ts.isStringLiteralLikeNode(value)) return value.text === "true" || value.text === "false";
  return value.kind === ts.SyntaxKind.TrueKeyword || value.kind === ts.SyntaxKind.FalseKeyword;
}

describe("global rules", () => {
  it("rule 6: createUniqueId appears only in src/resolver.ts", () => {
    const offenders = listSourceFiles(SRC_DIR)
      .filter((file) => path.resolve(file) !== RESOLVER_FILE)
      .filter((file) => containsIdentifier(parseFile(file), "createUniqueId"))
      .map(rel);
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 12: the @status stub set equals the frozen list", () => {
    const actual = components
      .filter((c) => c.typesFile && propsDecls(parseFile(c.typesFile)).some(isStubProps))
      .map((c) => c.folder);
    const missing = STUB_FROZEN.filter((name) => !actual.includes(name));
    const extra = actual.filter((name) => !STUB_FROZEN.includes(name));
    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });

  it("rule 14: RL files declare no types or interfaces", () => {
    const offenders = findIn(
      rlFiles(),
      (n) => ts.isTypeAliasDeclaration(n) || ts.isInterfaceDeclaration(n),
    );
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 15: class names come from the theme; no cx() and no string class values", () => {
    const CLASS_PROPS = ["class", "className", "classList"];
    const offenders = findIn(rlFiles(), (n) => {
      if (ts.isCallExpression(n)) return calleeName(n) === "cx";
      if (ts.isJsxAttribute(n) && ts.isIdentifier(n.name)) {
        return CLASS_PROPS.includes(n.name.text) && isTextNode(jsxValue(n.initializer));
      }
      if (ts.isPropertyAssignment(n))
        return CLASS_PROPS.includes(nameText(n.name)) && isTextNode(n.initializer);
      if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name)) {
        return CLASS_PROPS.includes(n.name.text) && isTextNode(n.initializer);
      }
      if (
        ts.isBinaryExpression(n) &&
        n.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        ts.isPropertyAccessExpression(n.left)
      ) {
        return CLASS_PROPS.includes(n.left.name.text) && isTextNode(n.right);
      }
      return false;
    });
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 16: no JSX inside ternary branches, && operands, or map callbacks", () => {
    const offenders = findIn(rlFiles(), (n) => {
      if (ts.isConditionalExpression(n)) return containsJsx(n.whenTrue) || containsJsx(n.whenFalse);
      if (
        ts.isBinaryExpression(n) &&
        n.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
      ) {
        return containsJsx(n.right);
      }
      if (ts.isCallExpression(n) && calleeName(n) === "map")
        return n.arguments.some((arg) => containsJsx(arg));
      return false;
    });
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 17: button, a, label, img appear only inside their own RL component", () => {
    const offenders = findIn(componentSourceFiles(), (n, _sf, file) => {
      if (!ts.isJsxOpeningElement(n) && !ts.isJsxSelfClosingElement(n)) return false;
      if (!ts.isIdentifier(n.tagName)) return false;
      const owners = RAW_ELEMENT_OWNERS[n.tagName.text];
      if (!owners) return false;
      const ownFile = owners.some(
        (owner) =>
          path.basename(file) === owner.file && path.basename(path.dirname(file)) === owner.folder,
      );
      return !ownFile;
    });
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 18: style is an object literal whose keys are all --custom properties", () => {
    const offenders = findIn(componentSourceFiles(), (n) => {
      if (!ts.isJsxAttribute(n) || !ts.isIdentifier(n.name) || n.name.text !== "style")
        return false;
      const value = jsxValue(n.initializer);
      if (value === undefined || !ts.isObjectLiteralExpression(value)) return true;
      return !value.properties.every(
        (prop) => ts.isPropertyAssignment(prop) && nameText(prop.name).startsWith("--"),
      );
    });
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 19: no imperative classList mutation", () => {
    const MUTATORS = ["add", "remove", "toggle", "replace"];
    const offenders = findIn(
      componentSourceFiles(),
      (n) =>
        ts.isPropertyAccessExpression(n) &&
        MUTATORS.includes(n.name.text) &&
        ts.isPropertyAccessExpression(n.expression) &&
        n.expression.name.text === "classList",
    );
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 20: *Theme(...) calls in RL files run only inside createMemo", () => {
    const offenders: string[] = [];
    for (const file of rlFiles()) {
      const sf = parseFile(file);
      const visit = (node: ts.Node, inMemo: boolean): void => {
        if (ts.isCallExpression(node) && !inMemo && calleeName(node).endsWith("Theme")) {
          offenders.push(`${rel(file)}:${lineOf(sf, node)}`);
        }
        const isMemo = ts.isCallExpression(node) && calleeName(node) === "createMemo";
        node.forEachChild((child) => {
          const isMemoArg =
            isMemo && ts.isCallExpression(node) && node.arguments.some((arg) => arg === child);
          visit(child, inMemo || isMemoArg);
        });
      };
      visit(sf, false);
    }
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 21: no non-null assertions in RL files", () => {
    const offenders = findIn(rlFiles(), (n) => ts.isNonNullExpression(n));
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 22: no JSX attribute set to undefined", () => {
    const offenders = findIn(rlFiles(), (n) => {
      if (!ts.isJsxAttribute(n)) return false;
      const value = jsxValue(n.initializer);
      return value !== undefined && ts.isIdentifier(value) && value.text === "undefined";
    });
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 23: @status stub appears only in *.types.ts", () => {
    const offenders = findIn(
      componentSourceFiles().filter((file) => !file.endsWith(".types.ts")),
      (n) =>
        ts
          .getJSDocTags(n)
          .some((tag) => tag.tagName.text === "status" && jsDocComment(tag).trim() === "stub"),
    );
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 24: no hex, rgb, or hsl literals in RL files or theme files", () => {
    const offenders = findIn([...rlFiles(), ...themeFiles()], (n) => {
      const text = literalText(n);
      return text !== undefined && COLOR_LITERAL.test(text);
    });
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 25: theme utilities use no raw Tailwind color names and no numbered palette steps", () => {
    const offenders = findIn(themeFiles(), (n) => {
      const text = literalText(n);
      return text !== undefined && utilityBases(text).some(isRawColorOrStep);
    });
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 26: theme color utilities name an intent, a palette, or an allowed token", () => {
    const allowed = new Set([
      ...exportedObjectKeys(PRESET_FILE, "INTENTS"),
      ...exportedObjectKeys(PALETTES_FILE, "PALETTES"),
      "scrim",
      "on-scrim",
      "transparent",
      "current",
    ]);
    const offenders = findIn(themeFiles(), (n) => {
      const text = literalText(n);
      return (
        text !== undefined && utilityBases(text).some((base) => isUnknownColorName(base, allowed))
      );
    });
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 39: theme class strings use no ! important modifier", () => {
    const offenders = findIn(themeFiles(), (n) => {
      const text = literalText(n);
      return text !== undefined && IMPORTANT_MODIFIER.test(text);
    });
    expect(offenders).toEqual([]);
  }, 60_000);

  it('rule 27: data-* attributes are kebab-case, not ARIA state duplicates, and never "true"/"false"', () => {
    const offenders = findIn(rlFiles(), (n) => {
      if (ts.isJsxAttribute(n) && ts.isIdentifier(n.name) && n.name.text.startsWith("data-")) {
        return isBadDataAttr(n.name.text, jsxValue(n.initializer));
      }
      if (ts.isPropertyAssignment(n) && nameText(n.name).startsWith("data-")) {
        return isBadDataAttr(nameText(n.name), n.initializer);
      }
      return false;
    });
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 28: no banned slot names (content, closeButton, leftSlot, rightSlot, textSlot, OverlaySlot)", () => {
    const offenders = findIn(componentSourceFiles(), (n) => {
      if (ts.isIdentifier(n) && n.text === "OverlaySlot") return true;
      if (ts.isPropertySignatureDeclaration(n) || ts.isPropertyAssignment(n)) {
        return BANNED_SLOT_PROPS.includes(nameText(n.name));
      }
      if (ts.isShorthandPropertyAssignment(n))
        return ts.isIdentifier(n.name) && BANNED_SLOT_PROPS.includes(n.name.text);
      if (ts.isJsxAttribute(n))
        return ts.isIdentifier(n.name) && BANNED_SLOT_PROPS.includes(n.name.text);
      if (
        ts.isPropertyAccessExpression(n) &&
        ts.isIdentifier(n.expression) &&
        n.expression.text === "props"
      ) {
        if (n.name.text === "content") return true;
      }
      if (ts.isPropertyAccessExpression(n)) return BANNED_SLOT_PROPS.includes(n.name.text);
      if (ts.isBindingElement(n)) {
        const key = n.propertyName ?? n.name;
        return key !== undefined && ts.isIdentifier(key) && BANNED_SLOT_PROPS.includes(key.text);
      }
      if (
        (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) &&
        ts.isIdentifier(n.tagName) &&
        /^[A-Z]/.test(n.tagName.text)
      ) {
        return n.attributes.properties.some(
          (attr) =>
            ts.isJsxAttribute(attr) && ts.isIdentifier(attr.name) && attr.name.text === "content",
        );
      }
      return false;
    });
    for (const file of typesFiles()) {
      const sf = parseFile(file);
      for (const decl of propsDecls(sf)) {
        walk(decl, (n) => {
          if (ts.isPropertySignatureDeclaration(n) && nameText(n.name) === "content") {
            offenders.push(`${rel(file)}:${lineOf(sf, n)}`);
          }
        });
      }
    }
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 30: no replaced placement or callback names; onChange only on native form-control components", () => {
    const formControls = new Set(
      components
        .filter((c) => c.rlFile !== undefined && hasNativeFormControl(parseFile(c.rlFile)))
        .map((c) => c.folder),
    );
    const offenders = findIn(typesFiles(), (n, _sf, file) => {
      if (!ts.isPropertySignatureDeclaration(n)) return false;
      const name = nameText(n.name);
      if (REPLACED_PLACEMENT_CALLBACK_NAMES.includes(name)) return true;
      return name === "onChange" && !formControls.has(path.basename(path.dirname(file)));
    });
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 31: slots go through setup() with Slot-suffixed names; no direct slot( calls", () => {
    const exempt = new Set([path.resolve(RESOLVER_FILE), path.resolve(SRC_DIR, "slot.ts")]);
    const directCalls = findIn(
      listSourceFiles(SRC_DIR).filter((file) => !exempt.has(path.resolve(file))),
      (n) =>
        ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "slot",
    );
    const badSlotKeys: string[] = [];
    for (const file of componentSourceFiles()) {
      const sf = parseFile(file);
      walk(sf, (n) => {
        if (!ts.isCallExpression(n) || calleeName(n) !== "setup") return;
        const options = n.arguments[1];
        if (!options || !ts.isObjectLiteralExpression(options)) return;
        const slotsProp = options.properties.find(
          (prop) => ts.isPropertyAssignment(prop) && nameText(prop.name) === "slots",
        );
        if (!slotsProp || !ts.isPropertyAssignment(slotsProp)) return;
        const list = unwrapExpr(slotsProp.initializer);
        if (!ts.isArrayLiteralExpression(list)) {
          badSlotKeys.push(`${rel(file)}:${lineOf(sf, slotsProp)}`);
          return;
        }
        for (const element of list.elements) {
          const key = ts.isStringLiteralLikeNode(element) ? element.text : undefined;
          if (key === undefined || !key.endsWith("Slot"))
            badSlotKeys.push(`${rel(file)}:${lineOf(sf, element)}`);
        }
      });
    }
    expect([...directCalls, ...badSlotKeys]).toEqual([]);
  }, 60_000);

  it("rule 32: no raw .map() inside JSX expressions; lists use For or Index", () => {
    const offenders = findIn(rlFiles(), (n) => {
      if (!ts.isJsxExpression(n) || !n.expression) return false;
      let found = false;
      walk(n.expression, (m) => {
        if (ts.isCallExpression(m) && calleeName(m) === "map") found = true;
      });
      return found;
    });
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 33: no `as any` casts in component source", () => {
    const offenders = findIn(
      componentSourceFiles(),
      (n) => ts.isAsExpression(n) && n.type.kind === ts.SyntaxKind.AnyKeyword,
    );
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 34: no innerHTML or dangerouslySetInnerHTML", () => {
    const offenders = findIn(
      componentSourceFiles(),
      (n) =>
        (ts.isJsxAttribute(n) && /innerHTML/i.test(nameText(n.name))) ||
        (ts.isPropertyAccessExpression(n) && n.name.text === "innerHTML"),
    );
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 35: no <Dynamic> or createComponent(props.as); polymorphic tags use dynamic()", () => {
    const offenders = findIn(componentSourceFiles(), (n) => {
      if (
        (ts.isJsxOpeningElement(n) || ts.isJsxSelfClosingElement(n)) &&
        ts.isIdentifier(n.tagName) &&
        n.tagName.text === "Dynamic"
      )
        return true;
      if (ts.isCallExpression(n) && calleeName(n) === "createComponent") {
        const first = n.arguments[0];
        return !!first && ts.isPropertyAccessExpression(first) && first.name.text === "as";
      }
      return false;
    });
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 36: RL files never destructure props", () => {
    const offenders = findIn(rlFiles(), (n) => {
      if (ts.isVariableDeclaration(n))
        return (
          ts.isObjectBindingPattern(n.name) &&
          !!n.initializer &&
          ts.isIdentifier(n.initializer) &&
          n.initializer.text === "props"
        );
      if (n.kind === ts.SyntaxKind.Parameter)
        return ts.isObjectBindingPattern((n as ts.ParameterDeclaration).name);
      return false;
    });
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 37: no props.slots, props.modelValue, $slots, $attrs, or $emit in RL files", () => {
    const banned: Record<string, true> = {
      slots: true,
      modelValue: true,
      $slots: true,
      $attrs: true,
      $emit: true,
    };
    const offenders = findIn(
      rlFiles(),
      (n) =>
        ts.isPropertyAccessExpression(n) &&
        ts.isIdentifier(n.expression) &&
        n.expression.text === "props" &&
        banned[n.name.text] === true,
    );
    expect(offenders).toEqual([]);
  }, 60_000);

  it("rule 38: RL files that spread rest onto DOM take rest from omit(props, ...) or setup()", () => {
    const offenders = findIn(
      rlFiles(),
      (n, sf) =>
        ts.isJsxSpreadAttribute(n) &&
        ts.isIdentifier(n.expression) &&
        n.expression.text === "rest" &&
        !sf.text.includes("omit(props") &&
        !sf.text.includes(".setup("),
    );
    expect(offenders).toEqual([]);
  }, 60_000);
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
      .filter((decl) => !RULE2_INTERNAL_PROPS.includes(decl.name.text))
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
