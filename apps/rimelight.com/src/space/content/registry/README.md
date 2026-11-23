# Block registry data

`blocks.json` is the block registry as data, a byte-for-byte copy of
`rimelight-rs/crates/rimelight_content/registry/blocks.json` (the Rust crate is the source).
`test/fixtures/content/*.page.json` are copies of `rimelight-rs/crates/rimelight_content/fixtures/`.

Copy both over when the Rust side changes. `test/space-content-registry.test.ts` checks that the CMS package's
built-in blocks match `blocks.json`; `test/space-content-collab.test.ts` runs the mapping on the fixtures.
