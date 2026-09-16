---
name: rimelight-cms
description: Manage Rimelight CMS content, pages, blog posts, documentation, templates, taxonomies, bylines, versions, structured collections, and e-commerce products via MCP tools and Drizzle schemas.
---

# Rimelight CMS Agent Skill

This skill equips AI agents to programmatically create, manage, query, mutate, and publish all content, templates, taxonomies, bylines, dynamic collection schemas, and e-commerce products in Rimelight CMS.

---

## Available MCP Tools Suite

All operations are executed via the `rimelight-cms` MCP JSON-RPC interface (`/api/cms/mcp`):

### 1. Pages & In-Progress Drafts

| Tool                 | Purpose                                         | Key Arguments                                                                                                |
| -------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `cms_list_pages`     | List pages with optional filters                | `type`, `includeDrafts`, `limit`, `offset`                                                                   |
| `cms_get_page`       | Get complete page + block tree + active draft   | `slugOrId` (slug or UUID)                                                                                    |
| `cms_create_page`    | Create new page record + initial draft          | `slug`, `type`, `title`, `description`, `templateId`, `tags`, `authorIds`, `bylines`, `blocks`, `properties` |
| `cms_update_page`    | Update metadata, blocks, bylines, or properties | `id`, `slug`, `title`, `description`, `tags`, `bylines`, `blocks`, `properties`                              |
| `cms_create_draft`   | Save/update draft blocks without publishing     | `pageId`, `userId`, `blocks`, `properties`                                                                   |
| `cms_publish_page`   | Publish draft, creating an immutable version    | `pageId`, `userId`, `changeSummary`                                                                          |
| `cms_unpublish_page` | Revert live page to draft status                | `pageId`                                                                                                     |
| `cms_delete_page`    | Soft-delete a page                              | `pageId`                                                                                                     |

### 2. Page Templates & Starter Scaffolds

| Tool                  | Purpose                                                  | Key Arguments                                                                                                                                   |
| --------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `cms_list_templates`  | List all reusable page templates                         | `pageType` (optional)                                                                                                                           |
| `cms_get_template`    | Get template schema, default properties & starter blocks | `slugOrId` (slug or UUID)                                                                                                                       |
| `cms_create_template` | Create a new reusable page template                      | `slug`, `title`, `description`, `pageType`, `version`, `allowedRoles`, `rolePermissions`, `approvalRules`, `defaultProperties`, `initialBlocks` |
| `cms_update_template` | Update template properties or starter blocks             | `id`, `slug`, `title`, `description`, `pageType`, `version`, `defaultProperties`, `initialBlocks`, `rolePermissions`, `approvalRules`           |
| `cms_delete_template` | Delete a page template                                   | `id`                                                                                                                                            |

### 3. Dynamic Content Types & E-Commerce Collections

| Tool                      | Purpose                                                 | Key Arguments                                                                                             |
| ------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `cms_list_content_types`  | List all dynamic collections & e-com schemas            | _(none)_                                                                                                  |
| `cms_get_content_type`    | Get dynamic collection schema definition                | `slugOrId` (slug or UUID)                                                                                 |
| `cms_create_content_type` | Create dynamic schema (document, data table, singleton) | `slug`, `name`, `description`, `icon`, `mode`, `fieldSchema`, `ecomSettings`, `initialBlocks`, `isSystem` |
| `cms_update_content_type` | Update dynamic schema definition or ecom settings       | `id`, `slug`, `name`, `description`, `icon`, `mode`, `fieldSchema`, `ecomSettings`, `initialBlocks`       |
| `cms_delete_content_type` | Delete a custom dynamic schema                          | `id`                                                                                                      |

### 4. Author & Contributor Bylines

| Tool                | Purpose                              | Key Arguments                                                                        |
| ------------------- | ------------------------------------ | ------------------------------------------------------------------------------------ |
| `cms_list_bylines`  | List all registered bylines/authors  | _(none)_                                                                             |
| `cms_get_byline`    | Get byline profile                   | `slugOrId` (slug or UUID)                                                            |
| `cms_create_byline` | Create an author/contributor profile | `name`, `slug`, `websiteUrl`, `bio`, `avatar`, `userId`, `socials`, `metadata`       |
| `cms_update_byline` | Update byline details or avatar      | `id`, `name`, `slug`, `websiteUrl`, `bio`, `avatar`, `userId`, `socials`, `metadata` |
| `cms_delete_byline` | Delete an author profile             | `id`                                                                                 |

### 5. Taxonomies (Categories, Tags & Custom Taxonomies)

| Tool                       | Purpose                               | Key Arguments                                                          |
| -------------------------- | ------------------------------------- | ---------------------------------------------------------------------- |
| `cms_list_taxonomies`      | List taxonomy terms with entry counts | `taxonomy` (`"category"`, `"tag"`, custom)                             |
| `cms_create_taxonomy_term` | Create a category, tag, or topic term | `taxonomy`, `slug`, `label`, `description`, `parentId`, `displayOrder` |
| `cms_update_taxonomy_term` | Update term label, slug, or hierarchy | `id`, `slug`, `label`, `description`, `parentId`, `displayOrder`       |
| `cms_delete_taxonomy_term` | Delete a taxonomy term                | `id`                                                                   |
| `cms_assign_page_taxonomy` | Assign taxonomy terms to a page       | `pageId`, `termIds` (array of UUIDs)                                   |

### 6. Version Snapshots, Reviews & Rollbacks

| Tool                        | Purpose                                         | Key Arguments                                           |
| --------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| `cms_list_page_versions`    | List immutable version history snapshots        | `pageId`, `limit`                                       |
| `cms_get_page_version`      | Get full snapshot content of a specific version | `versionId`                                             |
| `cms_rollback_page_version` | Rollback working draft to a previous version    | `pageId`, `versionId`, `userId`                         |
| `cms_approve_page_version`  | Record review approval on a version             | `versionId`, `userId`, `userRole`                       |
| `cms_add_version_comment`   | Post editorial comment or block review note     | `versionId`, `userId`, `userRole`, `content`, `blockId` |

### 7. Site Settings & Search

| Tool                       | Purpose                                   | Key Arguments                                               |
| -------------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| `cms_get_site_settings`    | Get global site branding and SEO settings | _(none)_                                                    |
| `cms_update_site_settings` | Update global branding or SEO defaults    | `name`, `description`, `author`, `email`, `branding`, `seo` |
| `cms_search_content`       | Search across active CMS pages            | `query`, `type`, `limit`                                    |

---

## Block Schema Reference

When composing structured block content for the `blocks` array, construct valid JSON AST objects with `id` (UUID), `type`, and corresponding `props`:

### Structure & Layout

- **SectionBlock**: `{ id, type: "SectionBlock", props: { title: string, description?: string, level?: 2|3|4|5|6, children: BaseBlock[] } }`
- **CardsBlock**: `{ id, type: "CardsBlock", props: { columns?: 1|2|3|4, children: CardBlock[] } }`
- **CardBlock**: `{ id, type: "CardBlock", props: { title: string, description?: string, href?: string, icon?: string, badge?: string } }`
- **TabsBlock**: `{ id, type: "TabsBlock", props: { defaultValue?: string, children: TabItemBlock[] } }`
- **TabItemBlock**: `{ id, type: "TabItemBlock", props: { label: string, value?: string, icon?: string, children: BaseBlock[] } }`
- **StepsBlock**: `{ id, type: "StepsBlock", props: { children: StepItemBlock[] } }`
- **StepItemBlock**: `{ id, type: "StepItemBlock", props: { title: string, description?: string, children: BaseBlock[] } }`
- **TableBlock**: `{ id, type: "TableBlock", props: { columns: [{ key, header, align? }], rows: Record<string, string>[] } }`

### Content & Media

- **ParagraphBlock**: `{ id, type: "ParagraphBlock", props: { text: "Text content..." } }`
- **CalloutBlock**: `{ id, type: "CalloutBlock", props: { variant: "info"|"success"|"warning"|"error"|"commentary"|"ideation", children: BaseBlock[] } }`
- **ImageBlock**: `{ id, type: "ImageBlock", props: { src: string, alt: string, caption?: string, width?: number, height?: number } }`
- **CodeBlock**: `{ id, type: "CodeBlock", props: { code: string, language: string, title?: string, showLineNumbers?: boolean } }`
- **FileTreeBlock**: `{ id, type: "FileTreeBlock", props: { tree: [{ name: string, isDir?: boolean, children?: [...] }] } }`

### Screenplay & Narrative

- **ScriptBlock**: `{ id, type: "ScriptBlock", props: { title, synopsis, characters: string[], aPlot?, bPlot?, cPlot?, stinger?, children: SceneBlock[] } }`
- **SceneBlock**: `{ id, type: "SceneBlock", props: { location, timeOfDay: "DAY"|"NIGHT"|"DAWN"|"DUSK", setting: "INT."|"EXT.", transition: "CUT TO:", description, children: DialogueBlock[] } }`
- **DialogueBlock**: `{ id, type: "DialogueBlock", props: { character: string, parenthetical?: string, line: string } }`
