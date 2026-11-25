# Database Migration and Verification Workflow

**Status:** Phase 3A workflow established; no hosted migration has been executed.  
**Authority:** Git-tracked files under `supabase/migrations/` are the source of truth for database schema changes.

## 1. Operating model

SendARaven uses one hosted Supabase project. Android development does not require local Docker or a local Supabase CLI:

1. Write forward-only SQL migrations in `supabase/migrations/`.
2. Add or update pgTAP tests in `supabase/tests/database/`.
3. Push the branch and let GitHub Actions create a temporary Supabase database on an Ubuntu runner.
4. Merge only after the database verification workflow passes.
5. Deploy to the one hosted project only through the manual hosted migration workflow.

Do not make schema, policy, function or catalogue changes directly in Supabase Studio. Git migrations must remain authoritative.

## 2. Automated database verification

`.github/workflows/database-verification.yml` runs on pushes to `main`, pull requests and manual dispatches. It:

1. Installs Supabase CLI v3 through `supabase/setup-cli@v3`.
2. Generates temporary local configuration when the repository does not contain one.
3. Starts a temporary local database on the GitHub Linux runner.
4. Applies all repository migrations.
5. Rebuilds the database from the migration history with `supabase db reset`.
6. Runs every pgTAP file with `supabase test db`, including all 61 Phase 3A assertions.
7. Fails immediately when a migration or assertion fails.

The existing application workflow in `.github/workflows/ci.yml` remains separate and unchanged.

## 3. Required GitHub configuration

### Protected environment secrets

Open **GitHub repository → Settings → Environments**, create `hosted-supabase`, and add exactly these environment secrets:

| Secret | Value | Where to obtain it |
|---|---|---|
| `SUPABASE_ACCESS_TOKEN` | A Supabase personal access token for the owner account | Supabase Dashboard → Account → Access Tokens |
| `SUPABASE_DB_PASSWORD` | The database password for the single hosted project | Supabase Dashboard → Project Settings → Database |
| `SUPABASE_PROJECT_REF` | The exact 20-character project reference | Supabase dashboard URL: `/project/<project-ref>` |

Do not add these values to repository-level Actions secrets, `.env`, workflow YAML, documentation, migration files or application code. Keeping them environment-scoped prevents an unprotected workflow job from receiving hosted database credentials. A service-role key is not required and must not be added.

### Protected deployment environment

The environment must be named exactly:

```text
hosted-supabase
```

Configure it as follows:

1. Add the owner as a required reviewer.
2. Restrict deployment branches to `main`.
3. Store all three credentials as environment secrets, not repository secrets.

Both hosted jobs use this environment. The first approval permits read-only history inspection and migration preview. After that job succeeds, the deployment job creates a second protected deployment for approval before hosted database mutation. The workflow also rejects any ref other than `refs/heads/main` in both jobs.

## 4. First-time setup sequence

1. Commit and push the workflow files, migration and tests.
2. Open **Actions → Database Verification** and confirm the latest `main` run passes.
3. Confirm the `hosted-supabase` environment and all three environment secrets are configured.
4. Do not deploy if the hosted project already contains manually created application schema. Reconcile it into reviewed migrations first.
5. Open **Actions → Hosted Database Migration → Run workflow**.
6. Select the `main` branch.
7. Enter the exact project reference in `project_ref`.
8. Enter this exact confirmation phrase, substituting the real reference:

```text
DEPLOY <project-ref>
```

9. Approve the first `hosted-supabase` environment request to allow the protected verification and preview job to run.
10. Review the `verify-and-preview` job logs. It must show passing local migrations/tests, compatible hosted migration history and the pending migration dry run.
11. Approve the second waiting `hosted-supabase` deployment only when the target and preview are correct.
12. Confirm the deployment job reports exact migration-history equality, no pending migrations, no public/private schema drift and a valid Phase 3A trigger on `auth.users`.

The workflow is manual only. No push or pull request can deploy to the hosted database.

## 5. Hosted workflow safeguards

`.github/workflows/hosted-database-migration.yml` provides:

- Manual `workflow_dispatch` only.
- Exact comparison between entered and secret project references.
- A required `DEPLOY <project-ref>` confirmation phrase.
- Local migration rebuild and all database tests before any hosted operation.
- Hosted migration-history validation that rejects remote versions absent from Git, plus a `db push --dry-run --remote` preview.
- Environment-scoped credentials exposed only to the steps that verify or access the hosted target, plus protected-environment approvals before preview and before deployment.
- A second history and pending-migration check immediately before deployment.
- `db push --yes --remote` only after every prior gate succeeds.
- Post-deployment exact history comparison, explicit pending-migration detection, public/private schema drift checks and a read-only verification of the Phase 3A `auth.users` trigger.
- Commit-pinned third-party GitHub Actions and one non-cancellable concurrency group, preventing simultaneous hosted deployments.

## 6. Migration rules and drift prevention

1. Never edit, rename, reorder or delete a migration that has been applied to the hosted project.
2. Correct deployed behavior with a new forward-only migration.
3. Do not use Supabase Studio for DDL, RLS policies, grants, functions or seed catalogue changes.
4. Do not run `supabase db push --remote` from an unreviewed checkout.
5. Do not use `--include-all` to bypass divergent migration history.
6. Treat a failed `migration list`, dry run or schema-drift check as a deployment blocker.
7. Keep migration and pgTAP changes in the same pull request when behavior changes.
8. Require the Database Verification workflow before merging database changes.

The post-deployment `supabase db diff --remote --schema public,private` check compares application-owned schemas with the schema reconstructed from Git migrations. Any emitted SQL fails the workflow. Because Supabase manages most of `auth`, a separate read-only query in `supabase/verification/phase_3a_hosted.sql` verifies the application-owned trigger and security-definer function without diffing all platform-managed Auth objects.

## 7. Failure recovery

### Local CI migration or test failure

- No hosted change occurred.
- Fix the migration or test on the branch.
- Do not weaken a security assertion merely to make CI pass.
- Push again and wait for a clean Database Verification run.

### Preview or history verification failure

- Do not approve the deployment environment.
- Compare `supabase migration list --remote` with filenames under `supabase/migrations/`.
- Check for renamed, removed or manually marked migration versions.
- Do not run `migration repair` merely to silence a mismatch.

### Hosted migration failure

- Stop and preserve the complete Actions log.
- Run the workflow again only after determining whether the failed migration was recorded remotely.
- Inspect migration history through a read-only `supabase migration list --remote` run.
- Because Phase 3A uses an explicit transaction, a statement failure should roll back that migration; verify history before relying on that assumption.
- Fix the problem with a new forward-only migration when any part was successfully applied or recorded.
- Use `supabase migration repair` only after evidence proves the history table is wrong, with owner approval and a documented rationale.

### Schema drift detected

- Do not perform further hosted deployments.
- Identify the untracked Dashboard/manual change.
- Prefer a reviewed forward migration that brings the hosted schema back to the Git-defined state.
- If the hosted state is intentionally authoritative due to an emergency, use `supabase db pull --remote` only in a dedicated recovery branch, review the generated SQL, and commit the reconciled migration before any later deployment.
- Never hide drift by deleting migrations or using `--include-all`.

## 8. Relevant Supabase documentation

- [Automated database testing in GitHub Actions](https://supabase.com/docs/guides/deployment/ci/testing)
- [Managing environments and migrations](https://supabase.com/docs/guides/deployment/managing-environments)
- [Supabase CLI v3 migration guide](https://supabase.com/docs/guides/local-development/cli/migrating-to-v3)
- [Local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Database testing and linting](https://supabase.com/docs/guides/local-development/cli/testing-and-linting)
