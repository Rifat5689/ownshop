# Legacy tenant migration

This tool assigns tenant IDs only. It does not transform old order fields, create stores, delete data, or change indexes. Legacy orders with incompatible fields need a separate reviewed conversion before they can be managed by the current API.

1. Take and verify a restorable database backup. Schedule a maintenance window with application writes stopped.
2. Run `node scripts/check-migration.mjs` from `backend` for a read-only inventory. Confirm store ownership from business records; never infer ownership from the first available store.
3. Create a private JSON file with an `assignments` array. Each entry contains `collection` (`categories`, `products`, `orders`, or `users`), `id` and `tenantId`, using actual 24-character ObjectId strings. Include referenced categories/products in the mapping if they do not already have tenants. Only `admin`/`ADMIN` users are eligible; migrated sessions are revoked.
4. Run `node scripts/migrate-tenants.mjs --plan PATH`. Review counts and save the reported SHA-256. This default mode makes no record updates. Unresolved references, cross-store links, category slug conflicts and existing tenant reassignment are rejected.
5. Review collection indexes and duplicate keys against the current models. Production startup does not automatically create indexes. Create the reviewed indexes explicitly before serving traffic; do not blindly use `syncIndexes` or remove legacy indexes.
6. After approval, run `node scripts/migrate-tenants.mjs --plan PATH --apply --backup-ref BACKUP_ID --plan-sha256 REVIEWED_HASH`. The backup reference is an operator acknowledgement, not automatic backup verification. A replica set/Atlas transaction commits all mapped records together or rolls back. Rerunning the same mapping skips already assigned records.
7. Repeat the audit, review old order schema compatibility and test tenant boundaries before restoring traffic. Check private MongoDB logs if migration fails; the CLI suppresses database errors to avoid exposing credentials.

Keep mapping files and backup artifacts out of Git. No production migration has been performed by adding this tool.
