# Security hardening and deployment requirements

The frontend uses the root `src/main` backend by default. The separate
`AuraFitness/backend` service has its own JWT and data store. Both services
must be configured independently if deployed.

## Required before deployment

- Set `APP_AUTH_TOKEN_SECRET` on the root backend to a private, random value
  of at least 32 bytes. Set `APP_JWT_SECRET` on the alternate backend to a
  private Base64-encoded HMAC key of at least 256 bits. Both applications now
  fail startup without their secret. Do not put either value in the repository
  or in a `NEXT_PUBLIC_` variable. Existing root bearer tokens expire after
  12 hours; the previous public-default tokens must be treated as compromised.
- Configure a durable database and backups before serving real accounts. The
  root backend's default H2 database is in memory and is only for development.
  Keep the H2 console disabled in production.
- Legacy admin, customer, trainer and membership APIs are disabled at the root
  backend's request filter. Their old client flows need a new authorization
  design before they can be reintroduced. `/api/auth`, `/api/profile`,
  `/api/users` and the modern dashboard remain available.
- The alternate backend no longer accepts body-scan image files or publishes
  new body images. Its public upload handler blocks URLs referenced by old
  body-scan records. Previously stored body-scan files still exist on disk;
  move them into private storage during maintenance and remove obsolete
  public copies after verifying backups.
- VIP checkout remains paused. See `PAYMENT_SECURITY.md` for the required
  payment-provider verification flow.

## Remaining operational controls

Add an edge rate limit for login and registration, monitor failed login
attempts, configure private backups and recovery, and run dependency and
dynamic security scans in staging. Review all changes to provider payment
handling and file storage before reopening paid membership. A source review
and the regression suite cannot prove the deployed site is free of defects.
