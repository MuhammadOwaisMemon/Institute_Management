# Demo Data

Development seed data creates a fictional institute:

- Institute: Bright Future Institute
- Country: Pakistan
- Currency: PKR

Demo login credentials for local development only:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@brightfuture.test | password123 |
| Receptionist | reception@brightfuture.test | password123 |
| Teacher | sara.ahmed@brightfuture.test | password123 |
| Teacher | bilal.khan@brightfuture.test | password123 |
| Teacher | nadia.farooq@brightfuture.test | password123 |

Run seed data:

```bash
cd institute-api
php artisan migrate:fresh --seed
```

All names, phone numbers, emails, and addresses are fictional demo values.
