---
title: AI Features
description: Leveraging AI for content optimization in Rimelight CMS.
---

Rimelight CMS includes built-in AI assistance to help editors optimize content for search engines, accessibility, and internationalization.

## Configuration

To enable AI features, you must provide an OpenAI API key in your environment:

```env
OPENAI_API_KEY=your_key_here
```

## Available Features

### 1. SEO Assistance

The SEO helper can analyze your content and suggest titles and descriptions optimized for search engines.

- **How it works:** It reads the main content fields of your document and generates suggestions using GPT-4o.
- **Admin UI:** Look for the ✨ icon next to SEO fields in the sidebar.

### 2. Auto Alt-Text

Generate descriptive alt-text for images automatically using computer vision.

- **How it works:** When an image is selected or uploaded, the CMS analyzes the visual content and provides a draft alt-text.
- **Admin UI:** The alt-text field includes a "Generate with AI" button.

### 3. Intelligent Translation

Translate document fields across all supported languages while preserving formatting and structure.

- **How it works:** Uses AI to translate text while being aware of the CMS field types (e.g., preserving HTML in rich text or structure in blocks).
- **Admin UI:** The translation sidebar allows you to "Translate All" with one click.

## Best Practices

- **Review generated content:** Always review AI suggestions before publishing.
- **Provide context:** Use descriptive field names in your configuration to help the AI understand the purpose of each field.
