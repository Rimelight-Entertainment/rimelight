import type { FieldDefinition, ResolvedCollection } from "./types";
import { resolveLabel } from "./define";

export interface FieldError {
  field: string;
  message: string;
}

const isEmpty = (v: unknown) =>
  v === undefined ||
  v === null ||
  v === "" ||
  (Array.isArray(v) && v.length === 0) ||
  (typeof v === "object" && !Array.isArray(v) && Object.keys(v as object).length === 0);

function checkScalar(_key: string, field: FieldDefinition, value: unknown): string | null {
  switch (field.type) {
    case "number": {
      if (typeof value !== "number" || Number.isNaN(value)) return "must be a number";
      if (field.min !== undefined && value < field.min) return `must be ≥ ${field.min}`;
      if (field.max !== undefined && value > field.max) return `must be ≤ ${field.max}`;
      return null;
    }
    case "boolean":
      return typeof value === "boolean" ? null : "must be true or false";
    case "currency": {
      const v = value as { amount?: unknown; currency?: unknown };
      if (typeof v !== "object" || typeof v?.amount !== "number")
        return "must be { amount, currency }";
      if (v.amount < 0) return "must not be negative";
      return null;
    }
    case "select":
      if (field.options && !field.options.some((o) => o.value === value))
        return "is not a valid option";
      return null;
    case "multiselect":
    case "tags":
    case "references":
      if (!Array.isArray(value)) return "must be a list";
      if (field.type === "multiselect" && field.options) {
        const bad = value.find((v) => !field.options!.some((o) => o.value === v));
        if (bad !== undefined) return `contains an invalid option "${String(bad)}"`;
      }
      return null;
    case "date":
    case "datetime":
      return Number.isNaN(Date.parse(String(value))) ? "must be a date" : null;
    case "url":
      try {
        new URL(String(value), "https://x.invalid");
        return null;
      } catch {
        return "must be a URL";
      }
    case "email":
      return /^[^@\s]+@[^@\s]+$/.test(String(value)) ? null : "must be an email address";
    case "json":
    case "richtext":
    case "media":
    case "reference":
      return null;
    default: {
      if (typeof value !== "string") return "must be text";
      if (field.pattern && !new RegExp(field.pattern).test(value)) return "has an invalid format";
      if (field.max !== undefined && value.length > field.max)
        return `must be at most ${field.max} characters`;
      return null;
    }
  }
}

/**
 * Validates entry properties against a collection's fields. Unknown keys are allowed (legacy
 * content carries extra properties); only declared fields are checked.
 */
export function validateProperties(
  collection: ResolvedCollection,
  properties: Record<string, unknown>,
  { partial = false }: { partial?: boolean } = {},
): FieldError[] {
  const errors: FieldError[] = [];
  for (const [key, field] of Object.entries(collection.fields)) {
    const value = properties[key];
    if (isEmpty(value)) {
      if (field.required && !partial) {
        errors.push({ field: key, message: `${resolveLabel(field.label) || key} is required` });
      }
      continue;
    }
    const values =
      field.translatable && typeof value === "object" && !Array.isArray(value)
        ? Object.values(value as Record<string, unknown>)
        : [value];
    for (const v of values) {
      if (isEmpty(v)) continue;
      const problem = checkScalar(key, field, v);
      if (problem) {
        errors.push({ field: key, message: `${resolveLabel(field.label) || key} ${problem}` });
        break;
      }
    }
  }
  return errors;
}
