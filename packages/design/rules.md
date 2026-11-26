# Rimelight design language: layout and interaction rules

Draft. Read-only research. Each rule is one or two sentences with its source. Where a rule is not written down in any source, it is marked **not in sources**.

## Sources and tags

| Tag   | File                                                                                                                      |
| ----- | ------------------------------------------------------------------------------------------------------------------------- |
| [MH]  | `rimelight-media` `docs/HANDOFF.md`, read with `git show c1198b3:docs/HANDOFF.md` (line numbers from that file)           |
| [MA]  | `C:\Users\idant\RustRoverProjects\rimelight-media\AGENTS.md` (release and build notes only; no UI rules)                  |
| [SP]  | `C:\Users\idant\RustRoverProjects\rimelight-space\PROJECT.md`                                                             |
| [SA]  | `C:\Users\idant\RustRoverProjects\rimelight-space\PLAN-archive.md` (line numbers)                                         |
| [SAG] | `C:\Users\idant\RustRoverProjects\rimelight-space\AGENTS.md`                                                              |
| [SU]  | `C:\Users\idant\RustRoverProjects\rimelight-space\crates\rimelight_ui\README.md`                                          |
| [WU]  | `C:\Users\idant\WebstormProjects\rimelight\packages\ui\README.md`                                                         |
| [WA]  | `C:\Users\idant\WebstormProjects\rimelight\AGENTS.md` (`CLAUDE.md` only imports it; no UI rules beyond the working rules) |
| [SM]  | Owner's auto-memory (not a repo file)                                                                                     |

---

## 1. Part names (glossary)

Names follow [SA] section 8.8 (line 2401) and [SAG]. Space is the only source with a full glossary. Media and web use the names shown.

- **Window (AppShell)**: the whole app window; owns the Ctrl+K entry. [SA:2412]
- **Rail**: far-left, full-height strip with one icon per area (ten areas). Bottom holds About, Report Issue and Settings. Hidden on phone. [SA:2413], [SA section 6.6, decision a, 2026-11-13]
- **Sidebar**: beside the rail; area title, then the area's rows, collapsible headings and count badges. Hidden when collapsed. In the drawer on phone. [SA:2414], [SA section 6.6, owner direction 4]
- **Top bar**: strip across the top of the content column. Right side, left to right: search input, notifications button with unread badge, avatar (profile menu). [SA:875, 2415]
- **Page area**: the content under the top bar. [SA:2416]
- **Page header**: top of the page area: breadcrumbs above the title, then page actions on the right. [SA:1439-1440, 2417]
- **Status bar**: full-width strip at the bottom, desktop only. [SA:2422, 881]
- **Quick action**: bottom-right floating button that opens the create menu, one category per area. [SA section 6.6, OQ14; SA:1375]
- **Command palette**: overlay with a scrim and a panel at top centre, opened by Ctrl+K or the top-bar search. [SA:2421, 1494]
- **Toast stack**: bottom-right corner of the page area, newest first. [SA:2420]
- **Tab strip**: row of document tabs (close, drag, one Tab stop). [SA:2426]
- **Tile group / tile layout**: a group of tabs with its own strip; groups split side by side or stacked. [SA:2427-2428]
- **Workspace strip / switcher / sheet**: row of workspace tabs above the top bar; the top-bar button that shows the count; the sheet that lists workspaces. Desktop, and phone for the switcher. [SA:2435-2437]
- **Phone tab bar**: bottom tabs on phone width (Home, Chat, Projects, Company, More). [SA:2424; SP:62]
- **Phone drawer**: sidebar in a panel over a scrim, opened by More. [SA:2425]
- **Inspector**: the record panel; a bottom sheet on phone, a right dock on desktop. [SA:OQ22, OQ27]
- **Toolbar**: a row of icon buttons split left and right, one Tab stop with roving focus. [MH:24], [SU:87]
- **ToolDivider**: a vertical divider used only between groups of tool items. [MH:27]
- **ActionRow**: a row of edit actions with confirm buttons flush right. [MH:25]
- **ConfirmDialog**: in-app confirm dialog. [MH:30]
- **Dialog / Sheet / Popover / Menu / ContextMenu / Tooltip**: the overlay components. [SU:53-56]
- **Banner / Toast**: in-line message (never hides itself) and transient message. [SU:58-59]
- **EmptyState / ErrorState**: placeholder body for no-content and failure. [MH:28], [SU:61]
- **Breadcrumbs**: trail of links (area, section, page) above a title. [SA:2431]
- **Presence dot**: four-state dot (Online, Away, Busy, Offline) in the avatar menu. [SA:2434, decision c]
- **Share**: a button on every page (internal link everywhere; public links only for docs, files, whiteboards and roadmaps). [SA:OQ20]

---

## 2. Layout rules

### Toolbars and action rows

- Toolbars split into a left group and a right group with a stretch spacer between; never centred. [MH:16, 24]
  - **Conflict:** the canvas toolbar is "moved to the bottom centre" (owner review 2, [SP] section 4, CV row). See section 7.
- Confirm buttons sit flush right in an action row. [MH:16, 25]
- Primary action last in an action row. **Not in sources** (the task asked for it; [MH:31] has primary at index 0 and Cancel at index 2 in the `ask` helper, which is a different ordering). See section 7.
- Everything is vertically centred within its bar. [MH:16]
- Gaps are consistent and come from the spacing scale (4 px base, `Tokens.space-*`). [SA:1785 (token layers), SU:20]

### Dividers

- Dividers only sit between groups; no stray or trailing divider. [MH:17, 27, 80]
- Divider components are for grouping only; the sidebar hairline is decorative. [SA:2103, SU:60 (Divider)]

### Bar and control heights

- Control height 34 px, rail width 48 px, sidebar width 240 px, sidebar row 36 px, tree row 30 px. [SA:1896]
- Toolbar and status-bar heights: **not in sources**.

### Page header anatomy

- Breadcrumbs sit above the title on every page; the title follows, then page actions. [SA:885 (direction 6), SA:1439]
- Page actions on the right, in order: primary action (if the page has one), Share, then the overflow `…` menu. [SA:1439-1440]
- Overflow menu holds copy link, open in new tab, rename, duplicate, show history, archive or delete, only where the page allows each. [SA:1440]
- On phone, the primary action and Share move into the overflow menu when they do not fit. [SA:1475]
- Breadcrumbs wrap or collapse by item count (`max-visible`), not by width; the collapsed ellipsis is not clickable. [SA:1475, SU:121]
  - **Conflict:** [SA:1475] says "wrap or collapse"; [SU:121] says collapse by count only. See section 7.

### Empty states

- An empty state has an icon, a title, a hint and a primary action. [task brief; partly in MH:28]
- Media's `EmptyState` holds: icon, title, supported types, Open and New buttons, and recents. [MH:28]
- Space's `EmptyState` says the action or retry button is its only Tab stop. [SU:61]
  - **Conflict:** the two `EmptyState` specs differ (multiple actions and recents vs a single action). See section 7.
- With no workspace open, the page area reads "No workspace open" with a "New workspace" button. [SA:1544]

### Dialogs

- Dialogs are in-app only; never native message boxes. [MH:17-18]
- Create actions open a dialog, not a route. [SA:1375 (OQ16)]
- Space's Report Issue is an in-app dialog form (title, description, optional screenshot, app version). [SA:OQ32]
- File pickers are operating-system dialogs. Space uses the native picker (`rfd`) for profile photos, hidden on web and Android. [SP section 4, row SP.3c] The rule above is about message boxes; whether file pickers are allowed is open. See section 7.

### Shell and navigation placement

- Search, notifications and avatar sit on the right of the top bar, in that order. [SA:875]
- About, Report Issue and Settings sit at the bottom of the rail, not in the sidebar. [SA:decision a, 2026-11-13]
- The status bar holds record, full screen, shortcuts, language and theme on desktop; hidden on phone. [SA:2422, 1413-1415]
- Phone: bottom tab bar, slide-in drawer, stacked pages with back navigation. [SP:62]
- Layout adapts on phone; capability does not (full parity). [SP A13]

---

## 3. Interaction and keyboard rules

### Focus

- The focus ring is always visible when focus is on a control. [SA:3381 (focus management rules), SA:3466]
  - **Conflict:** [SU:37] says Button's click does not show the focus ring. See section 7.
- The focus ring uses the `focus.ring` token; it meets 3:1 on every surface. [SA:2351]
- Focus moves into a popover panel on open and returns to the trigger on close. [SU:53]

### Tab order

- Tab order follows visual order. [SA:3381]
- Each composite widget is one Tab stop with roving focus (arrows move inside it): Tabs, Toolbar, Tree, Tab strip, List, Table header and body. [SU:78, 87, 89, 106, 107; SA:2426]
- Tabs, Toolbar and Tree: arrows never activate (Enter and Space do). [SU:78, 87, 89]
- Inside a dialog, Tab stays inside the dialog. [SU:56]
- Media's Tab switches tabs in the app, except in the Text editor, where it does nothing. This is pending the owner's check. [MH:75-76]
  - **Conflict:** [SU:78] and [SA:2426] say the tab strip is one stop with arrows; media says Tab itself switches tabs. See section 7.

### Escape

- Escape closes the topmost overlay. [SA:3381]
- Plain Escape reaches dialogs and menus; Escape closes a dialog unless it is not dismissible. [SA:1528, SU:56]
- Escape closes a popover and returns focus to its trigger. [SU:53]
- Escape cancels a drag without change. [SA:1612]

### Keyboard shortcuts (Space)

- Ctrl+K (Cmd+K on macOS) opens the command palette from anywhere. [SA:1494]
- Ctrl+Alt+N (Cmd+Option+N on macOS) opens the quick action create menu. [SA:1375]
- Alt+Left and Alt+Right go back and forward; Ctrl+] and Cmd+[ also do. Ctrl+[ does not go back on Windows (it arrives as Escape). [SA:1503, 1528]
- The shortcuts dialog lists shortcuts in groups (Navigation, Create, Panes) and tags planned ones. [SA:1488-1490]
- The `?` key opens shortcut help. [SA:3206]
- Palette keys: Up, Down, Return, Escape. [SU:62]

### Keyboard shortcuts (media)

- N and P move to the next and previous file; S starts or stops the slideshow; I opens the details panel. [MH:84, 95, pending checks]
- A Ctrl+? overlay listing the current tab's shortcuts is planned. [MH:68]
  - **Conflict:** Space uses `?`, media plans Ctrl+?. See section 7.

### Keyboard coverage

- Every component is keyboard-operable; keyboard-only walkthroughs cover shell, palette and every template before a slice is done. [SP:section 4 and gates; SA:3466]
- Interaction tests use real key events. [SU:163]
- The rail and sidebar have no keyboard routes yet. [SU:120]

---

### Motion curves (owner, 2026-11-22; replaces audit Q16)

Animations use built-in curves, not easing tokens:

| Movement                                                                       | Curve         |
| ------------------------------------------------------------------------------ | ------------- |
| Something appears or opens (menu, popover, dialog, sheet, toast)               | `ease-out`    |
| Something moves or resizes in place (drag settle, panel resize, tab underline) | `ease-in-out` |
| Something disappears or closes                                                 | `ease-in`     |
| Loops (spinner, skeleton pulse, indeterminate progress)                        | `linear`      |

Durations still come from the motion tokens (fast, base, slow, loop) and drop to 0 under reduced motion. The web keeps
the `--rl-motion-ease-*` CSS variables, and Rust keeps the `motion::EASE_*` constants, but neither is required.

## 4. Accessibility

### Contrast

- Text needs 4.5:1 and non-text UI needs 3.0:1, in both themes. Every text-on-surface pair is checked by a unit test. [SA:2003, SA:3298, SP:37]
- Disabled controls are exempt from contrast minimums. [SA:2106]
- Media has no contrast rule in its sources. **Not in sources.**

### Reduced motion

- Reduced motion must be supported. [SP:37]
- It is a manual flag (`Tokens.reduced-motion`); when on, every duration is 0 ms. The OS setting is not read. [SU:23, SA:2226]
- Easing curves are written in components and are not affected by the flag. [SU:21]
- Media: no reduced-motion rule in sources. **Not in sources.**

### Text scale

- Text scales at 100, 125, 150 and 200 percent. Type sizes, line heights and icon sizes scale with it. [SU:24, SA:2282, SA:2167]
- Icon sizes are the `size-icon-*` tokens multiplied by the text factor. [SA:4003]
- Media: no text-scale rule in sources. **Not in sources.**

### Screen readers

- Screen readers are supported where Slint supports them. [SP:37]
- AccessKit is used on desktop; screen-reader behaviour is not verified on any platform. [SP:186, SU:114]
- Accessible names: an icon button's label is its accessible name; a status dot takes `accessible-name` or its label. [SU:38, 70]
- Known role gaps: Slint 1.18.1 has no `menu`, `menu-item`, `dialog` or `link` role; the closest role is used. [SU:114, SP:186]
- Toolbar and Tree expose one Tab stop per group, so a screen reader hears the group, not each item. [SU:128]
- Web: WAI-ARIA compliant with screen-reader support out of the box (claim). [WU:18, 105]
  - **Conflict:** Space says screen readers are unverified; web claims support. See section 7.

### Other

- Dark theme: some highlights and fills read near black. [SU:153]
- Media: no touch-target rule in sources. **Not in sources.**

---

## 5. Theming

- Three modes: light, dark, and system. [SP:63, SU:22]
- Under system, the dark flag follows the OS colour scheme as the window backend updates it. [SU:22]
- Tokens have three layers: primitive, semantic (`surface.*`, `text.*`, `accent.*`, `focus.ring`, `status.*`), and component aliases. [SA:1785-1789]
- Each theme is Rust data with `light()` and `dark()` constructors. [SA:1791]
- Each semantic token has one value set per theme. [SA:1787]
- **Not customisable (Space):** no user accent colour, no density setting, no theme files, no org branding. [SP:63, SA:1791-1792]
- Web: components are customisable per slot and per variant through UnoCSS, globally or per instance. [WU:19, 99-100]
  - **Conflict:** web allows customisation that Space forbids. See section 7.
- Media: no theme-customisation rule in sources. **Not in sources.**
- Off-white page background for media is kept. [SM test-cadence note; not a repo rule]

---

## 6. Facade rule

- Only `rimelight_ui` depends on `slint`. Feature code and apps import only its Rust API and its `.slint` components. [SU:5-7, SP:184]
- No colour, size, font or duration literal appears outside the generated token global. [SP:184, SU:20]
- Markup uses `Tokens.*` for colour, radius, spacing and sizes, `Type.*` for text styles and `Icons.*` for icons. [SU:20]
- Slint std-widgets cannot reach the tokens, so every component is its own `.slint` file. [SU:33]
- Feature code never imports Slint components or std-widgets directly. [SP:45]
- Easing curves are written in components (Slint properties cannot hold them). [SU:21]
- The lint that enforces no literals (including `.slint` imports) is deferred (P0.18); the rule is not yet enforced by tooling. [SP:128, SP:184]
- Known literals in the facade today: the 2 px focus ring on Breadcrumbs, and Link and Tag. [SU:121]
- Media: `ui/widgets.slint` is its own component set; media does not depend on `rimelight_ui`. [MH:23-24]
- Web: no facade; styling goes through UnoCSS. [WU:19]

---

## 7. Conflicts and open questions

Each item lists the sources that disagree. Owner decides which rule holds.

1. **Toolbar centring.** Media: toolbars are never centred [MH:16]. Space canvas toolbar was moved to the bottom centre in owner review 2 [SP section 4, CV row]. Which holds for floating toolbars?
2. **Primary action order.** Space's S1.5c lists "Create, Cancel and View in full page" with Create first [SP section 4, S1.5c]. Media's `ask` helper has primary at 0, secondary at 1, Cancel at 2 [MH:31]. Is primary last (the brief's rule, not in any source) or first?
3. **Focus ring on click.** Space's Button does not show the focus ring on click [SU:37]. Space's focus rules say the ring is always visible [SA:3381]. Which holds?
4. **Tab switches tabs.** Media's Tab switches tabs [MH:75]. Space's tab strip is one Tab stop with arrows [SU:78, SA:2426]. Should Tab ever move between tabs?
5. **Empty-state contents.** Media's `EmptyState` has icon, title, supported types, Open and New, and recents [MH:28]. Space's `EmptyState` has one Tab stop [SU:61]. Is the empty state one action or several?
6. **Status bar contents and connection state.** Direction 2 gives the status bar Shortcuts, Fullscreen and Theme [SA:881]. The as-built list is Record, Full screen, Shortcuts, Language and Theme [SA:2422]. Direction 1 says connection state stays in the status bar [SA:875]. The UI1 row says "no connection word in the status bar" [SP section 4, UI1]. Which holds for connection state, and which controls stay?
7. **Top-bar background.** Direction 1 says a real surface-token background [SA:875]. The as-built top bar is transparent [SA:2415]. This is a gap, not a disagreement, but the spec and build differ.
8. **Notifications button.** The bell "opens the notifications panel" [SA:1002], but direction 1 deletes the Notifications item and the glossary says no notification panel exists [SA section 8.8, "not present" paragraph]. Does the bell open a panel?
9. **Breadcrumb overflow.** [SA:1475] says breadcrumbs "wrap or collapse". [SU:121] says they collapse by item count only, never by width. Wrap or collapse?
10. **Sidebar bottom section.** Direction 3 put About, Report Issue and Settings in the sidebar [SA:882]. Decision (a) moved them back to the rail [SA section 6.6, decision a]. OQ2's answer still says "sidebar bottom section" [SA section 6.6, OQ2 answer]. Stale text in the archive; the rail is the current rule.
11. **Screen-reader claims.** Web says screen-reader support is out of the box [WU:18, 105]. Space says it is not verified on any platform [SU:114, SP:186].
12. **Reduced motion and the OS setting.** The requirement is reduced motion [SP:37]. The flag ignores the OS setting [SU:23]. The workspace forbids OS-setting reads outside an audited module (decision 0008). Should the OS setting be read?
13. **Customisation.** Web allows per-slot and per-instance overrides [WU:19, 99-100]. Space forbids theme files and accent changes [SP:63]. Should `@rimelight/ui` offer the same limits?
14. **Literals in the facade.** The rule says no literal outside the token global [SP:184]. Breadcrumbs' 2 px focus ring, Link and Tag use literals [SU:121]. Easing curves are in components [SU:21]. Is the easing exception allowed?
15. **Lint status.** The rule says the lint must cover `.slint` files [SP:184]. The lint is deferred [SP:128]. Until it lands, the rule is unenforced.
16. **Media and the facade.** The facade says apps import only `rimelight_ui` [SU:5-7]. Media imports Slint directly with its own widgets [MH:23-24]. Should media move to the facade?
17. **File pickers and "in-app only".** Media says dialogs are in-app, never native message boxes [MH:17-18]. Space uses the native file picker for profile photos [SP section 4, SP.3c]. Are OS file pickers allowed?
18. **Help shortcut.** Space uses `?` for shortcut help [SA:3206]. Media plans Ctrl+? [MH:68]. Pick one for both apps.
19. **Phone header.** [SA:1475] moves primary and Share into the overflow on phone. [SA:1439-1440] keeps them on the right on desktop. Confirm that phone and desktop differ on purpose.
20. **Toolbar and status-bar heights.** Space gives control and row heights [SA:1896]. No source gives toolbar or status-bar heights. Needs a value.
21. **Media design rules.** Media's sources have only layout and dialog rules [MH:16-18, 23-31]. No contrast, motion, text-scale, theme or keyboard policy is written down. These need an owner decision before media can claim the shared language.

## 8. Answers (owner, 2026-11-22)

Every conflict in section 7 is settled. Where an answer changes a rule in sections 1 to 6, the answer here wins until
those sections are rewritten.

| #   | Rule now                                                                                                                                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Docked bars (top bar, edit row, status bar) split left and right and are never centred. Floating tool palettes, such as the canvas toolbar, may be centred                                               |
| 2   | The primary action goes at the far right: Cancel, then Primary, both flush right. Space's New issue dialog becomes Cancel, Create; Media's `ask` buttons are reordered on screen                         |
| 3   | The focus ring shows on keyboard focus only (focus-visible), never after a mouse click                                                                                                                   |
| 4   | A tab strip is one Tab stop. Arrows move between tabs, and Ctrl+Tab / Ctrl+Shift+Tab switch document tabs. Media's "Tab switches tabs" becomes Ctrl+Tab                                                  |
| 5   | An empty state has an icon, a title, a hint, one primary action, an optional secondary action, and an optional content slot below (for example Media's recent files)                                     |
| 6   | Follow the build: connection state shows only as the full-window overlay (decision 0040). The status bar holds Record, Full screen, Shortcuts, Language and Theme. Fix the archive text                  |
| 7   | The top bar gets a token background, as the spec says (a gap in the build, to fix)                                                                                                                       |
| 8   | **Keep the notifications button (bell)** in the top bar now. Its panel comes in a later Notifications slice; until then it opens a placeholder                                                           |
| 9   | Breadcrumbs never wrap. They collapse their middle items into an ellipsis menu by available width. Space's count-based collapse is upgraded                                                              |
| 10  | About, Report Issue and Settings live on the rail. Remove the stale "sidebar bottom section" text from the archive                                                                                       |
| 11  | Neither library claims screen-reader support until it has been tested on that platform. Change the web README wording                                                                                    |
| 12  | Reduced motion follows the OS setting by default, read through the audited platform module (decision 0008). The in-app toggle overrides it                                                               |
| 13  | `@rimelight/ui` keeps per-slot and per-instance overrides as a library feature for outside users. Rimelight's own apps (web and native) use the fixed theme: no accent, theme-file or branding overrides |
| 14  | No literal exceptions. Easings (audit Q16) and the focus ring width and offset (audit Q18) become tokens                                                                                                 |
| 15  | The lint for colour, size and font literals in `.slint` files (Space's deferred P0.18) is scheduled with ST2.3 and runs in every consumer's CI                                                           |
| 16  | Media moves to the facade: it imports only the shared `rimelight_ui` (WS4)                                                                                                                               |
| 17  | OS file pickers (open, save, choose folder) are allowed. Questions, confirmations and errors are in-app dialogs only, never native message boxes                                                         |
| 18  | Shortcut help opens on `?` when focus is not in a text field, and on Ctrl+/ everywhere, in every app                                                                                                     |
| 19  | Phone and desktop differ on purpose: on phone, primary and Share move into the overflow menu; on desktop they stay on the right of the page header                                                       |
| 20  | Bar heights are the shared component tokens from audit Q24: toolbar 44, action row 44, status bar 36 (Space's bars to be compared first)                                                                 |
| 21  | Media adopts the whole shared language (contrast, motion, text scale, theme, keyboard) as part of WS4                                                                                                    |
