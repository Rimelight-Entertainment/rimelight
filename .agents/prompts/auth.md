# Auth0 Implementation Plan - Astro Project Migration

**Generated:** August 21, 2026
**Status:** Planning Phase
**Decision Made:** Replace Better Auth with Auth0 (confirmed)

---

## Executive Summary

This document outlines the implementation plan for migrating authentication infrastructure from Better Auth to Auth0 in an Astro project. The decision to use Auth0 has been confirmed. This document serves as a specification for implementing agents to analyze the current codebase, compare architectural approaches, and execute the migration.

---

## Part 1: Context for Implementing Agent

### Current State (Known)

| Aspect            | Status                                                |
| ----------------- | ----------------------------------------------------- |
| Framework         | Astro                                                 |
| Current Auth      | Better Auth (to be removed)                           |
| Database          | Existing (user data stored somewhere)                 |
| User Types        | At minimum: employee and user (role-based separation) |
| Deployment Target | Unknown (needs investigation)                         |

### Unknowns Requiring Investigation

- [ ] Current database schema (users table, existing auth structure)
- [ ] How users are currently created/managed
- [ ] Employee vs. user distinction mechanism
- [ ] Deployment platform (Vercel, Netlify, static hosting, etc.)
- [ ] Environment variable management approach
- [ ] Any existing middleware or auth guards
- [ ] Frontend framework used within Astro (React, Solid, Svelte, vanilla)
- [ ] Serverless functions vs. SSR configuration

### Investigation Requirements (Phase 1)

**Task:** Analyze the project structure and document:

1. **Database Schema Audit**

- Find all user-related tables
- Document fields related to identity/auth
- Note how roles are currently stored
- Check for existing auth tokens/sessions

2. **Auth Code Audit**

- Locate Better Auth configuration
- Find all auth API routes
- Identify middleware usage
- Catalog frontend auth components
- Document callback handlers

3. **Routing & Guards**

- List all protected routes
- Document current access control logic
- Identify role-based redirects

4. **Deployment Configuration**

- Check astro.config.mjs for adapters
- Review .env setup patterns
- Note CI/CD pipeline if exists
- Identify hosting provider

---

## Part 2: Architectural Decision Points

After investigation, the agent must recommend ONE approach for each decision point below.

### Decision Point A: User Sync Strategy

#### Option A1: Lazy Sync (Migration Mode)

Auth0 creates local user records on first login; database remains secondary.

Diagram: Auth0 (primary) <-first login-> Your DB (secondary) <-subsequent lookups->

**Pros:**

- ✅ Minimal initial database changes
- ✅ Progressive migration (old users stay, new users sync)
- ✅ Can revert if needed
- ✅ Auth0 becomes source of truth over time

**Cons:**

- ❌ Dual source of truth during transition
- ❌ Need migration cleanup later
- ❌ Race conditions if multiple logins happen simultaneously

**Best for:** Large existing user base, gradual adoption, minimal disruption priority

---

#### Option A2: Full Sync (Database as Source of Truth)

Your database remains authoritative; Auth0 just handles authentication.

Diagram: Your DB (primary) stores auth0_id <-JWT sub field-> Auth0 (auth only)

**Pros:**

- ✅ Single source of truth (your database)
- ✅ No migration debt
- ✅ Role/data changes reflected immediately
- ✅ Works if Auth0 credentials change

**Cons:**

- ❌ Every request needs DB lookup (unless cached)
- ❌ More complex initial setup
- ❌ Need to pre-populate auth0_id for existing users

**Best for:** Small-medium user base, frequent permission changes, enterprise compliance needs

---

#### Option A3: Hybrid (Cached Metadata)

Store core profile in DB, cache roles in Auth0 metadata for fast access.

Diagram: Your DB (full data) -> writes -> Cache/Redis (optional) <-caches-> Auth0 (JWT roles)

**Pros:**

- ✅ Best performance (JWT has roles, no lookup)
- ✅ Still have DB as source of truth
- ✅ Can invalidate cache when roles change

**Cons:**

- ❌ Most complex implementation
- ❌ Need background job to update Auth0 metadata
- ❌ Cache invalidation edge cases

**Best for:** High traffic apps, frequent role checks, teams with DevOps capacity

---

### Decision Point B: Role Management Flow

#### Option B1: Static Email Domain Detection

Automatically assign role based on email domain.

if (email.endsWith(@yourcompany.com)) { role = employee } else { role = user }

**Pros:**

- ✅ Zero admin overhead
- ✅ Automatic, instant provisioning
- ✅ Easy to implement

**Cons:**

- ❌ Leaks internal structure
- ❌ No audit trail
- ❌ Insecure if employee emails leak
- ❌ No approval workflow

**Best for:** Internal tools, startups, trusted networks

---

#### Option B2: Admin Invitation System

Only admin-created accounts can be employees.

Admin sends invite -> User claims invite -> Account activated with role

**Pros:**

- ✅ Explicit approval
- ✅ Audit trail
- ✅ No guesswork about who's authorized

**Cons:**

- ❌ Requires admin UI
- ❌ Slower onboarding
- ❌ More moving parts

**Best for:** Security-conscious orgs, regulated industries

---

#### Option B3: Manual Assignment (Post-Signup)

Everyone starts as user; promote to employee via admin dashboard.

Sign up -> Verify email -> Admin promotes -> Role changes

**Pros:**

- ✅ Flexible
- ✅ Clear escalation path
- ✅ Separates concerns

**Cons:**

- ❌ Delayed employee access
- ❌ Needs admin UI
- ❌ Manual process

**Best for:** Mixed workloads, growing orgs, B2B SaaS

---

### Decision Point C: Protected Route Implementation

#### Option C1: Astro Middleware (Global)

Check auth on every request server-side.

export const onRequest = async (context, next) => {
if (requiresAuth && !session) return redirect(/login);
if (requiresEmployee && user.role !== employee) return redirect(/unauthorized);
return next();
};

**Pros:**

- ✅ Centralized logic
- ✅ Runs before page renders
- ✅ Clean separation of concerns

**Cons:**

- ❌ All requests hit middleware (slight overhead)
- ❌ Need to configure for each route pattern

**Best for:** Most Astro projects, clean architecture priority

---

#### Option C2: Component-Level Guards

Protect pages with inline checks.

---

const session = await getSession();
if (!session?.user?.isEmployee) return context.redirect(/unauthorized);
---

<h1>Admin Panel</h1>

**Pros:**

- ✅ Granular control per page
- ✅ No middleware config needed
- ✅ Easy to reason about

**Cons:**

- ❌ Boilerplate on every page
- ❌ Easy to forget guards
- ❌ Duplicate logic

**Best for:** Small apps, prototyping, low-security requirements

---

#### Option C3: Layout Wrappers

Wrap protected sections in layout component.

---

const session = await getSession();
if (!session.user.isEmployee) return context.redirect(/unauthorized);
---

<slot />

**Pros:**

- ✅ DRY principle
- ✅ Clear grouping
- ✅ Reusable

**Cons:**

- ❌ Need to remember to use correct layout
- ❌ Nested layouts add complexity

**Best for:** Medium apps, clear section boundaries

---

## Part 3: Recommended Starting Point (Default Assumptions)

Unless investigation reveals otherwise, begin with these assumptions:

| Decision     | Recommendation        | Rationale                         |
| ------------ | --------------------- | --------------------------------- |
| User Sync    | A2: Full Sync         | Maintains existing data authority |
| Role Flow    | B3: Manual Assignment | Balances security and usability   |
| Route Guard  | C1: Middleware        | Cleanest architecture             |
| Auth0 Tenant | Production            | Standard email/password + social  |
| Env Vars     | Public prefix         | Astro convention                  |
| Callback URL | /api/auth/callback    | Standard pattern                  |

---

## Part 4: Implementation Phases

### Phase 1: Investigation & Recommendation (Week 1)

**Deliverables:**

- [ ] Complete project audit report
- [ ] Decision matrix with justified selections
- [ ] Database schema comparison (current vs. required)
- [ ] Migration risk assessment

**Agent Tasks:**

1. Scan entire project structure
2. Document all auth-related code paths
3. Identify breaking changes from Better Auth removal
4. Propose specific decisions from Section 2
5. Get stakeholder approval on recommendations

**Stop Condition:** Recommendations documented and approved

---

### Phase 2: Infrastructure Setup (Week 1)

**Tasks:**

- [ ] Create Auth0 tenant (if not exists)
- [ ] Register Application (Regular Web App)
- [ ] Configure allowed URLs (callback, logout, web origins)
- [ ] Set up environment variables template
- [ ] Install @auth0/auth0-spa-js dependency

**Deliverable:** Auth0 tenant ready with credentials stored securely

---

### Phase 3: Core Integration (Week 2)

**Tasks:**

- [ ] Remove Better Auth dependencies and config
- [ ] Create src/utils/auth.ts (Auth0 client wrapper)
- [ ] Create src/pages/api/auth/callback.ts (OAuth handler)
- [ ] Implement auth context/store for frontend
- [ ] Build basic login/logout buttons/components

**Tests:**

- [ ] Login works locally
- [ ] Callback redirects correctly
- [ ] Logout clears session

**Deliverable:** Users can authenticate with Auth0

---

### Phase 4: User Sync Layer (Week 2-3)

**Tasks (based on Phase 1 decision):**

For Option A2 (Full Sync):

- [ ] Add auth0_id column to users table
- [ ] Backfill existing users with temporary auth0_id values
- [ ] Create sync function syncUserFromAuth0()
- [ ] Implement first-login trigger
- [ ] Write tests for race conditions

**Deliverable:** Auth0 users mirrored in database

---

### Phase 5: Role Management (Week 3)

**Tasks (based on Phase 1 decision):**

For Option B3 (Manual Assignment):

- [ ] Create admin dashboard for role assignment
- [ ] Update user schema to store role enum
- [ ] Implement role-checking middleware
- [ ] Add role to JWT claims (optional, for performance)

**Tests:**

- [ ] Employee can access employee routes
- [ ] User cannot access employee routes
- [ ] Role changes reflect immediately

**Deliverable:** Role-based access control working

---

### Phase 6: Route Protection (Week 3-4)

**Tasks (based on Phase 1 decision):**

For Option C1 (Middleware):

- [ ] Create src/middleware.ts
- [ ] Define public vs. protected route patterns
- [ ] Implement employee-only guard
- [ ] Add unauthorized redirect handling
- [ ] Test all protected routes

**Tests:**

- [ ] Unauthenticated users redirected to login
- [ ] Non-employees redirected from employee routes
- [ ] All existing routes still accessible with proper perms

**Deliverable:** All routes properly guarded

---

### Phase 7: Cleanup & Hardening (Week 4)

**Tasks:**

- [ ] Remove all Better Auth code and dependencies
- [ ] Audit for hardcoded auth paths
- [ ] Update documentation (README, env vars, deployment)
- [ ] Write integration tests
- [ ] Security review (CSP, CORS, token storage)
- [ ] Performance profiling (middleware overhead)

**Deliverable:** Production-ready auth system

---

## Part 5: Risk Assessment

### High-Risk Areas

| Risk                            | Mitigation                                          | Owner     |
| ------------------------------- | --------------------------------------------------- | --------- |
| User data loss during migration | Backup DB before changes; test rollback             | Dev Lead  |
| Auth downtime during cutover    | Deploy both systems temporarily; gradual DNS switch | Dev Lead  |
| Incorrect role assignments      | Manual review of first batch; admin audit log       | Security  |
| Session token leaks             | Use httpOnly cookies; rotate secrets after launch   | Security  |
| Third-party integrations break  | Document all webhook/API dependencies early         | Tech Lead |

### Rollback Plan

If critical issues occur:

1. Revert Better Auth dependencies
2. Restore database from backup
3. Re-enable old auth endpoints
4. Disable Auth0 application temporarily

Rollback Trigger: Any P0 bug affecting >5% of users or data integrity issues

---

## Part 6: Testing Checklist

### Functional Tests

- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Logout clears session
- [ ] Password reset flow (if implemented)
- [ ] Social login (if enabled)
- [ ] First-time user account creation
- [ ] Returning user session restore

### Authorization Tests

- [ ] User cannot access /admin/* routes
- [ ] Employee CAN access /admin/* routes
- [ ] Unauthorized returns 403, not 404
- [ ] Redirect preserves original URL

### Edge Cases

- [ ] Concurrent login sessions
- [ ] Token expiration refresh
- [ ] Browser back button after logout
- [ ] Cookie blocking scenarios
- [ ] Different browsers/devices

### Load Tests

- [ ] 100 concurrent login attempts
- [ ] Middleware latency < 100ms per request
- [ ] DB sync does not timeout under load

---

## Part 7: Success Criteria

| Metric                | Target  | Measurement         |
| --------------------- | ------- | ------------------- |
| Auth latency          | < 200ms | Page load metrics   |
| Login success rate    | > 99%   | Analytics dashboard |
| Session persistence   | 100%    | Returning users     |
| Role enforcement      | 100%    | Penetration testing |
| Zero Better Auth deps | Yes     | Dependency audit    |
| All routes protected  | Yes     | Coverage scan       |

---

## Part 8: Deliverables Checklist

### Code

- [ ] src/utils/auth.ts - Auth0 client abstraction
- [ ] src/pages/api/auth/* - OAuth endpoints
- [ ] src/middleware.ts - Route protection
- [ ] src/components/AuthButtons.astro - UI components
- [ ] Removed: All Better Auth imports/config

### Config

- [ ] Auth0 tenant created
- [ ] Environment variables documented
- [ ] Auth0 app configured (callbacks, origins)

### Documentation

- [ ] README updated with setup instructions
- [ ] ENV_VARS.md with all required variables
- [ ] AUTH_FLOW.md with architecture diagram
- [ ] ADMIN_GUIDE.md for role management

### Tests

- [ ] Unit tests for sync functions
- [ ] Integration tests for auth flow
- [ ] E2E tests for login/logout

---

## Part 9: Open Questions (Must Be Answered Before Coding)

1. **Existing User Migration:**

- How many current users need to be migrated?
- Do they have passwords that need porting?
- Will they need to reset passwords or continue using existing?

2. **Employee Data:**

- What defines an employee vs user?
- Is there HR system integration needed?
- Are there multiple employee tiers (admin, staff, contractor)?

3. **Compliance:**

- Any GDPR/SOC2/HIPAA requirements?
- Need audit logging for auth events?
- Data residency restrictions?

4. **Third-Party:**

- Any services relying on Better Auth webhooks?
- API integrations with user data?
- Analytics tracking user identities?

5. **Database Architecture:**

- Confirm whether auth_data should be shared (auth_users) or separate
- Given different structures, split tables recommended:
  - auth_users (auth0_id, email) - shared
  - customers (customer-specific fields)
  - employees (employee-specific fields)
- Document existing employee schema for sync layer
- Determine if customers need separate tables by segment (B2B/B2C)

---

## Appendix: Auth0 Tenant Configuration Reference

Application Settings:
Type: Regular Web Application
Callback URLs:

- http://localhost:4321/api/auth/callback
- https://your-production-url.com/api/auth/callback
  Logout URLs:
- http://localhost:4321
- https://your-production-url.com
  Web Origins:
- http://localhost:4321
- https://your-production-url.com

Environment Variables:
PUBLIC_AUTH0_DOMAIN: https://dev-xxx.us.auth0.com
PUBLIC_AUTH0_CLIENT_ID: your_client_id
AUTH0_CLIENT_SECRET: your_client_secret # Server-side only

---

## Notes for Implementing Agent

1. Do NOT make assumptions about unknown items in Part 1
2. Present options from Part 2 before proceeding
3. Document every decision with rationale
4. Prioritize security over convenience
5. Test incrementally - deploy to staging first
6. Ask clarifying questions if project context is unclear

---

**End of Document**
