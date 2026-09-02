-- Drop the Refer & Earn popover table; the public + admin popover UI
-- was removed in this release. The `referral` system (codes, points,
-- affiliate commissions) is unaffected.
DROP INDEX IF EXISTS "refer_earn_popovers_tenant_id_key";
DROP TABLE IF EXISTS "refer_earn_popovers";
