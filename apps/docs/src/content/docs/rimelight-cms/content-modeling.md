---
title: Content Modeling
description: Learn how to define collections and fields in Rimelight CMS.
---

Content modeling in Rimelight CMS is done via a TypeScript configuration. This ensures that your schema is both the source of truth for the database and for your frontend types.

## Collections

A collection represents a type of content (e.g., Posts, Pages, Products).

```typescript
import { defineCollection } from "@rimelight/cms/define"

export const posts = defineCollection({
  slug: "posts",
  labels: { singular: "Post", plural: "Posts" },
  pathPrefix: "blog", // Used for generated URLs
  timestamps: true, // Adds _createdAt and _updatedAt
  drafts: true, // Enables draft/publish states
  versions: { max: 10 }, // Stores history of changes
  fields: {
    // ... fields here
  }
})
```

### Config Options

| Property     | Type      | Description                                          |
| :----------- | :-------- | :--------------------------------------------------- |
| `slug`       | `string`  | Unique identifier used in the URL and API.           |
| `labels`     | `object`  | Singular and plural names for the UI.                |
| `singleton`  | `boolean` | If true, only one entry can exist (e.g., Home Page). |
| `drafts`     | `boolean` | Enable draft/published workflow.                     |
| `timestamps` | `boolean` | Automatically manage creation and update dates.      |

## Fields

Fields define the data structure of your collection. Use the `fields` helper for type-safety.

### Common Field Options

Most fields support these options:

- `label`: UI label (defaults to field name).
- `required`: Validation.
- `translatable`: Enable per-locale values.
- `admin`: UI-specific options (e.g., `position: "sidebar"`, `rows: 10`).

### Field Types

#### Text

Simple string input.

```typescript
fields.text({ maxLength: 100 })
```

#### Rich Text

A visual editor (built on Tiptap).

```typescript
fields.richText()
```

#### Image

An asset picker for your media library.

```typescript
fields.image()
```

#### Relation

Connect to another collection.

```typescript
fields.relation({
  collection: "authors",
  hasMany: false
})
```

#### Select

A dropdown with predefined options.

```typescript
fields.select({ options: ["News", "Event", "Tutorial"] })
```

#### Array

A list of repeating fields.

```typescript
fields.array({
  of: fields.text()
})
```

## Field Groups (Blocks)

Blocks allow you to define flexible page structures by allowing editors to choose from different "chunks" of content.

```typescript
fields.blocks({
  types: {
    hero: {
      title: fields.text(),
      image: fields.image()
    },
    cta: {
      label: fields.text(),
      url: fields.text()
    }
  }
})
```
