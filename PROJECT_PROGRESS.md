# Institute Management System Progress

## Project

Modern Institute Management System for small training institutes in Pakistan.

Repositories inside this project:

- `institute-api` - Laravel REST API
- `institute-web` - Next.js frontend

GitHub:

- `https://github.com/MuhammadOwaisMemon/Institute_Management`

## Stack

Backend:

- Laravel 12
- MySQL
- Laravel Sanctum
- Form Requests
- API Resources
- Policies and middleware
- Feature tests

Frontend:

- Next.js 16
- TypeScript
- Tailwind CSS
- shadcn-style reusable UI components
- TanStack Query
- React Hook Form
- Zod
- Axios
- Lucide Icons

## Completed Prompts

Completed through **Prompt 26 - Final End-to-End System Review**.

Implemented:

- Project architecture document
- Laravel API scaffold
- Next.js frontend scaffold
- Institute settings and logo upload
- Sanctum authentication
- Users, roles, permissions
- Teacher management
- Course management
- Batch management
- Student management
- Admissions and enrollments
- Fee installments
- Payments and printable receipts
- Attendance
- Class schedule
- Dashboard with live KPIs, quick actions, operational lists, and monthly fee collection chart
- Reports with filters, pagination, totals, and CSV export
- Exams and results with quick marks entry, bulk save, percentage calculation, and result history
- Course completion certificates with generated numbers, printable template, and student certificate history
- Global header search for students, codes, phones, courses, and batches with grouped results
- Lightweight internal alerts for overdue fees, due installments, and batch timing reminders with read tracking
- Admin-only activity log for important student, enrollment, payment, attendance, and user actions
- Frontend UI/UX polish across shared layout, navigation, tables, forms, filters, dialogs, loaders, empty states, and daily receptionist workflows
- Backend security and data-integrity hardening for institute isolation, payment/fee calculations, attendance membership, history endpoints, and report subqueries
- Backend/frontend performance optimization for dashboard aggregation, report totals, search/list pagination, useful database indexes, frontend query caching, debounced searches, and mutation invalidation
- Practical automated tests for auth workflows, unauthenticated access, financial flows, fee calculations, installment/payment balances, duplicate attendance validation, and critical frontend admission/payment forms
- Realistic development seed data for Bright Future Institute with Pakistani demo users, courses, batches, students, enrollments, installments, payments, attendance, exams/results, and certificates
- Development-only demo login documentation in `DEMO_DATA.md`
- Final production-style review documented in `FINAL_SYSTEM_REVIEW.md`
- End-to-end backend flow test covering login through certificate generation
- Certificate business rule tightened so certificates require completed enrollments

## Performance Notes

Important Prompt 23 improvements:

- Dashboard monthly fee chart now uses SQL grouping instead of loading all recent payments into PHP.
- Dashboard class count avoids eager loading relationships for count-only queries.
- Pending fee report total remaining is calculated with a SQL aggregate instead of hydrating all matching enrollments.
- Core list endpoints cap `per_page` to a maximum of 100.
- Global search caps term length and uses escaped/prefix LIKE matching for code-like fields.
- Added composite indexes for common dashboard, reports, search, attendance, exams, certificates, alerts, payments, and activity-log filters.
- Frontend TanStack Query defaults now keep data fresh briefly and reduce repeated refetches during normal navigation.
- Search inputs on large/list pages are debounced to reduce duplicate API calls.
- Payment, fee, and admission mutations invalidate dependent dashboard, alerts, reports, and list queries.

## Current Modules

Backend modules:

- Institutes
- Auth
- Users
- Teachers
- Courses
- Batches
- Students
- Enrollments
- Fee Installments
- Payments
- Attendance
- Schedule
- Dashboard
- Reports
- Exams
- Results
- Certificates
- Global Search
- Internal Alerts
- Activity Log

Frontend routes:

- `/`
- `/login`
- `/forgot-password`
- `/reset-password`
- `/settings/institute-profile`
- `/settings/users`
- `/teachers`
- `/teachers/[id]`
- `/courses`
- `/courses/[id]`
- `/batches`
- `/batches/[id]`
- `/students`
- `/students/[id]`
- `/admissions`
- `/fees`
- `/payments`
- `/payments/receipts/[id]`
- `/attendance`
- `/schedule`
- `/reports`
- `/exams`
- `/certificates`
- `/certificates/[id]`
- `/alerts`
- `/settings/activity-log`

## Roles

Initial roles:

- Admin
- Receptionist
- Teacher

Authorization is enforced on the backend using Laravel policies and role permissions. Frontend navigation hides unauthorized modules using user permissions.

Teacher-specific restrictions already exist for:

- Own batches
- Own teacher profile
- Assigned batch attendance
- Assigned batch schedule

## Important Architecture Notes

- Backend and frontend are separate projects.
- System currently works as a single institute installation.
- Database includes `institutes` table.
- Institute-owned records use `institute_id`.
- UI does not expose multi-institute complexity yet.
- No paid APIs or payment gateway integrations.
- Students are not stored directly in courses.
- Student-course participation is handled through enrollments.
- Fees are enrollment-based.
- Payments use generated receipt numbers.
- Attendance is batch/date/student based.
- Schedule is derived from batch weekdays/time/teacher/room. No timetable engine exists.

## Verification Status

Latest checks after Prompt 26:

Backend:

```bash
APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= php artisan test
```

Result:

- 63 tests completed successfully
- 228 assertions
- Warning only because fresh clone does not have a local `.env` file yet

Seeder smoke:

```bash
APP_KEY=base64:AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA= APP_ENV=testing DB_CONNECTION=sqlite DB_DATABASE=:memory: php artisan migrate:fresh --seed --force
```

Result:

- Passed successfully against an in-memory SQLite database

Security dependency audit:

```bash
composer audit
```

Result:

- No security vulnerability advisories found

Frontend:

```bash
npm test
```

Result:

- 2 test files passed
- 2 tests passed

Frontend build:

```bash
npm run build
```

Result:

- Production build passed

Lint:

```bash
.\node_modules\.bin\eslint.cmd src\app src\components src\features src\lib --no-error-on-unmatched-pattern
```

Result:

- Passed cleanly

Focused frontend type check:

```bash
.\node_modules\.bin\tsc.cmd --noEmit
```

Result:

- Covered by successful `npm run build`

Previous local smoke after Prompt 13:

- `http://127.0.0.1:8000/api/health` returned healthy
- `http://127.0.0.1:3000/schedule` returned 200

## Next Handoff Prompt

When continuing in a new Codex chat, use:

```text
Continue this Institute Management project from Prompt 27.
Read PROJECT_PROGRESS.md and ARCHITECTURE.md first.
Do not rebuild completed modules.
Follow existing Laravel and Next.js patterns.
```

Then provide the next prompt.

## Setup On Another Machine

Clone:

```bash
git clone https://github.com/MuhammadOwaisMemon/Institute_Management.git
cd Institute_Management
```

Backend:

```bash
cd institute-api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

Frontend:

```bash
cd institute-web
npm install
npm run dev
```

