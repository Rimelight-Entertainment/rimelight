import type { JSX } from "@solidjs/web";
import auditColors from "virtual:audits/colors";

export const AUDIT_COLORS = auditColors;

export type AuditColor = string;

export type ComponentCategory =
  | "Data Display"
  | "Form & Input"
  | "Navigation"
  | "Layout"
  | "Overlay & Dialog"
  | "Feedback"
  | "Media & Visuals"
  | "AI & Chat"
  | "Utility";

export type AuditStatus = "Auditing" | "Passed" | "Needs Attention" | "Planned";

export interface AuditChecklistItem {
  criterion: string;
  status: "pass" | "fail" | "warn" | "pending";
  notes?: string;
}

export interface TestScenario {
  id: string;
  title: string;
  description: string;
  render: () => JSX.Element;
}

export interface ComponentAuditDefinition {
  id: string;
  name: string;
  category: ComponentCategory;
  status: AuditStatus;
  description: string;
  importPath: string;
  renderSandbox: () => JSX.Element;
  testScenarios: TestScenario[];
  checklist?: AuditChecklistItem[];
}
