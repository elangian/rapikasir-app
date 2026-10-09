# Security and CI release gate

This branch is a reviewable patch, not a production release. No SQL, production
environment change, user-data mutation, or production deployment is authorized.

## Changes and deliberate behavior

- Migration 3 removes the historical all-user admin policy, gives authenticated
  users explicit ownership policies, and adds restrictive ownership guards to
  stores, products, and transactions. Broad permissive policies cannot override
  these guards. Anonymous table privileges are revoked.
- Store inserts must start on FREE. Store updates are limited to profile and
  onboarding columns; tier, identity, and creation timestamp are not writable by consumers.
  Consumer store deletion is disabled, preventing cascade deletion and
  delete/reinsert subscription resets. Product and transaction owner CRUD remains.
- Admin routes always show a closed-access page. Historical session-storage
  unlocks and VITE_ADMIN_PASSPHRASE are ignored. Admin components no longer enter
  the application route tree. This UI closure is containment; the database
  migration is what protects direct API access.
- Browser tier changes, trial activation, simulated payment confirmation,
  fabricated QR codes, and placeholder transfer instructions are removed.
  Existing subscriptions remain intact. Payment routes explain that online
  activation is unavailable and tell users not to send payment.
- CI installs from the lockfile, runs local tests, strict TypeScript, dependency audit, and build
  on Node 24, matching Vercel. Tests do not load deployment env files.
- Smoke uses GET only, bounded three-attempt retries, ten-second request timeouts,
  HTML/asset/SPA route validation, and an Auth health JSON check. HTTP 401 fails
  immediately. Redirects fail instead of forwarding keys to another origin.
  Auth health verifies endpoint readiness with a public application key; it
  does not prove that a user can sign in or that tenant RLS is correct.

## Required order before production

1. Obtain approval for a specific production database migration and deployment.
   Do not merge while the database dependency remains unresolved.
2. Inventory live policies, grants, exposed functions/views, role inheritance,
   and any existing server integrations. This repository cannot prove the live
   database has no extra access paths. Restrictive policies affect future admin
   APIs unless they use a reviewed server mechanism.
3. Back up schema/policies/grants and confirm recovery procedures. Check that
   migration 2 (`transactions.items`) already exists; reports depend on it.
4. Apply migration 3 to an isolated staging database first and test two distinct
   tenant identities: registration, onboarding profile edits, product CRUD,
   checkout, reports, cross-tenant denial, and tier insert/update/upsert denial.
   Local PGlite tests exercise actual PostgreSQL RLS and grants with a minimal
   auth.uid() fixture; they do not emulate the entire hosted Supabase API.
5. After separate approval, apply migration 3 to production **before** the
   frontend deployment. The previous frontend may temporarily receive denied
   admin/tier operations; normal profile updates and owner CRUD stay supported.
   The migration is transactional, repeatable, and changes no stored row data.
6. Verify the live policy/grant inventory and approved smoke procedures. Only
   then consider a separately approved merge/deployment. Merging main triggers
   the existing Vercel production integration.

New databases: run schema.sql, migration 2, and migration 3 in that order before
exposing the Data API. admin-policy.sql now only revokes its historical unsafe
policy and does not replace migration 3.

## Manual configuration

- GitHub repository variable `SUPABASE_URL`: the intended Supabase HTTPS origin.
- GitHub Actions secret `SUPABASE_PUBLISHABLE_KEY`: a publishable or legacy anon
  application key, never service-role or sb_secret. Enter it through the approved
  UI; do not print values or copy production credentials into logs.
- Trigger Smoke test on this branch after configuring these names. Scheduled
  runs use the default branch; branch dispatch allows review before merge.
  Missing configuration is a failure, not a healthy/ignored check.
- Vercel Preview needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY. Scope presence
  can be inspected without revealing values. Until a separate staging database
  is confirmed, treat Preview as production-backed and perform only GET/guest
  checks. Do not sign up, checkout, change tier, or modify/delete records there.
- VITE_ADMIN_PASSPHRASE should be removed/rotated through a separately approved
  configuration change. Any VITE variable is public build input; old production
  bundles may still contain the historical passphrase. Never reuse it elsewhere.
- Enable branch protection/rulesets for main requiring CI and review. It is
  currently unprotected; this patch does not change repository settings.

## Approved backend design — code prepared, not deployed

The user approved preparing backend code for review only. The admin Edge Function
verifies every GET/PATCH Bearer JWT with Supabase Auth.getUser(token), then calls
service-role-only RPCs using the verified user ID. SQL rechecks enabled admin
membership for each operation. Membership and audit tables live in the dedicated
non-exposed rapikasir_private schema with RLS and no consumer privileges.
Functions use an empty search_path and SECURITY DEFINER; only service_role has
EXECUTE, and service credentials are never accepted as a user session or bundled
in the frontend. Platform verify_jwt remains enabled in config.toml.

GET lists stores with bounded pagination. PATCH accepts only storeId/tier/reason,
rejects client-supplied identity, limits payloads to 4 KiB, and atomically locks the
store, changes tier, and writes the audit event. SQL serializes admin mutations
and limits them to 30 per minute per actor. CORS uses exact configured HTTPS
origins; it does not replace authentication/authorization. Transport calls have
10-second timeouts, responses disable caching, and errors disclose no credentials.
There is no delete endpoint. Existing admin UI stays closed until a separate
reviewed integration and staging validation.

Migration 4 must be applied **after migration 3 and before deploying the Edge
Function**, initially to staging under a separate approval. Migration 4 creates
no admin members. An operator must separately approve and grant a specific
verified Auth user UUID a membership. Environment ADMIN_ALLOWED_ORIGINS must be
an exact comma-separated list of HTTPS origins. Hosted legacy SUPABASE_URL,
SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY are server inputs; missing
configuration closes the endpoint with HTTP 503. Do not add a service-role value
to Vercel or any VITE variable. No environment values are created or changed by
this PR. Frontend-only deployment depends on migration 3; migration 4 is an
additional dependency of the optional admin backend, whose deployment is not
part of Vercel Preview.

Tier PATCH supports an explicitly authorized **manual administrative assignment**
with an audit reason. Automated payment activation still requires provider
selection, signature verification, idempotent webhook processing, and
server-validated plan/amount/currency/tenant; no payment webhook is implemented.

## Unresolved risks and verification limits

- Live database policy/grant state has not been read or changed. Local SQL
  fixes alone do not make the live database safe. Until migration 3 is applied,
  the old cross-tenant policy and writable tier may still be exploitable through
  direct API requests even if the new UI is deployed.
- Admin authorization code is prepared and locally tested, but has not been
  deployed or validated against hosted Supabase. Verified billing remains
  unimplemented. Admin UI stays closed.
- Feature/product limits currently enforced in UI require a separately reviewed
  backend enforcement design. This patch secures stored tier, not every paid
  feature's underlying data access.
- Checkout writes transactions and adjusts stock separately. Atomic checkout,
  concurrency/stock guarantees, and payment verification need an approved backend
  design; do not describe existing checkout as an atomic server operation.
- Confirmed-email registration/onboarding and authenticated browser workflows
  require isolated staging accounts. Production/Preview guest smoke does not
  validate them; local SQL tests only validate their database operations.

## Safe rollback

- Before migration COMMIT, PostgreSQL rolls back a failed migration as a unit.
  Capture the exact pre-change policy/grant inventory before applying it.
- After COMMIT, keep the tenant guards and tier restrictions. Do not restore the
  broad authenticated admin policy, writable tier, or consumer store deletion.
  Fix compatibility problems with a reviewed forward migration and narrow grants.
- Roll back application code only to a reviewed build that preserves admin/payment
  closure and is compatible with the restricted grants. The pre-patch build is
  not a safe full rollback: it reintroduces misleading payment confirmation and
  attempts denied admin/tier operations. Prefer a small forward fix or maintenance
  route for affected functions. Preview can simply be superseded by a new branch
  deployment; production rollback requires separate approval.
- If admin backend is later deployed, first disable/decommission its endpoint
  or revoke EXECUTE on its two RPCs from service_role under separate approval;
  retain memberships and audit records. Do not drop audit history during rollback.
- No application-row data migration occurs, so this patch needs no row-data reversal. Database
  restore is a last-resort operator action under a separate approved recovery plan.

## References

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase column privileges](https://supabase.com/docs/guides/database/postgres/column-level-security)
- [Supabase Auth health](https://supabase.com/docs/guides/troubleshooting/how-do-i-check-gotrueapi-version-of-a-supabase-project-lQAnOR)
- [Vitest migration requirements](https://vitest.dev/guide/migration/)
- [Vercel Git deployments](https://vercel.com/docs/git)

Browser verification remains pending if Chromium cannot be installed. The local
installer encountered download timeout/DNS failures; HTTP asset and route smoke
do not prove actual rendering or authenticated flows. The build also reports
a large bundle warning, retained for a separate measured performance change.
