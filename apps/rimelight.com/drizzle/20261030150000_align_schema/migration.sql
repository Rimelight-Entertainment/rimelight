CREATE UNIQUE INDEX "component_dependencies_unique_idx" ON "component_dependencies" ("source_component","target_component","dependency_type");
--> statement-breakpoint
CREATE UNIQUE INDEX "component_metadata_name_version_idx" ON "component_metadata" ("component_name","version");
--> statement-breakpoint
CREATE INDEX "component_metadata_cache_expires_idx" ON "component_metadata_cache" ("expires_at");
--> statement-breakpoint
CREATE UNIQUE INDEX "component_versions_name_version_idx" ON "component_versions" ("component_name","version");
