import type { JSX } from "@solidjs/web";
import { RLDate } from "@rimelight/ui/components/date/RLDate.tsx";
import type { ComponentAuditDefinition } from "./types";

const SAMPLE = new Date("2025-03-14T12:00:00Z");

export const DateSandbox = (): JSX.Element => <RLDate date={SAMPLE} />;

export const dateAudit: ComponentAuditDefinition = {
  id: "date",
  name: "Date",
  category: "Data Display",
  status: "Auditing",
  description:
    "Renders a date as a time element with an ISO datetime attribute. Formats with Intl options, a locale, and a default of en-US short month. Invalid input renders empty. It renders its children after the formatted date.",
  importPath: "@rimelight/ui/components/date/RLDate.tsx",
  renderSandbox: () => <DateSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children render after the formatted date.",
      render: () => (
        <RLDate date={SAMPLE}>
          <span class="text-xs text-muted"> (edited)</span>
        </RLDate>
      ),
    },
    {
      id: "date-string",
      title: "Date as string",
      description: "ISO string is parsed with the Date constructor.",
      render: () => <RLDate date="2025-03-14T12:00:00Z" />,
    },
    {
      id: "date-number",
      title: "Date as timestamp",
      description: "Epoch milliseconds are parsed with the Date constructor.",
      render: () => <RLDate date={SAMPLE.getTime()} />,
    },
    {
      id: "default-format",
      title: "Default format",
      description: "Default options: numeric year, short month, numeric day.",
      render: () => <RLDate date={SAMPLE} />,
    },
    {
      id: "custom-options",
      title: "Custom options",
      description: "Long month format through the options prop.",
      render: () => (
        <RLDate date={SAMPLE} options={{ year: "numeric", month: "long", day: "numeric" }} />
      ),
    },
    {
      id: "locale",
      title: "Locale",
      description: "Formats with the de-DE locale.",
      render: () => <RLDate date={SAMPLE} locale="de-DE" />,
    },
    {
      id: "invalid-date",
      title: "Invalid date",
      description: "An unparseable string renders no text and an empty datetime.",
      render: () => <RLDate date="not a date" />,
    },
  ],
};
