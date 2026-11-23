/**
 * loro-crdt for the Worker (`#loro` under the `workerd` condition, see package.json "imports").
 *
 * The package's default (bundler) build imports its .wasm as an ES module instance, which the Cloudflare build does
 * not bundle, and Workers refuse to compile WebAssembly from bytes at run time. So the Worker uses the `web` build and
 * hands it the precompiled module from a `.wasm?module` import, which the Cloudflare plugin uploads with the Worker.
 * Node (tests) gets the package's Node build instead.
 */
import wasmModule from "loro-crdt/web/loro_wasm_bg.wasm?module";
import { initSync } from "loro-crdt/web";

initSync({ module: wasmModule });

export * from "loro-crdt/web";
