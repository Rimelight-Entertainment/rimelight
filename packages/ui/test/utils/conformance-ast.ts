import fs from "node:fs";
import path from "node:path";
import { API } from "typescript/sync";
import * as ts from "typescript/ast";

// Shared AST helpers for the conformance tests. Uses the TypeScript compiler API
// (`typescript` 7 native API: `typescript/sync` and `typescript/ast`) so checks run on real syntax trees.

export const UI_ROOT = path.resolve(import.meta.dirname, "..", "..");
export const SRC_DIR = path.join(UI_ROOT, "src");
export const COMPONENTS_DIR = path.join(SRC_DIR, "components");

export interface ComponentFolder {
  folder: string;
  pascal: string;
  dir: string;
  rlFile: string | undefined;
  typesFile: string | undefined;
  themeFile: string | undefined;
}

export type PropsDecl = ts.TypeAliasDeclaration | ts.InterfaceDeclaration;

let api: API | undefined;
const parsed = new Map<string, ts.SourceFile>();

/** Releases the TypeScript API process. Call from `afterAll`. */
export function closeAst(): void {
  api?.close();
  api = undefined;
  parsed.clear();
}

export function parseFile(file: string): ts.SourceFile {
  const cached = parsed.get(file);
  if (cached) return cached;
  api ??= new API({ cwd: UI_ROOT });
  const scriptKind = file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = api.createSourceFile(file, fs.readFileSync(file, "utf8"), { scriptKind }).sourceFile;
  parsed.set(file, sf);
  return sf;
}

export function listSourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(full);
    return entry.name.endsWith(".ts") || entry.name.endsWith(".tsx") ? [full] : [];
  });
}

export function pascalCase(folder: string): string {
  return folder
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export function listComponentFolders(): ComponentFolder[] {
  return fs
    .readdirSync(COMPONENTS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const folder = entry.name;
      const dir = path.join(COMPONENTS_DIR, folder);
      const pascal = pascalCase(folder);
      const rl = path.join(dir, `RL${pascal}.tsx`);
      const types = path.join(dir, `${folder}.types.ts`);
      const theme = path.join(dir, `${folder}.theme.ts`);
      return {
        folder,
        pascal,
        dir,
        rlFile: fs.existsSync(rl) ? rl : undefined,
        typesFile: fs.existsSync(types) ? types : undefined,
        themeFile: fs.existsSync(theme) ? theme : undefined,
      };
    })
    .sort((a, b) => a.folder.localeCompare(b.folder));
}

/** Depth-first visit of every node in the tree. */
export function walk(node: ts.Node, visit: (node: ts.Node) => void): void {
  visit(node);
  node.forEachChild((child) => {
    walk(child, visit);
  });
}

/** Visits nodes of `node` but does not descend into nested functions (they are visited, not entered). */
export function walkOwn(node: ts.Node, visit: (node: ts.Node) => void): void {
  visit(node);
  node.forEachChild((child) => {
    if (
      ts.isArrowFunction(child) ||
      ts.isFunctionExpression(child) ||
      ts.isFunctionDeclaration(child)
    ) {
      visit(child);
      return;
    }
    walkOwn(child, visit);
  });
}

/** Identifier / string / numeric name text, or "" for anything else. */
export function nameText(node: ts.Node | undefined): string {
  if (!node) return "";
  if (ts.isIdentifier(node) || ts.isStringLiteral(node) || ts.isNumericLiteral(node))
    return node.text;
  return "";
}

export function typeNameText(name: ts.EntityName): string {
  if (ts.isQualifiedName(name)) return `${typeNameText(name.left)}.${nameText(name.right)}`;
  return nameText(name);
}

export function isExported(stmt: ts.Node): boolean {
  return (ts.getCombinedModifierFlags(stmt as ts.Declaration) & ts.ModifierFlags.Export) !== 0;
}

/** Top-level type aliases and interfaces whose name ends in `Props`. */
export function propsDecls(sf: ts.SourceFile): PropsDecl[] {
  return sf.statements.filter(
    (s): s is PropsDecl =>
      (ts.isTypeAliasDeclaration(s) || ts.isInterfaceDeclaration(s)) &&
      s.name.text.endsWith("Props"),
  );
}

export function localTypeDecls(sf: ts.SourceFile): Map<string, PropsDecl> {
  const map = new Map<string, PropsDecl>();
  for (const s of sf.statements) {
    if (ts.isTypeAliasDeclaration(s) || ts.isInterfaceDeclaration(s)) map.set(s.name.text, s);
  }
  return map;
}

/** Property members declared directly in the type (literals, intersections, interface body). */
export function ownMembers(node: ts.Node | undefined): readonly ts.TypeElement[] {
  if (!node) return [];
  if (ts.isInterfaceDeclaration(node)) return node.members;
  if (ts.isTypeAliasDeclaration(node)) return ownMembers(node.type);
  if (ts.isTypeLiteralNode(node)) return node.members;
  if (ts.isIntersectionTypeNode(node)) return node.types.flatMap((t) => [...ownMembers(t)]);
  if (ts.isParenthesizedTypeNode(node)) return ownMembers(node.type);
  return [];
}

/** All type-reference names reachable in the subtree, e.g. `InferThemeProps`, `Omit`. */
export function typeRefNames(node: ts.Node): string[] {
  const names: string[] = [];
  walk(node, (n) => {
    if (ts.isTypeReferenceNode(n)) names.push(typeNameText(n.typeName));
    if (ts.isExpressionWithTypeArguments(n) && ts.isIdentifier(n.expression))
      names.push(n.expression.text);
  });
  return names;
}

/**
 * Type-reference names that are direct constituents of `node`: the alias body, parenthesized
 * parts, intersection members, and interface `extends` clauses. References nested inside generic
 * arguments, function signatures, or unions are not included.
 */
export function intersectedRefNames(node: ts.Node | undefined): string[] {
  if (!node) return [];
  if (ts.isTypeAliasDeclaration(node) || ts.isParenthesizedTypeNode(node))
    return intersectedRefNames(node.type);
  if (ts.isInterfaceDeclaration(node)) {
    return (node.heritageClauses ?? []).flatMap((h) =>
      h.types.flatMap((t) => intersectedRefNames(t)),
    );
  }
  if (ts.isIntersectionTypeNode(node)) return node.types.flatMap((t) => intersectedRefNames(t));
  if (ts.isTypeReferenceNode(node)) return [typeNameText(node.typeName)];
  if (ts.isExpressionWithTypeArguments(node) && ts.isIdentifier(node.expression))
    return [node.expression.text];
  return [];
}

export function attrNode(el: ts.JsxOpeningLikeElement, name: string): ts.JsxAttribute | undefined {
  return el.attributes.properties.find(
    (p): p is ts.JsxAttribute => ts.isJsxAttribute(p) && nameText(p.name) === name,
  );
}

/** Static string value of a JSX attribute (`x="a"` or `x={"a"}`), else undefined. */
export function staticAttrString(attr: ts.JsxAttribute | undefined): string | undefined {
  const init = attr?.initializer;
  if (!init) return undefined;
  if (ts.isStringLiteral(init)) return init.text;
  if (ts.isJsxExpression(init) && init.expression && ts.isStringLiteralLikeNode(init.expression)) {
    return init.expression.text;
  }
  return undefined;
}

export function usesChildren(rlFile: string): boolean {
  let found = false;
  walk(parseFile(rlFile), (n) => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "children")
      found = true;
  });
  return found;
}

/** The component's own props declaration: `RL<Pascal>Props`, else the first `*Props` in the types file. */
export function componentPropsDecl(folder: ComponentFolder): PropsDecl | undefined {
  if (!folder.typesFile) return undefined;
  const decls = propsDecls(parseFile(folder.typesFile));
  return decls.find((d) => d.name.text === `RL${folder.pascal}Props`) ?? decls[0];
}

type MinimalValue = { ok: true; value: unknown } | { ok: false };

function minimalValue(node: ts.TypeNode): MinimalValue {
  if (ts.isParenthesizedTypeNode(node)) return minimalValue(node.type);
  if (node.kind === ts.SyntaxKind.StringKeyword) return { ok: true, value: "fixture" };
  if (node.kind === ts.SyntaxKind.NumberKeyword) return { ok: true, value: 1 };
  if (node.kind === ts.SyntaxKind.BooleanKeyword) return { ok: true, value: false };
  if (ts.isArrayTypeNode(node)) return { ok: true, value: [] };
  if (ts.isFunctionTypeNode(node)) return { ok: true, value: () => undefined };
  if (ts.isTypeLiteralNode(node)) return { ok: true, value: {} };
  if (ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal))
    return { ok: true, value: node.literal.text };
  if (ts.isLiteralTypeNode(node) && ts.isNumericLiteral(node.literal)) {
    return { ok: true, value: Number(node.literal.text) };
  }
  if (ts.isUnionTypeNode(node)) {
    for (const member of node.types) {
      const result = minimalValue(member);
      if (result.ok) return result;
    }
    return { ok: false };
  }
  if (ts.isTypeReferenceNode(node)) {
    const name = typeNameText(node.typeName);
    return name === "Array" || name === "ReadonlyArray" ? { ok: true, value: [] } : { ok: false };
  }
  return { ok: false };
}

/**
 * Minimal valid props for a component, derived from its props type: every required prop gets a
 * value from its type; optional `open` is set to `true` so overlays render. `overrides` win.
 * `unresolved` lists required props with no safe type-derived default; they need an override.
 */
export function minimalProps(
  folder: ComponentFolder,
  overrides: Record<string, unknown> = {},
): { props: Record<string, unknown>; unresolved: string[] } {
  const props: Record<string, unknown> = {};
  const unresolved: string[] = [];
  const decl = componentPropsDecl(folder);
  if (!decl || !folder.typesFile) return { props: { ...overrides }, unresolved: [] };

  // Members come from the decl and from local types it intersects directly. Refs nested in
  // generic arguments or function-typed signatures (e.g. slot render args) are not walked.
  const localDecls = localTypeDecls(parseFile(folder.typesFile));
  const members: ts.TypeElement[] = [...ownMembers(decl)];
  for (const name of intersectedRefNames(decl)) {
    const target = localDecls.get(name);
    if (target && target !== decl) members.push(...ownMembers(target));
  }

  for (const member of members) {
    if (!ts.isPropertySignatureDeclaration(member)) continue;
    const name = nameText(member.name);
    if (!name || name === "children") continue;
    if (member.postfixToken) {
      if (name === "open") props["open"] = true;
      continue;
    }
    const result: MinimalValue = member.type ? minimalValue(member.type) : { ok: false };
    if (result.ok) props[name] = result.value;
    else unresolved.push(name);
  }

  Object.assign(props, overrides);
  return { props, unresolved: unresolved.filter((name) => !(name in overrides)) };
}
