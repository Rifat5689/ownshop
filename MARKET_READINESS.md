# Market readiness review — 8 October 2026

## Verdict

**Not ready for a public production launch yet.** The original project had major implementation and security gaps. The working tree now contains a functional, tested cash-on-delivery MVP, but that does not establish that every screen or feature in the design images is implemented or that the deployed websites work end to end.

The source changes and build outputs are local. No commit, production deployment, production database writes, owner creation or credential rotation was performed.

## What was found and corrected

| Area                | Original finding                                                                | Current implementation                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Backend startup     | Broken product service import and missing dependencies                          | Correct import, declared dependencies, environment validation and readiness endpoint                                           |
| Tenant security     | Products/categories/orders lacked reliable store isolation; writes were exposed | Required store ownership, role checks, active-account/store checks and cross-tenant rejection                                  |
| Authentication      | Unprotected/mock admin experience                                               | Verified server sessions, guarded routes, role checks, separate platform/store cookies, token refresh and logout               |
| Storefront          | Blank root and placeholder pages                                                | Store directory, tenant home, catalog, category filtering, search/sort, product details and meaningful empty/error states      |
| Shopping            | Placeholder cart/checkout                                                       | Per-store persisted cart and wishlist, quantity limits, guest checkout, private order tracking and browser-local order history |
| Order integrity     | Invalid controller and client-controlled totals                                 | Server-side price/shipping calculation, transactional stock changes, retry-safe checkout and validated status transitions      |
| Merchant operations | Placeholder management routes                                                   | Product/category CRUD, order status updates, customer records derived from orders, settings and real dashboard data            |
| Platform operations | Mock statistics and incomplete forms                                            | Store/admin management, store activation, subscription metadata, saved settings, revenue/top-store/status dashboards           |
| Product photos      | File selector without a connected upload path                                   | Protected R2 upload endpoint, size/type/signature validation, multi-photo preservation and HTTPS URL editing                   |
| Dependencies        | Outdated/vulnerable dependency tree                                             | Updated lockfiles; all three application audits report zero vulnerabilities at review time                                     |
| Repository hygiene  | Tracked credential files and build artifacts                                    | Removed from Git index, preserved local copies and added ignore rules                                                          |

## Verification evidence

Final verification uses disposable seeded data, not production data:

- **17 backend/cart tests passed**: startup, authentication, role boundaries, tenant isolation, CRUD validation, upload rejection/configuration, checkout pricing and retry behavior, concurrent stock depletion, cancellation/return restocking, order privacy, disabled tenants/accounts, exact CORS matching, separate app cookies and refresh-token replay rejection.
- **22 browser checks passed**: the same eleven acceptance scenarios on desktop Chromium and a mobile viewport. Coverage includes catalog/search/details, persisted cart and tenant isolation, wishlist, real checkout/tracking, rejected spoofed authentication, merchant login/settings/logout, product and category CRUD, customer details, platform store/admin/subscription/settings forms, and overflow checks/screenshots.
- Backend and both frontend ESLint commands passed with zero warnings.
- Both production frontend builds passed.
- `npm audit --audit-level=moderate` reported **0 vulnerabilities** in backend, ecommerce and super-admin dependency trees. This is a dependency check, not a full penetration test.

Browser artifacts: [desktop storefront](artifacts/storefront-desktop.png), [mobile storefront](artifacts/storefront-mobile.png), [desktop platform](artifacts/super-admin-desktop.png), [mobile platform](artifacts/super-admin-mobile.png). The screenshots show test data and image placeholders, not a production product catalog.

## Supplied live endpoints

- `https://ownersuite.web.app` returned HTTP 200. The initially deployed application displayed the older mock/unprotected dashboard.
- `https://ornionshop.web.app` returned HTTP 200. Its initially deployed root showed the incomplete storefront experience.
- Azure API requests, including `/api/v1/health`, did not complete within the check timeout. This establishes that the API was unavailable from this environment during testing; it does not establish the cause or prove a global outage.

The final local changes have not been deployed to those endpoints. Live authentication, database readiness, image uploads and actual purchases remain unverified.

## Design comparison

Reviewed all three design images in `design/` and the supplied frontend architecture attachment. The implemented pages use the navy/green palette, store hero, product cards, responsive navigation, mobile bottom navigation, admin sidebar, dashboard cards, revenue chart, store table and status chart from the references. Tested core pages fit desktop and mobile viewports.

**Pixel-perfect equivalence is not established.** The images are composite showcases rather than a complete interaction specification, and several showcased flows are outside the implemented MVP:

- Customer sign-in, social sign-in, account/profile editing and saved-address management. The current store account page explains guest checkout; order history belongs to the current browser.
- bKash/Nagad/card payment integrations, payment callbacks, refunds and payment reconciliation. Checkout currently supports **cash on delivery only**.
- Automatic subscription billing, plan enforcement and expiry automation. Subscription controls currently persist administrative metadata.
- Product variants, options and detailed inventory history.
- Dedicated reports, audit logs, notifications, role/permission management and expanded customer profile screens shown in the broader dashboard showcase.
- Exact typography, artwork and every secondary screen/state from the showcase images.

These features need implementation and acceptance testing before advertising the full illustrated feature set. Automated tests cover selected journeys; they do not prove that every possible button, browser or failure mode is correct.

## Coding-style assessment

The updated implementation follows the main requirements of `RIfat_frontend_coding_style.md` and `RIFAT_BACKEND_CODING_STYLE.md`:

- React JavaScript, React Router, Axios, TanStack Query and Context providers; feature-specific hooks and components, reusable query states, and page composition.
- Two frontend applications sharing one API, with a store slug resolving the tenant and server ownership checks enforcing separation.
- Express 5 ESM feature modules, Mongoose timestamps/models, controller business logic, external integrations in services, `asyncHandler`, `ApiError`/`ApiResponse`, JWT cookies and explicit CORS.
- Controllers use `try/finally` only where transaction sessions need cleanup; they do not introduce controller `try/catch` error handling.
- Consistent formatting and lint configurations were added. Small form state/event handlers remain in UI components. Styling includes semantic CSS as well as Tailwind; it is not exclusively utility classes.

This is substantial alignment, not a claim that every unchanged legacy helper or every file satisfies every preference verbatim. The two apps still duplicate some feature UI; changes must be kept consistent until a shared package becomes justified.

## Required work before release

1. **Restore and verify Azure API access.** Inspect App Service deployment/startup logs, runtime/environment settings and MongoDB connectivity. Deploy the corrected API only after validating the production configuration. Azure project access or an authenticated deployment/log session is needed to resolve this from here.
2. **Resolve existing tenant data explicitly.** Older products/categories/orders can lack `tenantId`, and older administrators can use the legacy `admin` role. From `backend`, `node scripts/check-migration.mjs` provides a read-only count using the configured database. It was not run against production. Back up production, establish the store mapping, migrate records deliberately and review indexes before release. Never assign all existing records to an arbitrary store.
3. **Rotate previously tracked credentials.** Removing `.env` from current tracking does not remove credentials from Git history. Replace affected database/JWT/storage credentials in their providers and Azure configuration. Historical cleanup requires a separate repository/history decision.
4. **Configure and verify product image storage.** Set the R2 environment values and a public HTTPS image domain, then perform an authorized real upload. Local tests validate rejection/configuration behavior and intentionally do not upload to the cloud. Uploaded files are currently not automatically removed when a product/photo is deleted; add lifecycle cleanup before high-volume usage.
5. **Agree on the advertised release scope.** Either launch an explicitly guest/COD MVP or implement the missing design features above. Do not advertise online payment, customer accounts or automated billing as available.
6. **Deploy and run live acceptance checks.** Backend first, then the two separate Firebase apps. Verify a real assigned owner/admin session, deep links, active/inactive stores, cart isolation, a controlled COD order, stock/restocking, logout and mobile rendering against production. Use explicit test products/accounts and clean them up deliberately.
7. **Complete operational readiness.** Review backups/restore, monitoring, application logs, alerting, privacy/retention and load behavior. Catalog/admin lists currently use bounded fetches and client pagination; replace them with server-side pagination before catalog volume exceeds those bounds. Rate limits currently use an in-memory store and need a shared store for multiple API instances. Guest order references are browser-local and can be lost if storage is cleared. Cross-site cookies can be restricted by browser privacy settings; verify target browsers or provide a same-site API domain before launch.

## Useful entry points

- `README.md`: setup, validation and deployment sequence.
- `backend/scripts/check-migration.mjs`: read-only legacy data audit.
- `backend/scripts/create-owner.mjs`: explicit owner creation, refusing to overwrite existing accounts.
- `tests/api.integration.test.mjs`: API/security acceptance tests.
- `tests/browser/platform.spec.mjs`: desktop/mobile journeys.
- `playwright.config.mjs`: isolated browser test servers and generated reports.
- Existing `.github/workflows/` Azure workflow: checks before deployment on `main` pushes.

No production passwords or secret values are included in this report.
