# Rust/Slint design-token parity audit (rimelight_ui)

Read-only audit. Source tree: `C:\Users\idant\RustRoverProjects\rimelight-space\crates\rimelight_ui`. All file citations below are relative to that crate root (for example `src/tokens/semantic.rs:196` means `C:\Users\idant\RustRoverProjects\rimelight-space\crates\rimelight_ui\src\tokens\semantic.rs`, line 196). Hex values in the semantic table come from the generated `ui/generated/tokens.slint` (both themes) and were cross-checked against the Rust light/dark constructors. Nothing was built or run (no cargo). Contrast ratios were not recomputed; the tests in `src/tokens/contrast.rs` are the authority and were not executed.

Legend for source kind: **Sourced** = read from a reference (Space, Artcraft, or a measured screenshot value); **Derived** = computed from a sourced value; **Placeholder** = no source, chosen so the token exists and passes contrast (per `src/tokens/primitive.rs:7-9`).

## 1. Primitive colours

Source: `src/tokens/primitive.rs:102-230` (declared by the `colour_primitives!` macro). 61 primitives. Hex is as written in source.

| Name        | Hex       | Ramp    | Source kind | Note (from source)                                                                                                                           | Citation         |
| ----------- | --------- | ------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| NEUTRAL_0   | #FFFFFF   | neutral | Sourced     | Space content background (measured)                                                                                                          | primitive.rs:104 |
| NEUTRAL_50  | #F2F1EE   | neutral | Sourced     | Artcraft light background (theme.rs 82)                                                                                                      | primitive.rs:106 |
| NEUTRAL_100 | #F3F9FF   | neutral | Sourced     | Space file-tree panel, measured (from the reference screenshot). Replaces Artcraft E9E8E4 (owner decision 2)                                 | primitive.rs:108 |
| NEUTRAL_200 | #BDBFC4   | neutral | Sourced     | Space sidebar/tree divider, measured (from the reference screenshot). Replaces Artcraft CECDCB (owner decision 2)                            | primitive.rs:110 |
| NEUTRAL_700 | #969A9E   | neutral | Sourced     | Space muted label 'Files', darkest pixel (measured). Decorative only: 2.7:1 on the tree panel, fails AA as text                              | primitive.rs:112 |
| NEUTRAL_500 | #7A8594   | neutral | Derived     | DERIVED: the measured divider hue darkened until it reaches 3:1 on base and sunken (replaces 767676)                                         | primitive.rs:114 |
| NEUTRAL_600 | #5E6B7C   | neutral | Derived     | DERIVED: Space muted hue, darkened to 4.8:1 on base. The measured Space muted label (969A9E) is 2.7:1 and fails AA                           | primitive.rs:116 |
| NEUTRAL_450 | #9AA4B2   | neutral | Derived     | DERIVED: cool version of the Artcraft dark muted; 6.6:1 or better on every dark surface                                                      | primitive.rs:118 |
| NEUTRAL_800 | #6B7587   | neutral | Derived     | DERIVED: cool dark faint, decorative only (about 4:1 on base)                                                                                | primitive.rs:120 |
| NEUTRAL_900 | #2F3540   | neutral | Derived     | DERIVED: cool dark hairline (decorative, replaces Artcraft 333436)                                                                           | primitive.rs:122 |
| NEUTRAL_300 | #B0B7C3   | neutral | Placeholder | No Space disabled state in the screenshot. Cool grey between the divider and the strong outline (replaces B9B8B4)                            | primitive.rs:124 |
| NEUTRAL_850 | #20242C   | neutral | Placeholder | No source. Between base and raised in dark, so disabled wells stay visible (cool)                                                            | primitive.rs:126 |
| NEUTRAL_750 | #3A4150   | neutral | Placeholder | No source. Dark outline for disabled controls (cool)                                                                                         | primitive.rs:128 |
| NEUTRAL_740 | #4B5362   | neutral | Placeholder | No source. Dark disabled checked fill (cool)                                                                                                 | primitive.rs:130 |
| NEUTRAL_680 | #77808F   | neutral | Placeholder | No source. Dark disabled text, exempt from contrast (cool)                                                                                   | primitive.rs:132 |
| NEUTRAL_400 | #7F8A9B   | neutral | Derived     | DERIVED: cool dark outline, 5.3:1 on dark base and 4.8:1 on dark raised (replaces 8C8C8C)                                                    | primitive.rs:134 |
| NEUTRAL_950 | #121316   | neutral | Sourced     | Artcraft dark background (theme.rs 102). Kept: owner decision 3 leaves the page background alone                                             | primitive.rs:136 |
| NEUTRAL_990 | #1B1E24   | neutral | Derived     | DERIVED: cool dark raised surface from the Space raised values (replaces 1A1B1F)                                                             | primitive.rs:138 |
| NEUTRAL_975 | #0A0C10   | neutral | Derived     | DERIVED: cool dark sunken well (replaces Artcraft 060607)                                                                                    | primitive.rs:140 |
| INK         | #101014   | neutral | Sourced     | Artcraft light ink (theme.rs 84)                                                                                                             | primitive.rs:142 |
| INK_DARK    | #0B0B0C   | neutral | Sourced     | Artcraft dark invert foreground (theme.rs 93)                                                                                                | primitive.rs:144 |
| BLACK       | #000000   | neutral | Sourced     | Scrim base colour (Artcraft scrim, theme.rs 149-152)                                                                                         | primitive.rs:146 |
| ROYAL_700   | #0F4E94   | royal   | Derived     | Owner choice 2026-11-14: sidebar background, same in light and dark                                                                          | primitive.rs:151 |
| ROYAL_800   | #14386C   | royal   | Derived     | Owner choice 2026-11-14: icon rail background, same in light and dark                                                                        | primitive.rs:153 |
| ROYAL_600   | #1158A7   | royal   | Derived     | Owner choice 2026-11-14: sidebar hover row, same in light and dark                                                                           | primitive.rs:155 |
| ROYAL_550   | #1364BE   | royal   | Derived     | Owner choice 2026-11-14: sidebar selected row, same in light and dark                                                                        | primitive.rs:157 |
| ROYAL_750   | #0A3F78   | royal   | Derived     | Owner choice 2026-11-14: sidebar divider, darker than ROYAL_700. Decorative (EXEMPT)                                                         | primitive.rs:159 |
| SLATE_150   | #E1E8F2   | slate   | Derived     | Owner choice 2026-11-14: sidebar text, 6.71:1 on ROYAL_700                                                                                   | primitive.rs:161 |
| SLATE_170   | #D0DCEF   | slate   | Derived     | Owner choice 2026-11-14: sidebar muted text, 5.98:1 on ROYAL_700, 5.09:1 on ROYAL_600. Not used on the selected row (4.3:1)                  | primitive.rs:163 |
| SLATE_110   | #E6ECF5   | slate   | Derived     | Owner choice 2026-11-14: sidebar icon, 7+:1 on ROYAL_700                                                                                     | primitive.rs:165 |
| SLATE_350   | #A3B8D6   | slate   | Derived     | Owner choice 2026-11-14: inactive rail icon, 5.73:1 on ROYAL_800                                                                             | primitive.rs:167 |
| BLUE_150    | #BDDBFF   | blue    | Derived     | Owner choice 2026-11-14: sidebar link text, 5.81:1 on ROYAL_700, 4.95:1 on ROYAL_600                                                         | primitive.rs:169 |
| BLUE_600    | #1659C4   | blue    | Sourced     | Artcraft light accent_ink (theme.rs 91). Fill behind white text (6.44:1); owner decision 1                                                   | primitive.rs:172 |
| BLUE_700    | #164FA8   | blue    | Derived     | Audit E.3 light hover (DERIVED)                                                                                                              | primitive.rs:174 |
| BLUE_800    | #123F80   | blue    | Derived     | Pressed state: BLUE_700 darkened about 12 percent (DERIVED)                                                                                  | primitive.rs:176 |
| BLUE_500    | #0D7FFF   | blue    | Sourced     | Space accent, measured (Save draft fill, MR chip; from the reference screenshot). Owner decision 1. Non-text only (replaces Artcraft 2D81FF) | primitive.rs:178 |
| BLUE_650    | #0968DA   | blue    | Derived     | DERIVED: Space blue darkened until link text reaches 4.64:1 on base (4.95:1 on sunken, 5.24:1 on white)                                      | primitive.rs:180 |
| BLUE_400    | #4DA0FF   | blue    | Derived     | DERIVED: lighter Space blue for dark surfaces. 6.9:1 on the dark base; INK_DARK text on it 7.3:1 (replaces Artcraft 74AAFF)                  | primitive.rs:182 |
| BLUE_300    | #8DBBFF   | blue    | Derived     | Audit E.3 dark hover (DERIVED)                                                                                                               | primitive.rs:184 |
| BLUE_200    | #5084DB   | blue    | Sourced     | Space tree selection bar (measured)                                                                                                          | primitive.rs:186 |
| GREEN_700   | #0A7563   | status  | Sourced     | Artcraft good, light (theme.rs 95)                                                                                                           | primitive.rs:189 |
| GREEN_300   | #3FD6B8   | status  | Sourced     | Artcraft good, dark (theme.rs 114)                                                                                                           | primitive.rs:191 |
| AMBER_700   | #8A5800   | status  | Sourced     | Artcraft warn, light (theme.rs 96)                                                                                                           | primitive.rs:193 |
| AMBER_300   | #FFC14D   | status  | Sourced     | Artcraft warn, dark (theme.rs 115)                                                                                                           | primitive.rs:195 |
| RED_700     | #B3261E   | status  | Sourced     | Artcraft bad, light (theme.rs 97)                                                                                                            | primitive.rs:197 |
| RED_800     | #8A1D17   | status  | Derived     | Pressed state: RED_700 darkened about 20 percent (DERIVED)                                                                                   | primitive.rs:199 |
| RED_300     | #FF6259   | status  | Sourced     | Artcraft bad, dark (theme.rs 116)                                                                                                            | primitive.rs:201 |
| RED_200     | #E8483F   | status  | Derived     | Pressed state: RED_300 darkened about 15 percent (DERIVED)                                                                                   | primitive.rs:203 |
| INFO_700    | #3B5BA9   | status  | Placeholder | No source. Blue-indigo, distinct from accent; about 5.7:1 on the light base                                                                  | primitive.rs:205 |
| INFO_300    | #9DB8FF   | status  | Placeholder | No source. Light blue for dark surfaces                                                                                                      | primitive.rs:207 |
| GREEN_50    | #E6F4F1   | status  | Derived     | Tone surface, light (DERIVED from GREEN_700 about 90 percent white, P0.16 batch 3)                                                           | primitive.rs:209 |
| AMBER_50    | #FBF3E0   | status  | Derived     | Tone surface, light (DERIVED from AMBER_700 about 90 percent white, P0.16 batch 3)                                                           | primitive.rs:211 |
| RED_50      | #FCEBEA   | status  | Derived     | Tone surface, light (DERIVED from RED_700 about 90 percent white, P0.16 batch 3)                                                             | primitive.rs:213 |
| INFO_50     | #EAEFFA   | status  | Derived     | Tone surface, light (DERIVED from INFO_700 about 90 percent white, P0.16 batch 3)                                                            | primitive.rs:215 |
| GREEN_950   | #0F2B27   | status  | Derived     | Tone surface, dark (DERIVED from GREEN_300 about 12 percent over NEUTRAL_950, P0.16 batch 3)                                                 | primitive.rs:217 |
| AMBER_950   | #2F2612   | status  | Derived     | Tone surface, dark (DERIVED from AMBER_300 about 12 percent over NEUTRAL_950, P0.16 batch 3)                                                 | primitive.rs:219 |
| RED_950     | #3A1816   | status  | Derived     | Tone surface, dark (DERIVED from RED_300 about 12 percent over NEUTRAL_950, P0.16 batch 3)                                                   | primitive.rs:221 |
| INFO_950    | #18213D   | status  | Derived     | Tone surface, dark (DERIVED from INFO_300 about 12 percent over NEUTRAL_950, P0.16 batch 3)                                                  | primitive.rs:223 |
| SCRIM_LIGHT | #00000069 | scrim   | Sourced     | Artcraft drawer scrim, light: alpha 105 (theme.rs 149-152)                                                                                   | primitive.rs:226 |
| SCRIM_DARK  | #000000AA | scrim   | Sourced     | Artcraft drawer scrim, dark: alpha 170                                                                                                       | primitive.rs:228 |
| SELECTION   | #0D7FFF99 | accent  | Derived     | Space accent blue at alpha 60 per cent (alpha DERIVED; owner decision 1, was Artcraft 2D81FF)                                                | primitive.rs:230 |

## 2. Semantic roles

Source: `src/tokens/semantic.rs`. Light constructor `Semantic::light()` at lines 193-284, dark `Semantic::dark()` at 287-378. Light and dark hex are the resolved values from `ui/generated/tokens.slint` (lines 25-82), which were checked against both constructors. "Light primitive" and "dark primitive" give the constant each role points at, with the line in `semantic.rs` where the reference is written.

| Role                           | Light hex | Dark hex  | Light primitive (semantic.rs line) | Dark primitive (semantic.rs line) | Slint property (tokens.slint line)  |
| ------------------------------ | --------- | --------- | ---------------------------------- | --------------------------------- | ----------------------------------- |
| surface.base                   | #F2F1EE   | #121316   | NEUTRAL_50 (196)                   | NEUTRAL_950 (290)                 | surface-base (25)                   |
| surface.raised                 | #FFFFFF   | #1B1E24   | NEUTRAL_0 (197)                    | NEUTRAL_990 (291)                 | surface-raised (26)                 |
| surface.sunken                 | #F3F9FF   | #0A0C10   | NEUTRAL_100 (198)                  | NEUTRAL_975 (292)                 | surface-sunken (27)                 |
| surface.overlay                | #FFFFFF   | #1B1E24   | NEUTRAL_0 (199)                    | NEUTRAL_990 (293)                 | surface-overlay (28)                |
| text.primary                   | #101014   | #F2F1EE   | INK (202)                          | NEUTRAL_50 (296)                  | text-primary (29)                   |
| text.muted                     | #5E6B7C   | #9AA4B2   | NEUTRAL_600 (203)                  | NEUTRAL_450 (297)                 | text-muted (30)                     |
| text.faint                     | #969A9E   | #6B7587   | NEUTRAL_700 (204)                  | NEUTRAL_800 (298)                 | text-faint (31)                     |
| text.on_accent                 | #FFFFFF   | #0B0B0C   | NEUTRAL_0 (205)                    | INK_DARK (299)                    | text-on-accent (32)                 |
| border.subtle                  | #BDBFC4   | #2F3540   | NEUTRAL_200 (208)                  | NEUTRAL_900 (302)                 | border-subtle (33)                  |
| border.track                   | #5E6B7C   | #5E6B7C   | NEUTRAL_600 (210)                  | NEUTRAL_600 (304)                 | border-track (34)                   |
| border.strong                  | #7A8594   | #7F8A9B   | NEUTRAL_500 (209)                  | NEUTRAL_400 (303)                 | border-strong (35)                  |
| accent.default                 | #0D7FFF   | #4DA0FF   | BLUE_500 (213)                     | BLUE_400 (307)                    | accent-default (36)                 |
| accent.hover                   | #0968DA   | #8DBBFF   | BLUE_650 (214)                     | BLUE_300 (308)                    | accent-hover (37)                   |
| accent.active                  | #1659C4   | #5084DB   | BLUE_600 (215)                     | BLUE_200 (309)                    | accent-active (38)                  |
| accent.text                    | #0968DA   | #4DA0FF   | BLUE_650 (216)                     | BLUE_400 (310)                    | accent-text (39)                    |
| accent.fill                    | #1659C4   | #4DA0FF   | BLUE_600 (217)                     | BLUE_400 (311)                    | accent-fill (40)                    |
| accent.fill.hover              | #164FA8   | #8DBBFF   | BLUE_700 (218)                     | BLUE_300 (312)                    | accent-fill-hover (41)              |
| accent.fill.active             | #123F80   | #5084DB   | BLUE_800 (219)                     | BLUE_200 (313)                    | accent-fill-active (42)             |
| focus.ring                     | #0D7FFF   | #4DA0FF   | BLUE_500 (221)                     | BLUE_400 (315)                    | focus-ring (43)                     |
| status.success                 | #0A7563   | #3FD6B8   | GREEN_700 (223)                    | GREEN_300 (317)                   | status-success (44)                 |
| status.warning                 | #8A5800   | #FFC14D   | AMBER_700 (224)                    | AMBER_300 (318)                   | status-warning (45)                 |
| status.danger                  | #B3261E   | #FF6259   | RED_700 (225)                      | RED_300 (319)                     | status-danger (46)                  |
| status.danger.active           | #8A1D17   | #E8483F   | RED_800 (226)                      | RED_200 (320)                     | status-danger-active (47)           |
| status.info                    | #3B5BA9   | #9DB8FF   | INFO_700 (227)                     | INFO_300 (321)                    | status-info (48)                    |
| rail.bg                        | #14386C   | #14386C   | ROYAL_800 (230)                    | ROYAL_800 (324)                   | rail-bg (49)                        |
| rail.icon.inactive             | #A3B8D6   | #A3B8D6   | SLATE_350 (231)                    | SLATE_350 (325)                   | rail-icon-inactive (50)             |
| rail.icon.active               | #FFFFFF   | #FFFFFF   | NEUTRAL_0 (232)                    | NEUTRAL_0 (326)                   | rail-icon-active (51)               |
| sidebar.bg                     | #0F4E94   | #0F4E94   | ROYAL_700 (235)                    | ROYAL_700 (329)                   | sidebar-bg (52)                     |
| sidebar.text                   | #E1E8F2   | #E1E8F2   | SLATE_150 (236)                    | SLATE_150 (330)                   | sidebar-text (53)                   |
| sidebar.text.muted             | #D0DCEF   | #D0DCEF   | SLATE_170 (237)                    | SLATE_170 (331)                   | sidebar-text-muted (54)             |
| sidebar.icon                   | #E6ECF5   | #E6ECF5   | SLATE_110 (238)                    | SLATE_110 (332)                   | sidebar-icon (55)                   |
| sidebar.hover.bg               | #1158A7   | #1158A7   | ROYAL_600 (239)                    | ROYAL_600 (333)                   | sidebar-hover-bg (56)               |
| sidebar.selected.bg            | #1364BE   | #1364BE   | ROYAL_550 (240)                    | ROYAL_550 (334)                   | sidebar-selected-bg (57)            |
| sidebar.selected.text          | #FFFFFF   | #FFFFFF   | NEUTRAL_0 (241)                    | NEUTRAL_0 (335)                   | sidebar-selected-text (58)          |
| sidebar.selected.indicator     | #FFFFFF   | #FFFFFF   | NEUTRAL_0 (242)                    | NEUTRAL_0 (336)                   | sidebar-selected-indicator (59)     |
| sidebar.link                   | #BDDBFF   | #BDDBFF   | BLUE_150 (243)                     | BLUE_150 (337)                    | sidebar-link (60)                   |
| sidebar.divider                | #0A3F78   | #0A3F78   | ROYAL_750 (244)                    | ROYAL_750 (338)                   | sidebar-divider (61)                |
| selection                      | #0D7FFF99 | #0D7FFF99 | SELECTION (246)                    | SELECTION (340)                   | selection (62)                      |
| scrim                          | #00000069 | #000000AA | SCRIM_LIGHT (247)                  | SCRIM_DARK (341)                  | scrim (63)                          |
| disabled.surface               | #F3F9FF   | #20242C   | NEUTRAL_100 (251)                  | NEUTRAL_850 (345)                 | disabled-surface (64)               |
| disabled.border                | #B0B7C3   | #3A4150   | NEUTRAL_300 (252)                  | NEUTRAL_750 (346)                 | disabled-border (65)                |
| disabled.fill                  | #B0B7C3   | #4B5362   | NEUTRAL_300 (253)                  | NEUTRAL_740 (347)                 | disabled-fill (66)                  |
| disabled.text                  | #969A9E   | #77808F   | NEUTRAL_700 (254)                  | NEUTRAL_680 (348)                 | disabled-text (67)                  |
| status.neutral.surface         | #F3F9FF   | #2F3540   | NEUTRAL_100 (258)                  | NEUTRAL_900 (352)                 | status-neutral-surface (68)         |
| status.neutral.border          | #7A8594   | #9AA4B2   | NEUTRAL_500 (259)                  | NEUTRAL_450 (353)                 | status-neutral-border (69)          |
| status.neutral.text_on_surface | #101014   | #F2F1EE   | INK (260)                          | NEUTRAL_50 (354)                  | status-neutral-text-on-surface (70) |
| status.success.surface         | #E6F4F1   | #0F2B27   | GREEN_50 (263)                     | GREEN_950 (357)                   | status-success-surface (71)         |
| status.success.border          | #0A7563   | #3FD6B8   | GREEN_700 (264)                    | GREEN_300 (358)                   | status-success-border (72)          |
| status.success.text_on_surface | #0A7563   | #3FD6B8   | GREEN_700 (265)                    | GREEN_300 (359)                   | status-success-text-on-surface (73) |
| status.warning.surface         | #FBF3E0   | #2F2612   | AMBER_50 (268)                     | AMBER_950 (362)                   | status-warning-surface (74)         |
| status.warning.border          | #8A5800   | #FFC14D   | AMBER_700 (269)                    | AMBER_300 (363)                   | status-warning-border (75)          |
| status.warning.text_on_surface | #8A5800   | #FFC14D   | AMBER_700 (270)                    | AMBER_300 (364)                   | status-warning-text-on-surface (76) |
| status.danger.surface          | #FCEBEA   | #3A1816   | RED_50 (273)                       | RED_950 (367)                     | status-danger-surface (77)          |
| status.danger.border           | #B3261E   | #FF6259   | RED_700 (274)                      | RED_300 (368)                     | status-danger-border (78)           |
| status.danger.text_on_surface  | #B3261E   | #FF6259   | RED_700 (275)                      | RED_300 (369)                     | status-danger-text-on-surface (79)  |
| status.info.surface            | #EAEFFA   | #18213D   | INFO_50 (278)                      | INFO_950 (372)                    | status-info-surface (80)            |
| status.info.border             | #3B5BA9   | #9DB8FF   | INFO_700 (279)                     | INFO_300 (373)                    | status-info-border (81)             |
| status.info.text_on_surface    | #3B5BA9   | #9DB8FF   | INFO_700 (280)                     | INFO_300 (374)                    | status-info-text-on-surface (82)    |

Non-colour semantic values: radius `control` = R5 (5 px), `surface` = R6 (6 px), `pill` = PILL (9999 px), `none` = R0 (0 px), same in both themes (`src/tokens/semantic.rs:184-189`). Overlay shadow: `ELEVATION_OVERLAY_LIGHT` (`semantic.rs:248`) and `ELEVATION_OVERLAY_DARK` (`semantic.rs:342`); Slint `shadow-overlay` is #00000024 light and #0000008C dark (`ui/generated/tokens.slint:83`).

Disabled tokens are documented as exempt from the minimums (`src/tokens/semantic.rs:112-113`). The feedback tones (`src/tokens/semantic.rs:137-145`) are the `status.<tone>.surface`, `.border` and `.text_on_surface` rows above; neutral tone uses `status.neutral.*`.

## 3. Contrast rules

Source: `src/tokens/contrast.rs`. Thresholds: text **4.5:1** (`TEXT_MIN`, line 12, WCAG 1.4.3). Non-text **3.0:1** (`NON_TEXT_MIN`, line 14, WCAG 1.4.11). `checked_pairs` (lines 134-350) builds the list for both themes. The test `every_pair_meets_its_minimum_in_both_themes` (lines 424-452) requires more than 40 pairs and zero failures. The test was not executed here; ratios were not recomputed.

### 3a. Pairs checked at 4.5:1 (text)

- text.primary, text.muted, accent.text on each of surface.base, surface.raised, surface.sunken, surface.overlay (lines 137-148).
- text.on_accent on accent.fill, accent.fill.hover, accent.fill.active (lines 150-161).
- status.success, status.warning, status.danger, status.info on surface.base and surface.raised (lines 164-172).
- Sidebar: sidebar.text on sidebar.bg (175-178); sidebar.text.muted on sidebar.bg (179-182); sidebar.link on sidebar.bg (183-186); sidebar.text on sidebar.hover.bg (187-190); sidebar.text.muted on sidebar.hover.bg (191-194); sidebar.selected.text on sidebar.selected.bg (195-198).
- Button text: button.{primary,secondary,ghost,danger}.text on each of its bg, bg_hover and bg_active (lines 303-312).
- Input: input.text and input.placeholder on input.bg (313-317).
- Tabs: tab.text on tab.bar.bg (323); tab.active.text on tab.active.bg (324-327).
- Table: table.row.text and table.row.text.muted on table.row.bg; table.row.text on table.row.bg.hover (332-343).
- Tooltip: tooltip.text on tooltip.bg (344-347).
- Feedback tones: text_on_surface and text.primary on each tone's surface (lines 297-298).

### 3b. Pairs checked at 3.0:1 (non-text)

- Sidebar: sidebar.icon on sidebar.bg (199-202); rail.icon.inactive and rail.icon.active on rail.bg (203-210); sidebar.selected.indicator on sidebar.bg (211-214).
- For each of the four surfaces (lines 217-229): focus.ring, border.strong, border.track, accent.default.
- checkbox.mark (text.on_accent) on accent.default (231-234).
- Switch: switch.thumb.off (surface.raised) on switch.track.off (border.strong) (239-242); switch.thumb.on (text.on_accent) on accent.default (243-246).
- Slider: slider.thumb (surface.base) on slider.track (accent.default) (248-251).
- Feedback tones: each tone's border on its surface (line 299).
- Input: input.border and input.border.focus on input.bg (318-322).
- Tabs: tab.indicator on tab.active.bg (328-331).

### 3c. EXEMPT list

Source: `src/tokens/contrast.rs:17-48`. Nine entries, each exempt from both minimums. Reasons are quoted from source.

| Token            | Reason (from source)                                                                                 | Line  |
| ---------------- | ---------------------------------------------------------------------------------------------------- | ----- |
| text.faint       | decorative or disabled only. Fails AA as text (audit C.18), so it must never carry text that is read | 19-20 |
| border.subtle    | decorative hairline, not a UI boundary                                                               | 22    |
| sidebar.divider  | decorative hairline inside the navy sidebar                                                          | 23-26 |
| selection        | alpha overlay. It is not composited here; text on it is checked against the surface behind           | 27-30 |
| scrim            | alpha overlay behind modal content                                                                   | 31    |
| disabled.text    | disabled label or glyph. Minimums do not apply to inactive controls (WCAG 1.4.3 and 1.4.11)          | 32-35 |
| disabled.surface | disabled fill, shown visible against its surface by eye, not by a minimum (inactive controls)        | 36-39 |
| disabled.border  | disabled outline, exempt as for disabled.surface                                                     | 40-43 |
| disabled.fill    | disabled checked fill, exempt as for disabled.surface                                                | 44-47 |

### 3d. Gaps between the checked pairs and what the Slint components draw

Observations from reading both sides. Ratios were not recomputed.

1. **Resting input and select outline uses an exempt token.** `ui/components/input.slint:144` draws the resting border with `Tokens.border-subtle`, which is exempt (`contrast.rs:22`). `ui/components/select.slint:355` does the same at rest. The checked pair for inputs is `input.border` = border.strong (`contrast.rs:318`), which Slint applies only on hover (`input.slint:144`). The resting field outline is therefore not checked at 3:1.
2. **Badge and Tag tone fills with on-accent ink are not checked.** `ui/components/badge.slint:13-22` draws success, warning, danger and info tones as filled chips with `text-on-accent` ink (`text-primary` for neutral). The checked list covers status text on surfaces (`contrast.rs:164-172`) but no status fill with on-accent text.
3. **Avatar initials are not checked.** `ui/components/avatar.slint:32` uses `text-on-accent` (dark) or `text-primary` (light) on the `border-strong` fill (`avatar.slint:41`). The comment at `avatar.slint:3-6` quotes 5.63:1 and 5.07:1, but no pair in `checked_pairs` covers it.
4. **Menu row highlight** is `button.ghost.bg_hover` (`ui/components/menu.slint:126-127`) behind `text.primary`; this combination is covered only through the ghost button pairs, not as a menu pair.

## 4. Component tokens, sizes, spacing, radius, motion, shadows

### 4a. Component tokens

Source: `src/tokens/component.rs`. `Component::from_semantic` (lines 78-141) copies semantic values only. Slint mirrors these in `ui/generated/tokens.slint` lines 87-107 (buttons) and 110-112 (tooltip).

| Alias            | Field        | Semantic source (component.rs line) | Light hex | Dark hex |
| ---------------- | ------------ | ----------------------------------- | --------- | -------- |
| button.primary   | bg           | accent.fill (84)                    | #1659C4   | #4DA0FF  |
| button.primary   | bg_hover     | accent.fill_hover (85)              | #164FA8   | #8DBBFF  |
| button.primary   | bg_active    | accent.fill_active (86)             | #123F80   | #5084DB  |
| button.primary   | text         | text.on_accent (87)                 | #FFFFFF   | #0B0B0C  |
| button.primary   | border       | accent.fill (88)                    | #1659C4   | #4DA0FF  |
| button.secondary | bg           | surface.raised (91)                 | #FFFFFF   | #1B1E24  |
| button.secondary | bg_hover     | surface.sunken (92)                 | #F3F9FF   | #0A0C10  |
| button.secondary | bg_active    | border.subtle (93)                  | #BDBFC4   | #2F3540  |
| button.secondary | text         | text.primary (94)                   | #101014   | #F2F1EE  |
| button.secondary | border       | border.strong (95)                  | #7A8594   | #7F8A9B  |
| button.ghost     | bg           | surface.base (98)                   | #F2F1EE   | #121316  |
| button.ghost     | bg_hover     | surface.sunken (99)                 | #F3F9FF   | #0A0C10  |
| button.ghost     | bg_active    | border.subtle (100)                 | #BDBFC4   | #2F3540  |
| button.ghost     | text         | text.primary (101)                  | #101014   | #F2F1EE  |
| button.ghost     | border       | surface.base (102)                  | #F2F1EE   | #121316  |
| button.danger    | bg           | status.danger (106)                 | #B3261E   | #FF6259  |
| button.danger    | bg_hover     | status.danger (107)                 | #B3261E   | #FF6259  |
| button.danger    | bg_active    | status.danger_active (108)          | #8A1D17   | #E8483F  |
| button.danger    | text         | text.on_accent (109)                | #FFFFFF   | #0B0B0C  |
| button.danger    | border       | status.danger (110)                 | #B3261E   | #FF6259  |
| input            | bg           | surface.raised (114)                | #FFFFFF   | #1B1E24  |
| input            | text         | text.primary (115)                  | #101014   | #F2F1EE  |
| input            | placeholder  | text.muted (116)                    | #5E6B7C   | #9AA4B2  |
| input            | border       | border.strong (117)                 | #7A8594   | #7F8A9B  |
| input            | border_focus | focus.ring (118)                    | #0D7FFF   | #4DA0FF  |
| tab              | bar_bg       | surface.sunken (121)                | #F3F9FF   | #0A0C10  |
| tab              | text         | text.muted (122)                    | #5E6B7C   | #9AA4B2  |
| tab              | active_bg    | surface.raised (123)                | #FFFFFF   | #1B1E24  |
| tab              | active_text  | text.primary (124)                  | #101014   | #F2F1EE  |
| tab              | indicator    | accent.default (125)                | #0D7FFF   | #4DA0FF  |
| table_row        | bg           | surface.raised (128)                | #FFFFFF   | #1B1E24  |
| table_row        | bg_hover     | surface.sunken (129)                | #F3F9FF   | #0A0C10  |
| table_row        | text         | text.primary (130)                  | #101014   | #F2F1EE  |
| table_row        | text_muted   | text.muted (131)                    | #5E6B7C   | #9AA4B2  |
| table_row        | border       | border.subtle (132)                 | #BDBFC4   | #2F3540  |
| tooltip          | bg           | surface.overlay (135)               | #FFFFFF   | #1B1E24  |
| tooltip          | text         | text.primary (136)                  | #101014   | #F2F1EE  |
| tooltip          | border       | border.subtle (137)                 | #BDBFC4   | #2F3540  |

Note: `component.rs:104` records that the danger button has no separate hover token, so hover keeps the fill. The `tab` and `table_row` aliases are not used by the Slint tab or table components as far as the slint files show; the Slint content tabs and tab strip draw their own colours (see section 6). `input.placeholder` is not drawn by `input.slint` (it uses `text-muted` directly, `input.slint:103`).

### 4b. Sizes

Source: `src/tokens/primitive.rs` `size` module, lines 259-310. Slint mirror: `ui/generated/tokens.slint:141-169`, all multiplied by `zoom-factor` (`tokens.slint:141`). Values are logical px.

| Token                       | px              | primitive.rs line | Slint property                         |
| --------------------------- | --------------- | ----------------- | -------------------------------------- |
| CONTROL_HEIGHT              | 34              | 261               | size-control-height (141)              |
| CONTROL_HEIGHT_SM           | 28              | 263               | size-control-height-sm (142)           |
| CONTROL_HEIGHT_LG           | 40              | 265               | size-control-height-lg (143)           |
| BADGE_HEIGHT                | 18              | 267               | size-badge-height (144)                |
| BADGE_DOT                   | 8               | 269               | size-badge-dot (145)                   |
| KBD_HEIGHT                  | 20              | 271               | size-kbd-height (146)                  |
| TAG_HEIGHT                  | 24              | 273               | size-tag-height (147)                  |
| AVATAR_SM / MD / LG         | 24 / 32 / 40    | 275-277           | size-avatar-sm/md/lg (148-150)         |
| PRESENCE_DOT                | 10              | 279               | size-presence-dot (151)                |
| PROGRESS_HEIGHT             | 6               | 281               | size-progress-height (152)             |
| SKELETON_LINE               | 12              | 283               | size-skeleton-line (153)               |
| SHEET_SM / MD / LG          | 320 / 400 / 560 | 285-287           | size-sheet-sm/md/lg (154-156)          |
| DIALOG_SM / MD / LG         | 384 / 480 / 640 | 289-291           | size-dialog-sm/md/lg (157-159)         |
| SIDEBAR_WIDTH               | 240             | 293               | size-sidebar-width (160)               |
| RAIL_WIDTH                  | 48              | 295               | size-rail-width (161)                  |
| PHONE_BREAKPOINT            | 600             | 297               | size-phone-breakpoint (162)            |
| TAB_BAR_HEIGHT              | 56              | 299               | size-tab-bar-height (163)              |
| SIDEBAR_ROW_HEIGHT          | 36              | 301               | size-sidebar-row-height (164)          |
| TREE_ROW_HEIGHT             | 30              | 303               | size-tree-row-height (165)             |
| MENU_ROW_HEIGHT             | 28              | 305               | size-menu-row-height (166)             |
| ICON_SMALL / MEDIUM / LARGE | 16 / 20 / 24    | 307-309           | size-icon-small/medium/large (167-169) |

Icon sizes also exist as `Icons.small-size` / `medium-size` / `large-size`, which multiply the token by `Tokens.text-factor` (`ui/icons.slint:8-10`), so icons scale with the text scale. Control heights do not (see section 7).

### 4c. Spacing scale

Source: `src/tokens/primitive.rs:233-245` (4 px base). Slint: `ui/generated/tokens.slint:129-138`.

| Token | px  | primitive.rs line | Slint          |
| ----- | --- | ----------------- | -------------- |
| S0    | 0   | 235               | space-0 (129)  |
| S1    | 4   | 236               | space-1 (130)  |
| S2    | 8   | 237               | space-2 (131)  |
| S3    | 12  | 238               | space-3 (132)  |
| S4    | 16  | 239               | space-4 (133)  |
| S5    | 20  | 240               | space-5 (134)  |
| S6    | 24  | 241               | space-6 (135)  |
| S8    | 32  | 242               | space-8 (136)  |
| S10   | 40  | 243               | space-10 (137) |
| S12   | 48  | 244               | space-12 (138) |

### 4d. Radius scale

Source: `src/tokens/primitive.rs:247-256`. Semantic mapping: `src/tokens/semantic.rs:147-158, 184-189`. Slint: `ui/generated/tokens.slint:119-126`.

| Token | px                                                | primitive.rs line | Slint                                                         |
| ----- | ------------------------------------------------- | ----------------- | ------------------------------------------------------------- |
| R0    | 0                                                 | 249               | radius-none (123), used via semantic `none`                   |
| R4    | 4                                                 | 250               | radius-r4 (124)                                               |
| R5    | 5                                                 | 251               | radius-control (120) (semantic `control`)                     |
| R6    | 6                                                 | 252               | radius-surface (121) (semantic `surface`) and radius-r6 (125) |
| R8    | 8                                                 | 253               | radius-r8 (126)                                               |
| PILL  | 9999 (clamped to half the height by the renderer) | 255               | radius-pill (122)                                             |

### 4e. Motion

Source: `src/tokens/primitive.rs:312-323`. Resolution with reduced motion: `src/motion.rs:162-173`. Slint: `ui/generated/tokens.slint:171-175`.

| Token            | Value                            | primitive.rs line | Slint                |
| ---------------- | -------------------------------- | ----------------- | -------------------- |
| DURATION_FAST_MS | 120 ms                           | 314               | motion-fast (172)    |
| DURATION_BASE_MS | 200 ms                           | 315               | motion-base (173)    |
| DURATION_SLOW_MS | 320 ms                           | 316               | motion-slow (174)    |
| DURATION_LOOP_MS | 1200 ms                          | 318               | motion-loop (175)    |
| EASE_STANDARD    | cubic-bezier(0.2, 0.0, 0.0, 1.0) | 320               | not emitted to Slint |
| EASE_ENTER       | cubic-bezier(0.3, 0.0, 0.0, 1.0) | 322               | not emitted to Slint |

Usage in Slint: `Tokens.motion-base` for the switch thumb (`ui/components/switch.slint:112`), the app-shell slide (`ui/app-shell.slint:2572, 2600`, `ease-out`), the stories (`ui/stories.slint:335`); `Tokens.motion-slow` as the tooltip hover delay (`ui/components/tooltip.slint:173-174`). Easings are hard-coded in Slint, not taken from the tokens: `ease-in-out` (`switch.slint:112`, `progress.slint:39`, `skeleton.slint:27`), `ease-out` (`app-shell.slint:2572, 2600`, `sheet.slint:190`), `linear` (`spinner.slint:39`). None of these use `EASE_STANDARD` or `EASE_ENTER`.

Reduced motion: `motion-*` durations are `reduced-motion ? 0ms : <value>` in the generated file (`tokens.slint:172-175`). The codegen test `every_motion_duration_is_zero_under_reduced_motion` (`src/slint_ui/codegen.rs:357-366`) enforces it. The comment in `codegen.rs:279` says "Easings are in ui/motion.slint", but **`ui/motion.slint` does not exist** in the crate.

### 4f. Shadows and scrim

Source: `src/tokens/primitive.rs:325-345` (elevation), `primitive.rs:225-228` (scrim).

| Token                   | Value                                      | Source line          | Slint                                                                          |
| ----------------------- | ------------------------------------------ | -------------------- | ------------------------------------------------------------------------------ |
| ELEVATION_OVERLAY_LIGHT | offset-y 8, blur 24, alpha 36 (#24) black  | primitive.rs:334-338 | shadow-overlay #00000024 (tokens.slint:83); offset-y 8px and blur 24px (84-85) |
| ELEVATION_OVERLAY_DARK  | offset-y 8, blur 24, alpha 140 (#8C) black | primitive.rs:341-345 | shadow-overlay #0000008C (tokens.slint:83)                                     |
| SCRIM_LIGHT             | #00000069 (alpha 105)                      | primitive.rs:226     | scrim (63)                                                                     |
| SCRIM_DARK              | #000000AA (alpha 170)                      | primitive.rs:228     | scrim (63)                                                                     |

Overlay shadow users in Slint: tooltip bubble (`ui/components/tooltip.slint:221-223`), dialog panel (`ui/components/dialog.slint:190-192`), menu panels (`ui/components/menu.slint:618-620`), select popup (`ui/components/select.slint` overlay shadow). Scrim users: the dialog backdrop (`ui/components/dialog.slint:160-166`).

## 5. Typography

Source: `src/tokens/typography.rs` `style()` at lines 74-141, scale at 143-185. Slint: `ui/typography.slint` (the `Type` global, lines 12-70), generated values in `ui/generated/tokens.slint:177-213`.

| Style       | Family                | Size px | Line height px | Weight | Italic | typography.rs lines | Slint `Type` property                      |
| ----------- | --------------------- | ------- | -------------- | ------ | ------ | ------------------- | ------------------------------------------ |
| display     | UI (Noto Sans)        | 32      | 40             | 600    | no     | 77-83               | `Type.display` (ui/typography.slint:17-22) |
| title       | UI                    | 26      | 34             | 600    | no     | 84-90               | `Type.title` (23-28)                       |
| heading     | UI                    | 22      | 30             | 600    | no     | 91-97               | `Type.heading` (29-34)                     |
| subheading  | UI                    | 16      | 24             | 600    | no     | 98-104              | `Type.subheading` (35-40)                  |
| body        | UI                    | 14      | 20             | 400    | no     | 105-111             | `Type.body` (41-46)                        |
| body-strong | UI                    | 14      | 20             | 600    | no     | 112-118             | `Type.body-strong` (47-52)                 |
| label       | UI                    | 13.5    | 18             | 500    | no     | 119-125             | `Type.label` (53-58)                       |
| caption     | UI                    | 12      | 16             | 400    | no     | 126-132             | `Type.caption` (59-64)                     |
| code        | Mono (JetBrains Mono) | 13      | 18             | 400    | no     | 133-139             | `Type.code` (65-70)                        |

Families: `src/fonts.rs:7` `UI_FAMILY = "Noto Sans"`; `src/fonts.rs:9` `MONO_FAMILY = "JetBrains Mono"`. Both are bundled (SIL OFL 1.1, `src/fonts.rs:1`).

Text scale: `TextScale` enum P100 / P125 / P150 / P200 (`src/tokens/typography.rs:145-151`). Factors 1.0, 1.25, 1.5, 2.0 (`typography.rs:157-164`). Percent values 100 / 125 / 150 / 200 (`typography.rs:167-174`). `from_percent` accepts only those four (`typography.rs:177-179`). Rounding: `scaled(px) = round(px * factor * 2) / 2` (`typography.rs:183-185`), so sizes land on 0.5 px. Slint mirrors this as `Type.scaled` (`ui/typography.slint:13-15`), using `Tokens.text-factor` (`ui/generated/tokens.slint:19`). Default scale 100 (`tokens.slint:18`).

Gap: `TextStyle` has no italic in Slint (the struct at `ui/typography.slint:5-10` has family, size, line-height and weight only). The Rust `italic` field is always false (`typography.rs:70`).

## 6. Per-component metrics

Base path for every citation: `ui/components/<file>.slint` unless noted. Heights are at the default scale (text-scale 100, zoom 100). "Focus ring" lists how the keyboard focus indicator is drawn. Components that are not interactive have no focus ring.

### 6.1 Button (`button.slint`)

- Variants (enum): primary, secondary, ghost, danger, link (`button.slint:17`). Extra flags: `square`, `grouped`, `square-corners`, `loading`, `on-sidebar`, `ghost-toggle`, `selected`, `bold`, `elide` (lines 33-70).
- Sizes (enum): sm, md, lg (`button.slint:18`). Heights: sm 28 (`size-control-height-sm`), md 34, lg 40 (lines 102-104, applied at 123).
- Horizontal padding: sm 8 (space-2), md 12 (space-3), lg 16 (space-4) (lines 105-107). Square: 0 (line 143). Gap between icon and label: 8 (space-2), or 12 when `elide` (line 145).
- Icon size: 16 (`size-icon-small`), or 20 (`size-icon-medium`) for lg (line 108).
- Font: `Type.label` (13.5 px, line-height 18, weight 500) (lines 163-165). `bold` uses `Type.body-strong` weight (line 165).
- Radius: 5 px (`radius-control`) (line 129). 0 when `grouped` or `square-corners`.
- Min/max width: square = control height; otherwise the content's preferred width (lines 127-128).
- Border: 1 px at rest in the variant's border colour (line 135, 139). 0 when grouped (line 135).
- Focus ring: the border becomes 2 px in `focus-ring` (`button.slint:135-137`). Keyboard focus only: `focus-on-click: false` (line 212). Enter and Space activate (lines 213-217).
- Disabled: fill `disabled-surface` (line 131), text `disabled-text` (line 100), border `disabled-border` (line 139).

### 6.2 IconButton (`icon-button.slint`)

- Inherits Button (`icon-button.slint:10`). `square: true` (line 23), so width equals height: sm 28, md 34 (Button default `size: ButtonSize.md`, `button.slint:34`), lg 40.
- Icon: `icon` property, passed to `leading-icon` (lines 12, 25). Accessible label required (`label`, lines 14, 26).
- Tooltip: `tooltip` text and `tooltip-shortcut` keys (lines 16-18). Escape dismisses (line 28).
- Variants, radius, focus ring and padding: as Button (6.1). The dialog close control uses `variant: ButtonVariant.ghost, size: ButtonSize.sm` (`ui/components/dialog.slint:226-231`).

### 6.3 Input (`input.slint`)

- Sizes (enum): sm, md, lg (`input.slint:18`). Heights: sm 28, md 34, lg 40 (lines 104-106, applied at 135).
- Min width 120 (line 136). Horizontal stretch 1 (line 137).
- Padding: left 12 (space-3), right 8 (space-2); gap 8 (lines 154-156). Leading icon 16, or 20 for lg (line 107).
- Font: `Type.body` (14 px, line-height 20, weight 400) for text, placeholder and trailing addon (lines 183-185, 197-199, 232-234).
- Radius: 5 px (`radius-control`) (line 138). Clear and password actions: radius 5 (line 30), width equals height (line 29).
- Background: `surface-raised`, or `disabled-surface` when disabled (line 139).
- Border: 1 px. At rest `border-subtle` (line 144). On hover `border-strong` (line 144). Invalid `status-danger-border` (line 142). Disabled `disabled-border` (line 143). Focused: 2 px `focus-ring` (lines 140-141).
- Focus ring on the clear and password actions: 2 px `focus-ring` (lines 31-32). They are Tab stops (`input.slint:10`).
- Selection colours: `accent-fill` background, `text-on-accent` foreground (lines 200-201).

### 6.4 Select (`select.slint`)

- Sizes (enum): sm, md, lg (`select.slint:36`). Heights: sm 28, md 34, lg 40 (control height, lines 231-233; applied at 346).
- Min width 160 (line 347).
- Padding: left 12 (space-3), right 8 (space-2); gap 8 (lines 382-384). Icon 16, or 20 for lg (line 241).
- Font: sm `Type.label` (13.5, weight 500) (line 236); md `Type.body` (14, weight 400) (line 239); lg `Type.subheading` size 16 / line-height 24 at body weight 400 (line 238).
- Radius: 5 px (`radius-control`) (line 349). Popup panel radius 6 px (`radius-surface`) (line 519), border 1 px `border-subtle` (lines 517-518), shadow overlay (lines 520-522).
- Border: 1 px at rest `border-subtle` (line 355). Hover or open: `border-strong` (line 355). Invalid: `status-danger-border` (line 353). Focused: 2 px `focus-ring` (lines 351-352).
- Menu rows: 28 px (`size-menu-row-height`), or 32 px for lg (line 234). Group headings 0.75 of a row (line 252). Maximum visible rows 8 (line 202). Gap between trigger and menu: space-1 (4 px) (line 510).
- Focus: the trigger is the one focus stop (`select.slint:10-15`).

### 6.5 Badge (`badge.slint`)

- Tones (enum): neutral, accent, success, warning, danger, info (`badge.slint:7`).
- Count badge height 18 (line 44); dot 8 (line 44). Width: max(18, label width + 16) (line 45). Count above `max` shows "<max>+" (line 39, default max 99 at line 31).
- Horizontal padding 8 each side (line 45).
- Font: `Type.caption` (12 px, line-height 16, weight 400) (lines 57-59).
- Radius: pill (line 46). Border 1 px, colour `ToneColours.edge` (lines 48-49, 23-25).
- Fill per tone (lines 12-19): neutral `surface-sunken`; accent `accent-fill`; success `status-success`; warning `status-warning`; danger `status-danger`; info `status-info`. Ink (lines 20-22): neutral `text-primary`; others `text-on-accent`.
- Focus ring: none (not interactive).

### 6.6 Checkbox (`checkbox.slint`)

- Sizes (enum): sm, md (`checkbox.slint:20`). Box: sm 16, md 20 (line 39).
- Row height: max(28, layout preferred height) (line 79). Min width 16 (line 78).
- Gap between box and label: 8 (space-2) (line 83).
- Label: `Type.label` (13.5 px, weight 500) (lines 137-139), colour `text-primary` or `disabled-text` (line 51).
- Box radius: 4 px (`radius-r4`) (line 95). Border 1 px (line 97). Unchecked border `border-strong` (line 47); invalid `status-danger` (line 47); filled box `accent-default` (line 47); disabled `disabled-fill` or `disabled-border` (line 46). Unchecked fill `surface-base` (line 44).
- Check glyph: box minus 4 px (`space-1`) (lines 103-104). Indeterminate bar: 8 px wide on sm, 12 px on md, 2 px tall (lines 110-112).
- Focus ring: a 2 px `focus-ring` outline around the box, offset 4 px outward (box + 8 px), radius 6 px (`radius-r6`) (lines 118-128). Keyboard focus only (`focus-on-click: false`, line 154).
- Space toggles (line 156). Enter does nothing, per the header (line 9).

### 6.7 Switch (`switch.slint`)

- Sizes (enum): sm, md (`switch.slint:20`). Track: sm 28 x 16, md 36 x 20 (lines 39-40). Thumb: sm 12, md 16 (line 41). Thumb inset 2 px (line 43).
- Row height: sm 28 (`size-control-height-sm`), md 34 (`size-control-height`) (line 71). Min width is the track width (line 72).
- Label gap 8 (line 76). Label `Type.label` (lines 83-85, 134-136).
- Track radius: pill (line 101). Thumb radius: pill (line 109).
- Colours: on track `accent-default`, off track `border-strong`, disabled track `disabled-fill` or `disabled-border` (lines 47-49). Thumb: on `text-on-accent`, off `surface-raised` (line 50).
- Motion: the thumb animates `x` over `Tokens.motion-base` with `ease-in-out` (`switch.slint:112`). The easing is hard-coded, not a token. Reduced motion zeroes the duration.
- Focus ring: a 2 px `focus-ring` outline, 4 px outside the track, pill radius (lines 117-127). Keyboard focus only (line 151). Space and Enter toggle (lines 153-154).

### 6.8 Tabs (`content-tabs.slint`, Tabs component)

- Enum or variant: a single underline style. Tabs are an array of `ContentTab` (line 18-20). Active tab index is two-way (line 25).
- Height: `size-control-height`, 34 (line 77). Minimum width 120 (line 78).
- Tab cell: height equals the row, radius 5 (`radius-control`) (lines 88-90). Horizontal padding 12 each side (`space-3`) (lines 96-97). Gap between tabs 4 (`space-1`) (line 84).
- Font: `Type.body` (14, line-height 20). Active: `Type.body-strong` (weight 600) in `text-primary`. Inactive: weight 400 in `text-muted` (lines 102-105).
- Underline: 2 px `accent-default` under the active tab (lines 112-118). Row rule: 1 px `border-subtle` across the bottom (lines 130-137).
- Focus ring: a 2 px `focus-ring` border on the roving-focus tab cell while the list has keyboard focus (lines 37, 91-92).
- Keyboard: Right and Left move focus with wrap; Home and End; Enter and Space activate (lines 143-165).

Shell tab strip (`tabs.slint`, not a content tab): strip height `size-control-height` 34 by default (line 60). Unpinned tab width 136 (`size-control-height * 4`, line 53). Pinned width 34 (line 55). Close control 28 (line 62). Tab radius 0 (`radius-none`, line 168). Focus ring 2 px `focus-ring` (lines 166-167). Label `Type.body` (lines 178-180). Keyboard: roving focus, Delete closes an unpinned tab (`tabs.slint:14-25`).

### 6.9 Avatar (`avatar.slint`)

- Sizes (enum): sm, md, lg (`avatar.slint:13`). Diameter: 24, 32, 40 (lines 30-31, tokens size-avatar-*). Whole-pixel size (lines 38-39).
- Shape: circle, radius = half the height (line 40). Fill `border-strong` (line 41). Clipped only when a picture is shown (line 43).
- Initials: `Type.body-strong` (14 px, line-height 20, weight 600) (lines 56-58). Colour: `text-on-accent` in dark, `text-primary` in light (line 32).
- Presence (enum: none, online, away, busy, offline; line 14): dot 10 px (`size-presence-dot`) at bottom-right (lines 64-68). Colour success, warning, danger, or `border-strong` for offline (lines 70-72). Ring 2 px `surface-raised` (lines 73-74).
- Stack (`AvatarStack`): overlap step is diameter minus 8 px (line 91). Overflow chip "+N": pill radius, 1 px `border-strong` border, caption text (lines 106-127). `max` default 4 (line 82).
- Focus ring: none (`avatar.slint:9` says not interactive).

### 6.10 Kbd (`kbd.slint`)

- Not a variant component. Each key is a cap; keys are passed as a list (`kbd.slint:11`).
- Cap height 20 (`size-kbd-height`) (line 31). Cap width max(20, text width + 8) (line 30).
- Cap radius 4 px (`radius-r4`) (line 32). Border 1 px `border-strong` (lines 34-35). Background `surface-raised` (line 33).
- Font: `Tokens.type-code-family` / `size` / `weight` (JetBrains Mono, 13 px, line-height 18, weight 400) (lines 42-44). Note: the component reads the generated Tokens directly, not `Type.code`.
- Separator "+" between caps: `Type.caption`, `text-muted` (lines 20-27). Gap between caps 4 px (`space-1`) (lines 13, 17).
- Focus ring: none (non-interactive, `kbd.slint:4-5`).

### 6.11 Tag (`tag.slint`)

- Tones: the same six as Badge, through `ToneColours` (`tag.slint:18`, `badge.slint:7`). `on-sidebar` flag (line 29).
- Height 24 (`size-tag-height`) (line 36). Radius 5 (`radius-control`) (line 38).
- Horizontal padding: left 8 (space-2) (line 47); right 4 (space-1) when removable, else 8 (line 48). Gap 4 (line 49).
- Font: `Type.caption` (12 px, weight 400) (lines 55-57).
- Border 1 px. Edge colour: `ToneColours.edge` (line 41), or `sidebar-text-muted` on the sidebar (line 41).
- Remove button: icon 16 (`Icons.small-size`) (lines 64, 77). Accessible name `remove-label` (lines 26, 69). Enter and Space call `removed` (lines 99-101).
- Focus ring: a 2 px `focus-ring` border drawn outside the whole tag, offset 3 px (x and y = -3 px, size + 6 px), radius 8 px (`radius-control + 3px`) (lines 121-130). It shows only when the remove button has keyboard focus or `forced-state == 3` (line 122).

### 6.12 Dialog (`dialog.slint`)

- Sizes (enum): sm, md, lg (line 29). Panel width: sm 384, md 480, lg 640 (lines 70-72). Capped at host width minus 2 x 16 px (line 184).
- Panel padding 24 (`space-6`) (line 209). Gap between blocks 16 (`space-4`) (line 210).
- Title: `Type.heading` (22 px, line-height 30, weight 600) (lines 215-221). Description: `Type.body` (lines 238-245).
- Footer: buttons right-aligned, gap 8 (`space-2`) (lines 249-260).
- Panel: radius 6 px (`radius-surface`), 1 px `border-subtle` border, `surface-overlay` background, overlay shadow (lines 186-192).
- Scrim: `scrim` token behind the panel (line 165). Backdrop closes when `dismissible` (lines 168-178).
- Close control: IconButton, ghost, sm (lines 226-231).
- Focus trap: first stop `keys`, last stop `end` (lines 111, 265). Escape or Back closes when dismissible (lines 122-140).
- Focus ring: from the buttons inside (see Button).

### 6.13 Tooltip (`tooltip.slint`)

- Bubble: `tooltip-bg` fill (line 217), 1 px `tooltip-border` (lines 218-219), radius 5 (`radius-control`) (line 220), overlay shadow (lines 221-223).
- Padding: x 8 (`space-2`), y 4 (`space-1`) (lines 228-231). Gap between text and shortcut 8 (line 232).
- Font: `Type.caption` (12 px, line-height 16, weight 400) (lines 238-240). Shortcut: `Kbd` (lines 244-247).
- Gap from anchor: 4 px (`space-1`) (line 189).
- Placement: top (default) or bottom (line 25, 89).
- Hover delay: `Tokens.motion-slow`, 320 ms (lines 173-174, comment at line 12).
- Focus: a keyboard-focused anchor shows the tooltip at once (lines 11, 103). No ring of its own.

### 6.14 Menu (`menu.slint`; also ContextMenu)

- Item kinds (enum): item, separator, heading, submenu (`menu.slint:29`). Checks: none, off, on (line 31).
- Row height: 28 px (`size-menu-row-height`) (default `item-height`, line 211). Headings 0.75 of a row (line 97). Separator 17 px (`space-2 * 2 + 1px`) (line 212).
- Panel width: min 220, max 360 (`menu.slint:384-385`); ContextMenu the same (lines 501-502).
- Row padding: left `space-2` (8) plus 16 (`space-4`) per depth (line 131); right 8 (line 132). Gap 8 (line 133). Icons 16 (lines 137-150).
- Label: `Type.body` (14 px, weight 400) (lines 158-160). Shortcut or caption: `Type.caption` (lines 169-171).
- Row highlight: `button-ghost-bg-hover`, radius 5 (`radius-control`) (lines 126-128).
- Panel: 1 px `border-subtle`, radius 6 (`radius-surface`), overlay shadow (lines 615-620). Content padding 4 (`space-1`) (line 468; panel-height at line 527).
- Focus: the list takes keyboard focus on open (`focus-request`, lines 209-210, 225-226). No drawn focus ring on rows was found (no focus-ring border in `menu.slint`); the highlight tint is the only keyboard indicator. Recorded as a gap.

### 6.15 Gap summary for the listed components

- Only Button, IconButton, Input, Select, Checkbox, Switch and Tabs draw a keyboard focus ring. Tag draws one around the tag. Menu uses only the highlight tint (see 6.14).
- Heights match the tokens in every case checked (Button, Input, Select, Switch, Tabs, Checkbox, Tag, Kbd, Badge, Avatar, Dialog, Tooltip, Menu).

## 7. Theme mechanism

- **Choice enum**: `ThemeChoice { light, dark, system }` (`ui/generated/tokens.slint:10`). Default `system` (line 13). Rust maps `ThemeMode` to it with `choice()` (`src/slint_ui/theme.rs:35-41`).
- **Rust mode**: `ThemeMode { Light, Dark, System }`, default `System` (`src/theme.rs:7-13`). `resolve(system_dark)` (lines 17-23). The setter `set_mode` writes `Tokens.theme` (`src/slint_ui/theme.rs:44-46`). Called from `src/slint_ui/app_shell.rs:1598` and `src/slint_ui/app_shell.rs:3132` (the toggle).
- **Resolution in Slint**: `Tokens.dark` is true for dark, or for system when `Palette.color-scheme == ColorScheme.dark` (`tokens.slint:14`). The comment at `tokens.slint:8-9` says the window backend updates the palette when the OS theme changes, so no Rust call is needed.
- **Reduced motion**: flag `reduced-motion` (in-out, default false, `tokens.slint:15-16`). Every `motion-*` duration becomes 0 when set (`tokens.slint:172-175`). Rust setter `set_reduced_motion` (`src/slint_ui/theme.rs:54-56`). Pure-Rust resolver `Motion::resolve(reduced)` (`src/motion.rs:162-173`) and `display::motion_duration_ms` (`src/slint_ui/display.rs:65-67`).
- **Reduced motion is not wired in the app.** Searching all Rust sources for the setter and the resolver: the only callers are `apps/gallery/src/harness.rs:184` (gallery harness), and tests (`tests/ui/display.rs:99-109`, `tests/ui/sheet.rs:149-155`, `src/motion.rs:41-49` and `src/slint_ui/display.rs:120-121`). No settings, OS, or `app_shell.rs` code calls `set_reduced_motion`. `tokens.slint:15` says the OS setting is not readable from Slint. The app therefore always animates.
- **Text scale**: `Tokens.text-scale-percent` (in-out int, default 100; `tokens.slint:17-18`), `text-factor` = percent / 100 (line 19). Rust `TextScale` P100 to P200 (`src/tokens/typography.rs:145-185`). Setter `set_text_scale` (`src/slint_ui/theme.rs:59-61`).
- **Text scale is not wired in the app.** Callers: `apps/gallery/src/harness.rs:151` and the gallery CLI `apps/gallery/src/main.rs:101`. Nothing in the app shell sets it, so the app is always at 100.
- **Text scale does not reach controls.** Control heights and paddings use `zoom-factor` only (`tokens.slint:141-143`, `129-138`). Only `Type.*` sizes and icon sizes use `text-factor` (`ui/typography.slint:13-15`, `ui/icons.slint:8-10`). At a larger text scale, control heights would not grow with the text. Not verified visually.
- **Interface zoom (not in the plan's token list, but present)**: `Tokens.zoom-percent` (in-out int, default 100, 50 to 150 per the comment at `tokens.slint:20-22`) and `zoom-factor` (line 22). Every length token multiplies by it (`tokens.slint:84-85, 120-175`). Codegen emits `px * zoom-factor` (`src/slint_ui/codegen.rs:32-35`). App wiring: `src/slint_ui/app_shell.rs:1707-1711` (`on_zoom_changed` sets `zoom-applied`).
- **Generated file**: `ui/generated/tokens.slint` is generated from `src/tokens` by `src/slint_ui/codegen.rs`. Header lines 1-4 say it must not be edited and name the test `generated_tokens_are_up_to_date`. Regenerate command in the header: `cargo run -p rimelight_ui --example gen_slint_tokens` (not run).

## 8. Items not determined

- `PLAN.md` section 8.5 and 8.6 (cited as the source of every value in `primitive.rs:4-5`) are not in the audit source set. The Sourced / Derived / Placeholder labels were taken from the code, not checked against the plan or the Space and Artcraft references.
- Contrast ratios were not recomputed. The tests in `src/tokens/contrast.rs` (lines 424-452 and 454-500) are the authority and were not run (no cargo, per the task). Ratios quoted in comments were not checked.
- `ui/generated/tokens.slint` was compared against the Rust constructors by reading, not by regenerating. The `generated_tokens_are_up_to_date` test was not run.
- Per-component details were read from `ui/components/*.slint` for the listed components only. `select.slint` and `menu.slint` were read by targeted line ranges (grep and sed), not end to end. `tabs.slint` (shell tab strip) was read in part.
- Rendered appearance (focus-ring visibility, text clipping at larger scales) was not checked; the metrics above are from the source.
- The `tab` and `table_row` component aliases (`src/tokens/component.rs:40-58`) have no Slint consumer that was found. Not confirmed exhaustively.
- `ui/motion.slint` is referenced by `src/slint_ui/codegen.rs:279` but does not exist in `ui/`.
