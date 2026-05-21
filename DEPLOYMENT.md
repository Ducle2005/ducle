# Public Deployment Guide

This app has two deployable services:

- Frontend: `aura-fitness-web`, Next.js.
- Backend: `AuraFitness/backend`, Spring Boot.

Recommended public setup:

- Frontend on Vercel.
- Backend on Railway or Render.
- Production database on PostgreSQL, not local H2.

## Backend Environment Variables

Set these on your backend hosting service:

```env
PORT=8082
APP_CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
APP_JWT_SECRET=replace-with-a-long-random-base64-secret
APP_JWT_EXPIRATION_MS=3600000
GEMINI_API_KEY=replace-with-your-gemini-api-key
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/database
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.postgresql.Driver
SPRING_DATASOURCE_USERNAME=postgres-user
SPRING_DATASOURCE_PASSWORD=postgres-password
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.PostgreSQLDialect
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SPRING_JPA_SHOW_SQL=false
SPRING_H2_CONSOLE_ENABLED=false
```

For platforms that provide a `PORT` variable automatically, do not hardcode another runtime port.

## Frontend Environment Variables

Set this on Vercel:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.example.com/api
```

After changing this value, redeploy the frontend. `NEXT_PUBLIC_*` values are bundled at build time.

## Vercel Frontend Settings

The Next.js frontend is inside `aura-fitness-web`, not the repository root.

Recommended Vercel project settings:

```text
Framework Preset: Next.js
Root Directory: aura-fitness-web
Install Command: npm ci
Build Command: npm run build
```

If the Root Directory is left as the repository root, Vercel cannot find the `package.json` that contains the `next` dependency and will fail with "No Next.js version detected".

## Deploy Order

1. Push the repository to GitHub.
2. Create a PostgreSQL database on your backend platform.
3. Deploy the backend service.
4. Copy the backend public URL.
5. Add that URL to the frontend as `NEXT_PUBLIC_API_BASE_URL`.
6. Add the frontend public URL to backend `APP_CORS_ALLOWED_ORIGINS`.
7. Redeploy both services.
8. Test register, login, AI coach, workout videos, avatar upload, and VIP upgrade flow.

## Security Notes

- Do not commit `.env` files.
- Rotate any API key that was ever committed to the repository.
- Use a fresh strong `APP_JWT_SECRET` for production.
- H2 should stay disabled in production.
