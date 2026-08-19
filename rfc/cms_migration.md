# RFC-0001: Rimelight.com Documentation CMS Migration

- **Status**: **Draft**
- **Author(s)**: Rimelight Team
- **Created**: 2025-01-17
- **Last Updated**: 2025-01-17
- **Discussion/PR**: TBD

---

## 1. Summary

This RFC proposes migrating the rimelight.com documentation system from the current MDX-based architecture with build-time metadata extraction to a database-backed CMS system. The migration aims to unify content management across all Rimelight properties while maintaining the sophisticated interactive component documentation features that currently exist. This represents a significant architectural evolution from the successful starter template docs migration, requiring new block types, component rendering capabilities, and metadata management systems.

The proposed solution extends the existing `@rimelight/cms` block system to support interactive component documentation while maintaining backward compatibility with static content. The implementation includes new block types for component showcases, API documentation, and live previews, along with a component metadata service for runtime component information management.

---

## 2. Motivation

### Current State

The Rimelight ecosystem currently uses two different documentation approaches:

1. **Starter Template Docs** (✅ Successfully Migrated)
   - Simple markdown files → CMS blocks
   - Static content with basic formatting
   - Straightforward migration completed

2. **Rimelight.com Docs** (❌ Pending Migration)
   - Complex MDX with live component rendering
   - Interactive `ComponentShowcase` system
   - Build-time metadata extraction pipeline
   - Multi-framework code examples
   - Sophisticated component documentation

### Problems with Current Architecture

**Fragmented Content Management:**

- Different systems for different properties
- Inconsistent authoring experiences
- No unified content governance
- Duplicate infrastructure maintenance

**Build-Time Limitations:**

- Metadata extraction only at build time
- Component updates require full rebuilds
- No runtime component-to-docs synchronization
- Limited deployment flexibility

**Scalability Concerns:**

- Virtual module system doesn't scale well
- Build time increases with component count
- No incremental updates for component changes
- Complex deployment pipelines

**Feature Parity Challenges:**

- Inconsistent feature sets across properties
- Maintenance burden for multiple systems
- Difficulty sharing improvements between systems
- No unified analytics or insights

### Benefits of Migration

**Unified Content Management:**

- Single CMS for all Rimelight documentation
- Consistent authoring experience
- Centralized content governance
- Shared infrastructure and tooling

**Runtime Flexibility:**

- Database-backed metadata with runtime access
- Event-driven synchronization for component updates
- No rebuilds required for component changes
- Dynamic content updates

**Enhanced Capabilities:**

- Potential for real-time collaboration
- Advanced search and filtering
- Content versioning and rollback
- Analytics and usage insights

**Developer Experience:**

- Live content preview in CMS editor
- Content validation and quality checks
- Automated migration tools
- Better documentation of documentation itself

---

## 3. Detailed Design

### 3.1. Proposed Architecture

The proposed system extends the existing `@rimelight/cms` block system to support interactive component documentation while maintaining backward compatibility with static content.

```mermaid
graph TD
    A[Rimelight.com Frontend] --> B[Static Docs]
    A --> C[Component Docs]
    A --> D[Interactive Examples]
    B --> E[@rimelight/cms Block System]
    C --> E
    D --> E
    E --> F[Component Metadata Service]
    F --> G[Database Layer]
```

### 3.2. New Block Types

#### ComponentShowcaseBlock

```typescript
interface ComponentShowcaseBlock extends BaseBlock {
  type: "ComponentShowcaseBlock"
  props: {
    componentName: string // e.g., "RLAButton"
    componentPath: string // e.g., "@rimelight/ui/components/button/RLAButton.astro"
    framework: "astro" | "vue" | "solid"
    defaultProps: Record<string, any>
    propsConfig: Record<string, string[]> // For interactive toggling
    togglingPattern: "icon" | "select-option" | "tab-segmented" | "pill-toggle"
    codeExamples: {
      astro?: string
      vue?: string
      solid?: string
    }
    playgroundUrl?: string
  }
  children?: BaseBlock[] // Default slot content
}
```

**Features:**

- Live component rendering with props injection
- Interactive prop configuration controls
- Multi-framework code examples
- Live preview updates
- Slot visualization

#### ApiDocumentationBlock

```typescript
interface ApiDocumentationBlock extends BaseBlock {
  type: "ApiDocumentationBlock"
  props: {
    componentName: string
    sections: {
      props?: boolean
      slots?: boolean
      emits?: boolean
      theme?: boolean
      changelog?: boolean
    }
    hide?: string[] // Props to hide
    show?: string[] // Props to show explicitly
  }
}
```

**Features:**

- Automated API documentation generation
- Props/slots/emits tables
- Theme configuration display
- Changelog integration
- Filtering capabilities

#### LivePreviewBlock

```typescript
interface LivePreviewBlock extends BaseBlock {
  type: "LivePreviewBlock"
  props: {
    componentCode: string
    framework: "astro" | "vue" | "solid"
    height?: string
    width?: string
    editable?: boolean
  }
}
```

**Features:**

- Runtime code execution
- Live editing capabilities
- Error handling and display
- Multiple framework support

### 3.3. Component Metadata Service

#### Database Schema

```sql
-- Component metadata storage
CREATE TABLE component_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name VARCHAR(255) UNIQUE NOT NULL,
  version VARCHAR(50) NOT NULL,
  framework VARCHAR(20) NOT NULL,
  file_path TEXT NOT NULL,
  props JSONB NOT NULL,
  slots JSONB NOT NULL,
  emits JSONB NOT NULL,
  theme JSONB,
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Component versioning
CREATE TABLE component_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  file_path TEXT NOT NULL,
  git_commit VARCHAR(50),
  extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(component_name, version)
);

-- Metadata cache for performance
CREATE TABLE component_metadata_cache (
  component_name VARCHAR(255) PRIMARY KEY,
  metadata JSONB NOT NULL,
  cache_key VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Component relationships
CREATE TABLE component_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_component VARCHAR(255) NOT NULL,
  target_component VARCHAR(255) NOT NULL,
  dependency_type VARCHAR(50) NOT NULL, -- 'uses', 'extends', 'related'
  UNIQUE(source_component, target_component, dependency_type)
);
```

#### Metadata Extraction Service

```typescript
class ComponentMetadataService {
  // Extract metadata from component files
  async extractMetadata(componentPath: string): Promise<ComponentMetadata>

  // Store metadata in database
  async storeMetadata(metadata: ComponentMetadata): Promise<void>

  // Retrieve metadata for rendering
  async getMetadata(componentName: string): Promise<ComponentMetadata>

  // Update metadata on component changes
  async updateMetadata(componentName: string): Promise<void>

  // Get component dependencies
  async getDependencies(componentName: string): Promise<ComponentDependency[]>

  // Invalidate cache for specific component
  async invalidateCache(componentName: string): Promise<void>
}
```

**Extraction Process:**

1. Watch component file system for changes
2. Trigger extraction on file modifications
3. Parse TypeScript/AST for props/slots/emits
4. Extract theme information from theme files
5. Store in database with version tracking
6. Invalidate relevant caches

### 3.4. API Endpoints

```typescript
// Metadata API
GET    /api/docs/metadata/:componentName
POST   /api/docs/metadata/extract
PUT    /api/docs/metadata/:componentName
DELETE /api/docs/metadata/:componentName

// Component Rendering API
POST   /api/docs/render
POST   /api/docs/validate-props

// Content API
GET    /api/docs/content/:pageId
PUT    /api/docs/content/:pageId
POST   /api/docs/content
```

---

## 4. Drawbacks & Trade-offs

### Implementation Complexity

- High initial development effort (estimated 8 weeks)
- Complex component rendering system across multiple frameworks
- Requires database schema changes and migration
- New infrastructure for metadata extraction and caching

### Performance Considerations

- Additional database queries for metadata
- Potential performance overhead for component rendering
- Increased complexity in caching strategies
- Risk of slower initial page loads without proper optimization

### Maintenance Burden

- New services and infrastructure to maintain
- Cross-framework compatibility requires ongoing attention
- Security considerations for component sandboxing
- Database performance and scaling concerns

### Migration Risk

- Complex content migration from MDX to blocks
- Risk of data loss or corruption during migration
- Potential feature gaps during transition
- User experience disruption during migration

---

## 5. Alternatives Considered

### Alternative 1: Hybrid Approach

**Description:** Keep static content in CMS, maintain component docs in MDX with build-time extraction.

**Pros:**

- Faster implementation
- Leverages existing interactive system
- Reduced complexity
- Maintains immediate feature parity

**Cons:**

- Split content management experience
- Inconsistent authoring workflows
- Duplicate infrastructure maintenance
- No unified content governance
- Harder to maintain long-term

**Rejection Reason:** While this approach would be faster to implement, it creates long-term maintenance burden and doesn't achieve the goal of unified content management across Rimelight properties.

### Alternative 2: External Service Integration

**Description:** Use external service (like Storybook) for component documentation, embed in CMS.

**Pros:**

- Leverages mature component documentation tools
- Specialized tooling for component docs
- Reduced CMS complexity
- Independent scaling

**Cons:**

- External dependency and vendor lock-in
- Network latency and performance issues
- Authentication and security complexity
- Potential consistency issues
- Loss of control over documentation features
- Integration complexity

**Rejection Reason:** External services would introduce dependencies, latency, and complexity that undermines the benefits of a unified CMS system.

### Alternative 3: No Migration

**Description:** Maintain current MDX-based system for rimelight.com.

**Pros:**

- No implementation effort
- Maintains current feature set
- No risk of breaking changes

**Cons:**

- Missed opportunity for unification
- Continued maintenance burden
- No improvement to current limitations
- Inconsistent with starter template direction

**Rejection Reason:** This doesn't address the fundamental problems of fragmented content management and doesn't align with the goal of unified content across Rimelight properties.

---

## 6. Adoption & Migration Strategy

### Breaking Changes

This is a significant breaking change for rimelight.com documentation. Existing MDX-based component documentation will need to be migrated to the new block-based system.

### Migration Approach

**Phase 1: Parallel Operation**

- Keep existing MDX system operational
- Deploy new CMS system alongside
- Route some traffic to new system for testing
- Monitor performance and user feedback

**Phase 2: Gradual Migration**

- Migrate less complex documentation first
- Validate migration quality
- Update internal links gradually
- Monitor for issues and fix quickly

**Phase 3: Complete Transition**

- Migrate remaining documentation
- Decommission old MDX system
- Remove build-time extraction pipeline
- Update all internal references

### Migration Tools

```typescript
class MigrationTools {
  // Convert MDX to block format
  convertMDXToBlocks(mdxContent: string): Block[]

  // Extract component references from MDX
  extractComponentReferences(mdxContent: string): ComponentReference[]

  // Validate migrated content
  validateMigratedContent(blocks: Block[]): ValidationResult

  // Generate migration report
  generateMigrationReport(original: MDX, migrated: Blocks): MigrationReport
}
```

### Rollback Plan

**Immediate Rollback (< 1 hour):**

- Revert routing to MDX system
- Restore previous database state
- Clear CDN caches
- Monitor for issues

**Short-term Rollback (< 24 hours):**

- Restore from database backup
- Revert application deployment
- Investigate root cause
- Implement fixes

**Long-term Rollback (< 1 week):**

- Full system restoration
- Data validation and repair
- Process improvements
- Updated testing procedures

---

## 7. Cross-Cutting Concerns

### 7.1. Performance & Bundle Size

**Caching Strategy:**

- Component metadata cache (1 hour TTL, stale-while-revalidate)
- Rendered component cache (5 minutes TTL, stale-if-error)
- Code generation cache (1 minute TTL, no-cache)

**Code Splitting:**

- Lazy load component rendering code
- Split by framework (Astro/Vue/Solid)
- Dynamic import of component-specific code
- Tree-shake unused features

**Bundle Optimization:**

- Minimize client-side JavaScript
- Use shared dependencies where possible
- Implement code splitting for large components
- Optimize for First Contentful Paint

**Performance Targets:**

- Page load time < 2 seconds for documentation pages
- Component rendering < 500ms for interactive components
- Metadata API response time < 100ms
- Database query time < 50ms for cached metadata
- Client-side hydration < 300ms
- Code splitting reduces initial bundle by 40%

### 7.2. Accessibility (a11y)

**Requirements:**

- Semantic HTML for all component documentation
- Keyboard navigation for interactive controls
- Proper ARIA attributes for dynamic content
- Screen reader compatibility for code examples
- Color contrast compliance
- Focus management for live previews

**Implementation:**

- Automated accessibility testing in CI/CD
- Manual review of component documentation
- WCAG 2.1 AA compliance
- Keyboard shortcuts for common actions
- Screen reader announcements for dynamic updates

### 7.3. Security & Privacy

**Component Isolation:**

```typescript
class ComponentSandbox {
  // Isolate component rendering
  sandboxComponent(componentCode: string): SafeComponent

  // Validate component imports
  validateImports(componentCode: string): ValidationResult

  // Sanitize component output
  sanitizeOutput(renderedHTML: string): SafeHTML

  // Implement CSP headers
  generateCSPHeaders(): CSPHeaders
}
```

**Security Measures:**

- Strict Content Security Policy implementation
- Component sandboxing and isolation
- Input validation and sanitization
- Props validation against component schemas
- DOMPurify for HTML sanitization
- Regular security audits
- API authentication and rate limiting

**Privacy Considerations:**

- No personal data collection in documentation
- Compliance with browser privacy controls
- Clear data usage policies
- No tracking without consent

---

## 8. Verification & Testing Plan

### 8.1. Automated Tests

**Unit Tests:**

- Component metadata extraction accuracy
- Block type validation and parsing
- Component rendering for each framework
- Props validation and sanitization
- API endpoint functionality

**Integration Tests:**

- End-to-end component documentation rendering
- Database integration and caching
- Cross-framework compatibility
- Migration tool accuracy
- Content validation workflows

**Performance Tests:**

- Component rendering benchmarks
- Database query performance
- Cache effectiveness
- Bundle size analysis
- Page load time measurements

**Security Tests:**

- XSS vulnerability scanning
- CSP policy validation
- Component isolation effectiveness
- API authentication testing
- Input sanitization verification

**Run verification:**

```bash
vp check
vp test
```

### 8.2. Manual Verification

**Functional Testing:**

- Verify all existing rimelight.com documentation features work in CMS
- Test ComponentShowcaseBlock feature parity with existing system
- Validate multi-framework support (Astro, Vue, Solid)
- Test interactive prop controls for all component types
- Verify slot visualization and theme analysis functionality
- Validate code generation accuracy for all frameworks

**Performance Testing:**

- Measure page load times for documentation pages
- Test component rendering performance under load
- Verify metadata API response times
- Test caching effectiveness
- Validate bundle size reduction targets

**Accessibility Testing:**

- Manual keyboard navigation testing
- Screen reader compatibility verification
- Color contrast validation
- Focus management testing
- ARIA attribute verification

**Security Testing:**

- Manual security review of component rendering
- CSP policy validation
- Component isolation testing
- Input validation verification
- API security testing

---

## 9. Unresolved Questions

1. **Component Versioning Strategy**
   - How should we handle component version updates in documentation?
   - Should we maintain historical documentation for older versions?
   - How do we handle breaking changes in component APIs?

2. **Multi-Tenant Considerations**
   - Should the system support multiple documentation sites?
   - How do we handle component isolation between tenants?
   - What are the scaling implications?

3. **Real-time Collaboration**
   - Should we support real-time collaborative editing?
   - What are the technical requirements for this?
   - How does this impact the architecture?

4. **Analytics and Insights**
   - What metrics should we track for documentation usage?
   - How do we measure documentation effectiveness?
   - Should we implement A/B testing for documentation?

5. **AI-Powered Features**
   - Should we integrate AI for content generation?
   - Could AI help with component documentation?
   - What are the technical and ethical considerations?

6. **Implementation Timeline**
   - Should the 8-week timeline be adjusted based on team availability?
   - What are the critical path dependencies?
   - How do we handle potential delays or scope changes?
