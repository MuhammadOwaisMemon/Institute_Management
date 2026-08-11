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

Completed through **Prompt 13 - Class Schedule**.

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

Latest successful checks after Prompt 13:

Backend:

```bash
php artisan test
```

Result:

- 29 tests passed
- 63 assertions

Frontend:

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

Local smoke:

- `http://127.0.0.1:8000/api/health` returned healthy
- `http://127.0.0.1:3000/schedule` returned 200

## Next Handoff Prompt

When continuing in a new Codex chat, use:

```text
Continue this Institute Management project from Prompt 14.
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

