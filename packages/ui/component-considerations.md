# Rimelight UI: Component Gap & Naming Alignment Analysis

This document details the alignment between the 62 ported Astro components inside `@rimelight/ui` (`packages/ui/src/components/astro/`) and the placeholder documentation files in `rimelight.com` (`src/content/docs/en/company/docs/packages/rimelight-ui/components/`).

---

## 1. Naming & File Mapping Mismatches

The following components have implemented codebase files, but the corresponding placeholder files in the documentation use different names. We recommend either aligning the names in the documentation or maintaining aliases to prevent confusion.

| `@rimelight/ui` Ported Component | `rimelight.com` Docs MDX Placeholder | Analysis / Alignment Recommendations |
| :--- | :--- | :--- |
| **`RLAAlertDialog.astro`** | `overlay/confirm.mdx` | **Mismatch**: Standardized to `RLAAlertDialog` in code but referred to as "confirm" in docs. Consider renaming the MDX to `alert-dialog.mdx` or mapping standard overlay types. |
| **`RLADialog.astro`** | `overlay/modal.mdx` | **Mismatch**: Code uses `RLADialog` (following shadcn patterns), while docs refers to it as "modal". Recommend aligning docs to `dialog.mdx`. |
| **`RLASheet.astro`** | `overlay/slideover.mdx` | **Mismatch**: Code uses `RLASheet` (side drawers), while docs refers to it as "slideover". Recommend renaming MDX to `sheet.mdx`. |
| **`RLADropzone.astro`** | `form/file-upload.mdx` | **Mismatch**: Drag-and-drop file component is `RLADropzone` in code but `file-upload` in docs. Consider standardizing on `dropzone.mdx`. |
| **`RLAInputGroup.astro`** | `elements/field-group.mdx` | **Mismatch**: Code uses `RLAInputGroup` for prefix/suffix fields, while docs uses `field-group`. |
| **`RLAField.astro`** | `form/form-field.mdx` | **Mismatch**: Code wraps form controls in `RLAField`, while docs uses `form-field`. |
| **`RLACombobox.astro`** | `form/input-menu.mdx` | **Mismatch**: Searchable autocomplete is `RLACombobox` in code, but `input-menu` in docs. |
| **`RLASelect.astro`** | `form/select-menu.mdx` | **Mismatch**: Custom listbox-based select is `RLASelect` in code, but `select-menu` in docs. |
| **`RLANativeSelect.astro`** | `form/select.mdx` | **Mismatch**: Standard `<select>` dropdown wrapper is `RLANativeSelect` in code, but simply `select` in docs. |
| **`RLAResizable.astro`** | `layout/splitter.mdx` | **Mismatch**: Drag-to-resize panel layout is `RLAResizable` in code, but `splitter` in docs. |
| **`RLAEmbedYoutube.astro`** | `media/video.mdx` | **Mismatch**: YouTube embed wrapper is `RLAEmbedYoutube` in code, but general `video` in docs. |
| **`RLALocaleSelector.astro`** | `utility/locale-select.mdx` | **Minor**: Name shortened in docs to `locale-select` instead of `locale-selector`. |
| **`RLAThemeSelector.astro`** | `utility/themer.mdx` or `utility/color-select.mdx` | **Mismatch**: Multi-theme controller is `RLAThemeSelector` in code, but mapped to "themer" or "color-select" in docs. |
| **`RLASection.astro`** | `page/page-section.mdx` | **Mismatch**: Page structural wrapper is `RLASection` in code, but `page-section` in docs. |

---

## 2. Missing Components (Gaps in `@rimelight/ui`)

The following files exist in `rimelight.com` as documentation placeholders, but **do not yet have a ported Astro component** implemented in `@rimelight/ui`. These should be scheduled for subsequent porting stages:

### A. AI Category (9 missing)
- `ai/chat-message.mdx`
- `ai/chat-messages.mdx`
- `ai/chat-palette.mdx`
- `ai/chat-prompt-submit.mdx`
- `ai/chat-prompt.mdx`
- `ai/chat-reasoning.mdx`
- `ai/chat-shimmer.mdx`
- `ai/chat-tool.mdx`
- `ai/chat.mdx`

### B. Dashboard Category (10 missing)
- `dashboard/dashboard-group.mdx`
- `dashboard/dashboard-navbar.mdx`
- `dashboard/dashboard-panel.mdx`
- `dashboard/dashboard-resize-handle.mdx`
- `dashboard/dashboard-search-button.mdx`
- `dashboard/dashboard-search.mdx`
- `dashboard/dashboard-sidebar-collapse.mdx`
- `dashboard/dashboard-sidebar-toggle.mdx`
- `dashboard/dashboard-sidebar.mdx`
- `dashboard/dashboard-toolbar.mdx`

### C. Form Controls Category (12 missing)
- `form/checkbox-group.mdx` (Only singular checkbox is implemented)
- `form/color-picker.mdx`
- `form/form.mdx`
- `form/input-date.mdx`
- `form/input-number.mdx`
- `form/input-tags.mdx`
- `form/input-time.mdx`
- `form/knob.mdx`
- `form/listbox.mdx`
- `form/password.mdx` (Currently handled via type parameter on `RLAInput.astro`)
- `form/pin-input.mdx`
- `form/radio-group.mdx`

### D. Data, Media & Navigation Categories (14 missing)
- `data/empty.mdx`
- `data/gallery.mdx`
- `data/meter.mdx`
- `data/rating.mdx`
- `data/spoiler.mdx`
- `data/timeline.mdx`
- `data/tree.mdx`
- `data/user.mdx`
- `media/audio.mdx`
- `media/image.mdx`
- `navigation/command-palette.mdx`
- `navigation/footer-columns.mdx`
- `navigation/link.mdx`
- `navigation/megamenu.mdx`
- `navigation/stepper.mdx`
- `navigation/table-of-contents.mdx`

### E. Overlay & Elements Categories (8 missing)
- `overlay/context-menu.mdx`
- `overlay/dock.mdx`
- `overlay/floating-action.mdx`
- `elements/banner.mdx`
- `elements/calendar.mdx`
- `elements/chip.mdx`
- `elements/fieldset.mdx`
- `elements/speed-dial.mdx`

### F. Layout & Structural Categories (11 missing)
- `layout/container.mdx`
- `page/changelog.mdx`
- `page/page-aside.mdx`
- `page/page-body.mdx`
- `page/page-header.mdx`
- `page/page.mdx`
- `page/post.mdx`
- `page/pricing-plan.mdx`
- `page/pricing-table.mdx`
- `app/app.mdx`
- `app/error.mdx`

---

## 3. Undocumented Ported Components

The following components have fully functional implementations in `@rimelight/ui` and active showcase pages in `@rimelight/playground`, but **do not have matching placeholder MDX files** in `rimelight.com` documentation directories:

- **`RLAStickySurface.astro`**: Highly versatile layout surface pinning component (no `utility/sticky-surface.mdx` exists).
- **`RLAQuote.astro`**: Elegant premium blockquote and cite styler (no `data/quote.mdx` exists).
- **`RLAToggle.astro`**: Isolated press state toggle (no `form/toggle.mdx` exists).
- **`RLAToggleGroup.astro`**: Row/column multiple button toggle group (no `form/toggle-group.mdx` exists).

