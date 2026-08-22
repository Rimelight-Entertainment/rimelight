import { eq, desc } from "drizzle-orm"
import type { NewComponentMetadata } from "../schema/index.ts"

export interface ComponentMeta {
  componentName: string
  version: string
  framework: string
  filePath: string
  props: Record<string, any>
  slots: Record<string, any>
  emits: Record<string, any>
  theme?: Record<string, any>
}

export interface ComponentDependencyRecord {
  sourceComponent: string
  targetComponent: string
  dependencyType: "uses" | "extends" | "related"
}

export class ComponentMetadataService {
  constructor(private db: any) {}

  async extractMetadata(componentPath: string): Promise<ComponentMeta> {
    const props: Record<string, any> = {}
    const slots: Record<string, any> = {}
    const emits: Record<string, any> = {}

    try {
      const content = await this.readComponentFile(componentPath)
      props.raw = content
      props.extractedAt = new Date().toISOString()
    } catch (e) {
      console.warn(`Failed to read component file: ${componentPath}`, e)
    }

    return {
      componentName:
        componentPath
          .split("/")
          .pop()
          ?.replace(/\.[^/.]+$/, "") || "unknown",
      version: "latest",
      framework: "astro",
      filePath: componentPath,
      props,
      slots,
      emits
    }
  }

  async storeMetadata(metadata: ComponentMeta): Promise<void> {
    const record: NewComponentMetadata = {
      componentName: metadata.componentName,
      version: metadata.version,
      framework: metadata.framework,
      filePath: metadata.filePath,
      props: metadata.props,
      slots: metadata.slots,
      emits: metadata.emits,
      theme: metadata.theme || {}
    }

    await this.db
      .insert(this.db.componentMetadata)
      .values(record)
      .onConflictDoUpdate({
        target: [this.db.componentMetadata.componentName, this.db.componentMetadata.version],
        set: {
          framework: record.framework,
          filePath: record.filePath,
          props: record.props,
          slots: record.slots,
          emits: record.emits,
          theme: record.theme,
          updatedAt: new Date()
        }
      })
  }

  async getMetadata(componentName: string): Promise<ComponentMeta | null> {
    const result = await this.db
      .select()
      .from(this.db.componentMetadata)
      .where(eq(this.db.componentMetadata.componentName, componentName))
      .orderBy(desc(this.db.componentMetadata.extractedAt))
      .limit(1)

    if (!result[0]) return null

    const row = result[0]
    return {
      componentName: row.componentName,
      version: row.version,
      framework: row.framework,
      filePath: row.filePath,
      props: row.props,
      slots: row.slots,
      emits: row.emits,
      theme: row.theme
    }
  }

  async updateMetadata(componentName: string): Promise<void> {
    const metadata = await this.getMetadata(componentName)
    if (!metadata) return

    const freshMeta = await this.extractMetadata(metadata.filePath)
    await this.storeMetadata(freshMeta)
  }

  async getDependencies(componentName: string): Promise<ComponentDependencyRecord[]> {
    const result = await this.db
      .select()
      .from(this.db.componentDependencies)
      .where(eq(this.db.componentDependencies.sourceComponent, componentName))

    return result.map((row: any) => ({
      sourceComponent: row.sourceComponent,
      targetComponent: row.targetComponent,
      dependencyType: row.dependencyType as "uses" | "extends" | "related"
    }))
  }

  async invalidateCache(componentName: string): Promise<void> {
    await this.db
      .delete(this.db.componentMetadataCache)
      .where(eq(this.db.componentMetadataCache.componentName, componentName))
  }

  private async readComponentFile(path: string): Promise<string> {
    try {
      const fs = await import("fs")
      return fs.readFileSync(path, "utf-8")
    } catch {
      return ""
    }
  }
}
