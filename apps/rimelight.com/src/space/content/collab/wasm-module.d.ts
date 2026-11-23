/** `.wasm?module` imports: the Cloudflare Vite plugin turns them into a precompiled WebAssembly module. */
declare module "*.wasm?module" {
  const module: WebAssembly.Module;
  export default module;
}
