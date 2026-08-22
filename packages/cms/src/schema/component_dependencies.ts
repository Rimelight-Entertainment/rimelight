import { pgTable, text, uuid, uniqueIndex } from "drizzle-orm/pg-core"

export const componentDependencies = pgTable(
  "component_dependencies",
  {
    id: uuid("id").defaultRandom().notNull().primaryKey(),
    sourceComponent: text("source_component").notNull(),
    targetComponent: text("target_component").notNull(),
    dependencyType: text("dependency_type").notNull()
  },
  (table) => [
    uniqueIndex("component_dependencies_unique_idx").on(
      table.sourceComponent,
      table.targetComponent,
      table.dependencyType
    )
  ]
)

export type ComponentDependency = typeof componentDependencies.$inferSelect
export type NewComponentDependency = typeof componentDependencies.$inferInsert
