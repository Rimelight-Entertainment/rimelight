export interface ArticleSchemaOptions {
  type?: "TechArticle" | "Article" | "BlogPosting";
  title: string;
  description?: string;
  url: string;
  datePublished?: string | Date;
  dateModified?: string | Date;
  authorName?: string;
  authorUrl?: string;
  image?: string;
  publisherName?: string;
  publisherLogo?: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
 * Builds Schema.org Article / TechArticle / BlogPosting JSON-LD.
 */
export function buildArticleSchema(options: ArticleSchemaOptions): Record<string, any> {
  const {
    type = "TechArticle",
    title,
    description,
    url,
    datePublished,
    dateModified,
    authorName,
    authorUrl,
    image,
    publisherName = "Rimelight Entertainment",
    publisherLogo
  } = options;

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": type,
    headline: title,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url
    }
  };

  if (description) schema["description"] = description;
  if (image) schema["image"] = image;

  if (datePublished) {
    schema["datePublished"] =
      datePublished instanceof Date ? datePublished.toISOString() : datePublished;
  }

  if (dateModified) {
    schema["dateModified"] =
      dateModified instanceof Date ? dateModified.toISOString() : dateModified;
  } else if (datePublished) {
    schema["dateModified"] = schema["datePublished"];
  }

  if (authorName) {
    schema["author"] = {
      "@type": "Person",
      name: authorName,
      ...(authorUrl ? { url: authorUrl } : {})
    };
  }

  if (publisherName) {
    schema["publisher"] = {
      "@type": "Organization",
      name: publisherName,
      ...(publisherLogo ? { logo: { "@type": "ImageObject", url: publisherLogo } } : {})
    };
  }

  return schema;
}

/**
 * Builds Schema.org BreadcrumbList JSON-LD.
 */
export function buildBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, any> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}
