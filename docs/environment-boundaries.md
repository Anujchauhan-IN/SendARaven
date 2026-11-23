# Environment and Secret Boundaries

**Status:** Phase 0 baseline. No services are provisioned and no real credentials are recorded here.

## Shared rules

- Keep local, test, staging and production data, credentials, callback URLs, storage and worker schedules isolated.
- Commit no secrets. The repository ignores `.env`, `.env.*`, `*.pem` and `*.key`; only an intentionally sanitized `.env.example` may be committed when variables are introduced.
- Browser-exposed variables must use Astro's `PUBLIC_` prefix and contain only values safe for every visitor. Service-role keys, OAuth client secrets, push private keys, worker credentials and admin tokens must never use `PUBLIC_` or enter client bundles.
- Server code reads secrets from the environment at request/job time. Do not log secret values, complete auth tokens, private letter content or precise coordinates.
- Use least-privilege credentials per environment and service. Never reuse production credentials in local, test, CI or staging.
- Rotate a credential immediately if it is committed, logged, shared in screenshots or otherwise exposed. Removing it from Git history is not a substitute for revocation.
- Add empty variable names and descriptions to `.env.example` only when implementation introduces them; never place working values there.

## Environment matrix

| Environment | Purpose and data | Configuration source | Secret policy | Network/services | Deployment authority |
|---|---|---|---|---|---|
| Local | Android/Acode or developer-machine implementation using fixtures, local test data and disposable accounts. No production personal data. | Shell variables or ignored local `.env` files. Current frontend needs no credentials. | Developer-owned disposable credentials only; never production values. | Local Astro server. Future remote development services must be explicitly selected and isolated. | No deployment. |
| Test / CI | Deterministic automated unit, build and browser tests using fixtures or an isolated disposable backend when one exists. | GitHub Actions variables and encrypted environment secrets only when tests genuinely need them. | Prefer no secrets. Use short-lived, least-privilege test credentials; forked pull requests must not receive privileged secrets. | Current CI runs frontend checks locally. Future database/worker tests require an isolated test project and cleanup strategy. | Workflow verification only. |
| Staging | Production-like integration, migration, worker, notification and recovery rehearsal with nonproduction accounts/data. | Hosting/provider staging environment settings and encrypted secrets. | Unique staging credentials; no production service-role, OAuth, push or admin secrets. Access limited and auditable. | Separate database/auth/storage, worker schedules, callback URLs and notification configuration. | Explicit staging authorization; never treated as public launch. |
| Production | Real users and correspondence after launch approval. | Production hosting/provider secret stores, never repository files. | Unique production credentials, least privilege, rotation and audited access. Private keys remain server/worker-only. | Separate production database/auth/storage, workers, domains, OAuth callbacks, push/email configuration and monitoring. | User-authorized release only after Phase 13 gate. |

## Data and access boundaries

- **Authentication:** each environment has distinct OAuth callback URLs and auth projects. Test users never authenticate against production.
- **Database/RLS:** migrations are tested in disposable/test and staging environments before production. Service-role access is limited to reviewed server/worker operations.
- **Storage:** signet buckets and policies are environment-specific. Never copy private production objects into lower environments.
- **Workers/notifications:** test and staging jobs target only their own databases and endpoints. Notification tests use controlled recipients and generic content.
- **Geolocation:** raw browser coordinates are transient in every environment and must not be placed in logs, fixtures or analytics.
- **Moderation/admin:** no frontend environment variable grants admin authority. Admin access is server-verified and audited per environment.

## Current limitations

- No backend, provider projects, production adapter or environment variables exist yet.
- Provider-specific variable names, secret rotation procedures and staging topology must be documented when providers are approved.
- CI currently needs no credentials; future backend/security suites may require an isolated test environment before they can run in pull requests.
