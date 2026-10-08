# OwnShop

Two independently hosted React applications share one tenant-aware Express API:

- `super-admin/`: platform owner application, Firebase project `ownersuite`.
- `ecommerce/`: public stores and merchant administration, Firebase project `ornionshop`.
- `backend/`: Express 5, Mongoose and JWT authentication, deployed separately on Azure.

Each store uses `/:storeSlug`; stores do not need separate React builds. Merchant administration uses `/admin`, while platform administration uses the other application.

**Release status:** the implemented cash-on-delivery MVP passes local checks, but production launch is blocked. Read [MARKET_READINESS.md](MARKET_READINESS.md) for verification evidence, design gaps and required production work. No production deployment or database migration was performed in this audit.

## Local setup

Use Node.js 24 LTS and a MongoDB replica set or Atlas cluster. Checkout uses transactions and cannot run on a standalone MongoDB instance.

Install dependencies from the repository root:

```powershell
npm ci
npm ci --prefix backend
npm ci --prefix ecommerce
npm ci --prefix super-admin
```

Copy each application's `.env.example` to `.env` if it does not already exist. Preserve existing settings. Configure backend MongoDB and distinct token secrets. For local frontends set `VITE_API_URL=http://localhost:5000/api/v1`, and set the super admin's `VITE_STOREFRONT_URL=http://localhost:5173`. Backend `NODE_ENV=development` permits the documented local origins.

Start three terminals:

```powershell
npm run dev --prefix backend
npm run dev --prefix ecommerce -- --port 5173
npm run dev --prefix super-admin -- --port 5174
```

Create a platform owner only after supplying `OWNER_USERNAME`, `OWNER_EMAIL`, `OWNER_PASSWORD` (12+ characters) and `MONGODB_URI` in a secure local environment. Run `node scripts/create-owner.mjs` from `backend`. The script refuses to overwrite an existing account. Create stores and assigned merchant administrators through the platform application.

R2 image uploads require the five `CLOUD_STORAGE_*` settings in `backend/.env.example`. Otherwise uploads return an error and the product editor still accepts HTTPS image URLs. Uploads accept at most six JPEG, PNG or WebP files, each up to 5 MB.

The public image base URL must use HTTPS with no credentials, query or fragment; the R2 account ID must be the actual 32-character account identifier. Provider requests have a 20-second overall deadline and return 503 on failure. Cloud configuration and real upload verification remain separate release requirements.

## Verification

```powershell
npm test
npx playwright install chromium
npm run test:e2e
npm run lint --prefix backend
npm run lint --prefix ecommerce
npm run lint --prefix super-admin
npm run build --prefix ecommerce
npm run build --prefix super-admin
```

Tests create a disposable MongoDB replica set and QA accounts; they do not connect to the production database. The first run downloads MongoDB. Browser tests launch the API on port 5001 and frontends on 5273/5274, then clean up. Keep these ports available. QA credentials are fixtures and must never be used in production.

The HTML browser report is generated in `playwright-report/`; machine-readable results are in `artifacts/e2e-results.json`. Final review screenshots are in `artifacts/`.

## Production configuration

Backend requires `MONGODB_URI`, distinct random `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` of at least 32 characters, `NODE_ENV=production`, and Azure's provided `PORT`. Recommended token durations are 15 minutes / 7 days. Configure exact frontend origins through `CORS_ORIGIN`; the two Firebase hosting domains and their `firebaseapp.com` counterparts are included. Health endpoint: `/api/v1/health`.

The HTTP port opens before database readiness; health and API routes return 503 until MongoDB connects. Initial database selection is bounded to 10 seconds and failed startup exits with code 1, without printing connection credentials. Configure Azure Health Check to `/api/v1/health`, confirm the App Service runtime supports the project's Node version, and use `npm start` from the deployed backend root. These changes do not diagnose or repair Azure networking or App Service configuration automatically. See [Microsoft's Node configuration guide](https://learn.microsoft.com/en-us/azure/app-service/configure-language-nodejs).

Production startup does not automatically create database indexes. Review and explicitly provision the model indexes before release. For legacy tenant assignments, follow [the migration procedure](backend/scripts/TENANT_MIGRATION.md); its CLI defaults to a read-only dry run and requires an explicit mapping, reviewed plan hash and backup acknowledgement for transactional writes.

Frontend variables are embedded during the build. Use the supplied Azure `/api/v1` base URL and the ecommerce hosting URL from `.env.example` for release builds. Both Firebase configurations serve their own `dist/` directory and rewrite deep links to `index.html`.

After the release blockers are resolved, deploy the backend first, verify readiness and authentication, then rebuild and deploy each frontend from its own directory. Do not deploy the test backend or QA accounts. The existing GitHub workflow runs verification before deploying the Azure API on a `main` push; it does not deploy Firebase sites.

Keep `.env`, credentials, `node_modules`, generated `dist`, `.firebase` and test reports out of Git. Previously tracked credentials were removed from the current index, but their history remains: rotate the affected credentials before release.
