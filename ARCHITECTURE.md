# Institute Management System Architecture

## Overview

This project is a modern, simple Institute Management System for small training institutes in Pakistan. It is designed for fast daily operations, non-technical staff, a premium responsive UI, and clean future expansion.

The system starts as a single-institute installation while keeping the database ready for future multi-institute or SaaS support.

Projects:

- `institute-api`: Laravel REST API backend
- `institute-web`: Next.js frontend

No business modules should be built until the foundation is created.

## Backend Structure

Backend stack:

- Laravel latest stable version
- MySQL
- Laravel Sanctum
- REST API
- Form Requests
- API Resources
- Policies and middleware
- Service classes only where they add clear value

Recommended structure:

```text
institute-api/
  app/
    Http/
      Controllers/Api/
      Requests/
      Resources/
      Middleware/
    Models/
    Policies/
    Services/
    Support/
  database/
    migrations/
    seeders/
    factories/
  routes/
    api.php
```

Controllers should stay thin. They should validate input through Form Requests, delegate complex workflows to services when needed, and return API Resources or standardized JSON responses.

Use database transactions for critical operations that write multiple related records.

## Frontend Structure

Frontend stack:

- Next.js latest stable version
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Lucide Icons

Recommended structure:

```text
institute-web/
  app/
    (auth)/
    (dashboard)/
  components/
    ui/
    layout/
    forms/
    data/
    feedback/
  features/
  lib/
    api/
    auth/
    validation/
    utils/
  hooks/
  types/
```

Use feature folders once business modules are introduced. Shared UI primitives stay in `components/ui`, while domain-specific components live under `features`.

## Database Conventions

Create an `institutes` table during the foundation phase.

Use `institute_id` on institute-owned records where appropriate, even though the first version only exposes one institute in the UI.

Conventions:

- Table names use plural snake case: `institutes`, `users`
- Columns use snake case: `institute_id`, `created_by`
- Primary keys use Laravel default `id`
- Foreign keys use `{singular_table}_id`
- Include timestamps on normal records
- Use soft deletes for records users may need to recover
- Add indexes for foreign keys and common filters
- Prefer enum-like strings over database enums when values may evolve

Core foundation tables should include:

- `institutes`
- `users`
- `personal_access_tokens` from Sanctum

## Authentication Strategy

Use Laravel Sanctum for authentication.

For the Next.js frontend, use Sanctum SPA authentication with secure, HTTP-only cookies when both apps are deployed under trusted domains. This keeps tokens out of browser storage.

Authentication flow:

1. Frontend requests CSRF cookie from Laravel.
2. User submits login form.
3. Laravel creates an authenticated session.
4. Frontend fetches the current user from `/api/me`.
5. Authenticated API requests include credentials.

For future mobile or external clients, Sanctum personal access tokens can be added without changing the main web authentication model.

## Authorization Strategy

Use Laravel Policies for model-level authorization and middleware for route-level access rules.

Initial roles can remain simple:

- `owner`
- `admin`
- `staff`

Do not expose complex permissions in the UI initially. Keep the backend ready for future role and permission expansion.

Authorization rules should always verify that the authenticated user belongs to the same `institute_id` as the requested record.

## API Response Format

Use consistent JSON responses across the API.

Success response:

```json
{
  "success": true,
  "message": "Action completed successfully.",
  "data": {}
}
```

List response:

```json
{
  "success": true,
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 0
  }
}
```

Error response:

```json
{
  "success": false,
  "message": "Something went wrong.",
  "errors": {}
}
```

Use API Resources for transforming models. Avoid returning raw Eloquent models directly.

## Validation Strategy

Backend validation:

- Use Laravel Form Requests for all create and update operations.
- Keep authorization checks inside Form Requests only when they are request-specific.
- Return standard Laravel validation errors in the shared API error format.

Frontend validation:

- Use Zod schemas for form validation.
- Use React Hook Form for form state.
- Keep frontend validation aligned with backend Form Requests.
- Show field-level errors near inputs and a concise form-level error for failed submissions.

Backend remains the source of truth.

## Reusable Frontend Components

Build reusable components around daily staff workflows:

- App shell with sidebar and top bar
- Page header
- Data table
- Search input
- Filter controls
- Empty state
- Loading state
- Error state
- Confirmation dialog
- Form field wrappers
- Date picker
- Status badge
- User menu

Use shadcn/ui as the base component system and Lucide icons for actions. Keep styling clean, modern, responsive, and easy for non-technical staff.

## Error Handling

Backend:

- Use Laravel exception handling to normalize API errors.
- Return appropriate HTTP status codes.
- Log unexpected errors.
- Avoid exposing stack traces or internal details in production.

Frontend:

- Centralize API client error handling.
- Use TanStack Query error states for fetch failures.
- Show clear, human-friendly messages.
- Preserve backend validation errors for forms.
- Provide retry actions where useful.

## Naming Conventions

Backend:

- Controllers: `StudentController`
- Requests: `StoreStudentRequest`, `UpdateStudentRequest`
- Resources: `StudentResource`
- Policies: `StudentPolicy`
- Services: `StudentEnrollmentService`
- Routes: RESTful kebab case where needed

Frontend:

- Components: PascalCase, such as `PageHeader`
- Hooks: camelCase with `use` prefix, such as `useCurrentUser`
- Types: PascalCase, such as `Institute`
- API functions: camelCase verbs, such as `getCurrentUser`
- Files: kebab case for route and utility files where practical

## Future Multi-Institute Isolation Strategy

The first version should behave as a single-institute app, but institute ownership must be built into the data model.

Future isolation rules:

- Every institute-owned table includes `institute_id`.
- Authenticated users are associated with one institute initially.
- Queries for institute-owned records are scoped by the current user's `institute_id`.
- Policies verify institute ownership before allowing access.
- Background jobs and imports must carry `institute_id`.
- Unique constraints should include `institute_id` where values are only unique within an institute.
- The UI should not expose tenant switching until SaaS support is intentionally added.

This keeps the initial product simple while avoiding a costly database redesign later.
