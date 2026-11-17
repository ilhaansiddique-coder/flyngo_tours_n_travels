-- One-time, irreversible cleanup for the supplied 24-row Flyngo account list.
-- Keeps the exact active Super Admin. Refuses any target count other than 23.
-- Requires the latest backend migrations. The whole DO statement is atomic.
DO $cleanup$
DECLARE
  keep_id CONSTANT text := '00000000-0000-0000-0000-00000000admin';
  keep_email CONSTANT text := 'admin@flyngo.com';
  scope_id text;
  original_keeper jsonb;
  preserved_keeper jsonb;
  target_count integer;
  file_count integer;
  candidate record;
  app_table record;
  shared boolean;
BEGIN
  PERFORM set_config('search_path', 'pg_temp, public', true);
  PERFORM set_config('TimeZone', 'UTC', true);
  PERFORM set_config('lock_timeout', '10s', true);
  PERFORM set_config('statement_timeout', '120s', true);
  LOCK TABLE public.users IN SHARE ROW EXCLUSIVE MODE;
  SELECT u.tenant_id, to_jsonb(u) INTO scope_id, original_keeper
  FROM public.users u JOIN public.roles r ON r.id = u.role_id
  WHERE u.id = keep_id AND lower(trim(u.email)) = keep_email
    AND u.deleted_at IS NULL AND u.is_active AND r.code = 'super_admin';
  IF scope_id IS NULL THEN
    RAISE EXCEPTION 'Cleanup refused: the exact active Super Admin was not found. No records deleted.';
  END IF;
  SELECT count(*) INTO target_count FROM public.users WHERE tenant_id = scope_id AND id <> keep_id;
  IF target_count <> 23 THEN
    RAISE EXCEPTION 'Cleanup refused: expected 23 other accounts, found %. No records deleted.', target_count;
  END IF;
  IF to_regclass('public.media_deletion_jobs') IS NULL THEN
    RAISE EXCEPTION 'Deploy the latest backend and migrations before cleanup. No records deleted.';
  END IF;

  CREATE TEMP TABLE _purge_users ON COMMIT DROP AS
    SELECT * FROM public.users WHERE tenant_id = scope_id AND id <> keep_id;
  CREATE TEMP TABLE _purge_contacts ON COMMIT DROP AS
    SELECT CASE WHEN length(regexp_replace(coalesce(u.phone, ''), '[^0-9]', '', 'g')) >= 9
      AND right(regexp_replace(coalesce(u.phone, ''), '[^0-9]', '', 'g'), 10)
        IS DISTINCT FROM right(regexp_replace(coalesce(original_keeper->>'phone', ''), '[^0-9]', '', 'g'), 10)
      THEN right(regexp_replace(u.phone, '[^0-9]', '', 'g'), 10) END AS phone_key,
      CASE WHEN lower(trim(u.email)) IS DISTINCT FROM keep_email THEN nullif(lower(trim(u.email)), '') END AS email,
      coalesce(u.deleted_at, clock_timestamp()) AS cutoff FROM _purge_users u;
  CREATE TEMP TABLE _purge_bookings ON COMMIT DROP AS
    SELECT b.* FROM public.bookings b WHERE b.tenant_id = scope_id AND
      (b.user_id IN (SELECT id FROM _purge_users) OR (b.user_id IS NULL AND EXISTS (
        SELECT 1 FROM _purge_contacts c WHERE b.created_at <= c.cutoff
          AND right(regexp_replace(coalesce(b.customer_phone, ''), '[^0-9]', '', 'g'), 10) = c.phone_key)));
  CREATE TEMP TABLE _purge_pilgrimages ON COMMIT DROP AS
    SELECT b.* FROM public.hajj_umrah_bookings b WHERE b.tenant_id = scope_id AND
      (b.user_id IN (SELECT id FROM _purge_users) OR (b.user_id IS NULL AND EXISTS (
        SELECT 1 FROM _purge_contacts c WHERE b.created_at <= c.cutoff AND
          (right(regexp_replace(coalesce(b.customer_phone, ''), '[^0-9]', '', 'g'), 10) = c.phone_key OR lower(trim(b.customer_email)) = c.email))));
  CREATE TEMP TABLE _purge_booking_ids ON COMMIT DROP AS
    SELECT id FROM _purge_bookings UNION SELECT id FROM _purge_pilgrimages;
  CREATE TEMP TABLE _purge_payments ON COMMIT DROP AS
    SELECT p.* FROM public.payments p WHERE p.tenant_id = scope_id AND
      (p.user_id IN (SELECT id FROM _purge_users) OR p.booking_id IN (SELECT id FROM _purge_bookings)
       OR p.hajj_umrah_booking_id IN (SELECT id FROM _purge_pilgrimages));
  CREATE TEMP TABLE _purge_invoices ON COMMIT DROP AS
    SELECT i.* FROM public.invoices i WHERE i.tenant_id = scope_id AND
      (i.user_id IN (SELECT id FROM _purge_users) OR i.booking_id IN (SELECT id FROM _purge_bookings)
       OR i.hajj_umrah_booking_id IN (SELECT id FROM _purge_pilgrimages) OR i.payment_id IN (SELECT id FROM _purge_payments));
  CREATE TEMP TABLE _purge_posts ON COMMIT DROP AS
    SELECT * FROM public.blog_posts WHERE tenant_id = scope_id AND author_id IN (SELECT id FROM _purge_users);
  CREATE TEMP TABLE _purge_documents ON COMMIT DROP AS
    SELECT * FROM public.user_documents WHERE tenant_id = scope_id AND user_id IN (SELECT id FROM _purge_users);
  CREATE TEMP TABLE _purge_affiliates ON COMMIT DROP AS
    SELECT * FROM public.affiliates WHERE tenant_id = scope_id AND user_id IN (SELECT id FROM _purge_users);
  CREATE TEMP TABLE _purge_codes ON COMMIT DROP AS
    SELECT referral_code AS code FROM _purge_users WHERE referral_code IS NOT NULL
    UNION SELECT referral_code FROM _purge_affiliates;
  CREATE TEMP TABLE _purge_referrals ON COMMIT DROP AS
    SELECT * FROM public.affiliate_referrals WHERE tenant_id = scope_id AND
      (affiliate_id IN (SELECT id FROM _purge_affiliates) OR referred_user_id IN (SELECT id FROM _purge_users));
  CREATE TEMP TABLE _purge_points ON COMMIT DROP AS
    SELECT p.* FROM public.point_transactions p JOIN public.users u ON u.id = p.user_id WHERE u.tenant_id = scope_id AND
      (p.user_id IN (SELECT id FROM _purge_users)
       OR (p.reference_type = 'REFERRAL' AND p.reference_id IN (SELECT id FROM _purge_users))
       OR (p.reference_type = 'BOOKING' AND p.reference_id IN (SELECT id FROM _purge_booking_ids)));
  CREATE TEMP TABLE _purge_legacy_transactions ON COMMIT DROP AS
    SELECT * FROM public.loyalty_transactions WHERE tenant_id = scope_id AND
      (account_id IN (SELECT id FROM public.loyalty_accounts WHERE user_id IN (SELECT id FROM _purge_users))
       OR booking_id IN (SELECT id FROM _purge_booking_ids) OR referral_id IN (SELECT id FROM _purge_referrals));
  CREATE TEMP TABLE _purge_commissions ON COMMIT DROP AS
    SELECT * FROM public.affiliate_commissions WHERE tenant_id = scope_id AND
      (affiliate_id IN (SELECT id FROM _purge_affiliates) OR booking_id IN (SELECT id FROM _purge_booking_ids));
  CREATE TEMP TABLE _purge_leads ON COMMIT DROP AS
    SELECT l.* FROM public.leads l WHERE l.tenant_id = scope_id AND EXISTS (
      SELECT 1 FROM _purge_contacts c WHERE l.created_at <= c.cutoff AND
        (right(regexp_replace(coalesce(l.phone, ''), '[^0-9]', '', 'g'), 10) = c.phone_key OR lower(trim(l.email)) = c.email));
  CREATE TEMP TABLE _purge_pre_registrations ON COMMIT DROP AS
    SELECT l.* FROM public.hajj_pre_registrations l WHERE l.tenant_id = scope_id AND EXISTS (
      SELECT 1 FROM _purge_contacts c WHERE l.created_at <= c.cutoff AND
        (right(regexp_replace(coalesce(l.phone, ''), '[^0-9]', '', 'g'), 10) = c.phone_key OR lower(trim(l.email)) = c.email));
  CREATE TEMP TABLE _purge_file_urls ON COMMIT DROP AS
    SELECT DISTINCT m.url FROM public.media m WHERE m.tenant_id = scope_id AND m.tour_id IS NULL AND m.hotel_id IS NULL AND
      NOT EXISTS (SELECT 1 FROM public.media foreign_media WHERE foreign_media.url = m.url AND foreign_media.tenant_id <> scope_id) AND EXISTS (
        SELECT 1 FROM _purge_users r WHERE position(m.url IN row_to_json(r.*)::text) > 0
        UNION ALL SELECT 1 FROM _purge_bookings r WHERE position(m.url IN row_to_json(r.*)::text) > 0
        UNION ALL SELECT 1 FROM _purge_pilgrimages r WHERE position(m.url IN row_to_json(r.*)::text) > 0
        UNION ALL SELECT 1 FROM _purge_payments r WHERE position(m.url IN row_to_json(r.*)::text) > 0
        UNION ALL SELECT 1 FROM _purge_invoices r WHERE position(m.url IN row_to_json(r.*)::text) > 0
        UNION ALL SELECT 1 FROM _purge_documents r WHERE position(m.url IN row_to_json(r.*)::text) > 0
        UNION ALL SELECT 1 FROM _purge_posts r WHERE position(m.url IN row_to_json(r.*)::text) > 0);

  DELETE FROM public.invoices WHERE id IN (SELECT id FROM _purge_invoices);
  UPDATE public.payment_milestones SET payment_id = NULL, paid_amount = 0, status = 'pending', paid_at = NULL
    WHERE tenant_id = scope_id AND payment_id IN (SELECT id FROM _purge_payments) AND booking_id NOT IN (SELECT id FROM _purge_bookings);
  DELETE FROM public.payments WHERE id IN (SELECT id FROM _purge_payments);
  DELETE FROM public.booking_travelers WHERE booking_id IN (SELECT id FROM _purge_bookings);
  DELETE FROM public.payment_milestones WHERE booking_id IN (SELECT id FROM _purge_bookings);
  DELETE FROM public.pilgrims WHERE booking_id IN (SELECT id FROM _purge_pilgrimages);
  DELETE FROM public.bookings WHERE id IN (SELECT id FROM _purge_bookings);
  DELETE FROM public.hajj_umrah_bookings WHERE id IN (SELECT id FROM _purge_pilgrimages);
  DELETE FROM public.blog_post_categories WHERE post_id IN (SELECT id FROM _purge_posts);
  DELETE FROM public.blog_posts WHERE id IN (SELECT id FROM _purge_posts);
  DELETE FROM public.reviews WHERE tenant_id = scope_id AND user_id IN (SELECT id FROM _purge_users);
  DELETE FROM public.notifications WHERE tenant_id = scope_id AND user_id IN (SELECT id FROM _purge_users);
  DELETE FROM public.point_transactions WHERE id IN (SELECT id FROM _purge_points);
  DELETE FROM public.loyalty_transactions WHERE id IN (SELECT id FROM _purge_legacy_transactions);
  DELETE FROM public.loyalty_accounts WHERE tenant_id = scope_id AND user_id IN (SELECT id FROM _purge_users);
  DELETE FROM public.affiliate_commissions WHERE id IN (SELECT id FROM _purge_commissions);
  DELETE FROM public.referral_ledger WHERE tenant_id = scope_id AND
    (affiliate_id IN (SELECT id FROM _purge_affiliates) OR referred_user_id IN (SELECT id FROM _purge_users) OR booking_id IN (SELECT id FROM _purge_booking_ids));
  DELETE FROM public.referral_payouts WHERE tenant_id = scope_id AND affiliate_id IN (SELECT id FROM _purge_affiliates);
  DELETE FROM public.affiliate_referrals WHERE id IN (SELECT id FROM _purge_referrals);
  DELETE FROM public.affiliates WHERE id IN (SELECT id FROM _purge_affiliates);
  DELETE FROM public.leads WHERE id IN (SELECT id FROM _purge_leads);
  DELETE FROM public.hajj_pre_registrations WHERE id IN (SELECT id FROM _purge_pre_registrations);
  DELETE FROM public.tracking_events e WHERE e.tenant_id = scope_id AND
    (e.user_id IN (SELECT id FROM _purge_users) OR e.external_id IN (SELECT id FROM _purge_users)
     OR (e.user_id IS NULL AND EXISTS (SELECT 1 FROM _purge_contacts c WHERE e.created_at <= c.cutoff AND
       (right(regexp_replace(coalesce(e.phone, ''), '[^0-9]', '', 'g'), 10) = c.phone_key OR lower(trim(e.email)) = c.email))));
  DELETE FROM public.audit_logs WHERE tenant_id = scope_id AND
    (user_id IN (SELECT id FROM _purge_users) OR entity_id IN (
      SELECT id FROM _purge_users UNION SELECT id FROM _purge_booking_ids UNION SELECT id FROM _purge_payments
      UNION SELECT id FROM _purge_invoices UNION SELECT id FROM _purge_posts UNION SELECT id FROM _purge_leads UNION SELECT id FROM _purge_pre_registrations));
  DELETE FROM public.webhook_event_logs w WHERE (w.tenant_id = scope_id OR w.tenant_id IS NULL) AND EXISTS (
    SELECT 1 FROM _purge_payments p CROSS JOIN LATERAL (VALUES (p.transaction_id), (p.gateway_ref), (p.bkash_trx_id)) ids(value)
    WHERE ids.value IS NOT NULL AND ids.value IN (w.payload#>>'{data,object,id}', w.payload#>>'{data,object,payment_intent}',
      w.payload->>'trxID', w.payload->>'paymentID', w.payload->>'transactionId'));
  DELETE FROM public.device_tokens WHERE tenant_id = scope_id AND user_id IN (SELECT id FROM _purge_users);
  DELETE FROM public.password_resets WHERE tenant_id = scope_id AND user_id IN (SELECT id FROM _purge_users);
  DELETE FROM public.user_documents WHERE id IN (SELECT id FROM _purge_documents);
  UPDATE public.users SET created_by_user_id = NULL WHERE tenant_id = scope_id AND created_by_user_id IN (SELECT id FROM _purge_users);
  UPDATE public.users SET referred_by_code = NULL WHERE tenant_id = scope_id AND referred_by_code IN (SELECT code FROM _purge_codes);
  UPDATE public.bookings SET referred_by_code = NULL WHERE tenant_id = scope_id AND referred_by_code IN (SELECT code FROM _purge_codes);
  UPDATE public.hajj_umrah_bookings SET referred_by_code = NULL WHERE tenant_id = scope_id AND referred_by_code IN (SELECT code FROM _purge_codes);
  UPDATE public.payments SET verified_by_id = NULL WHERE tenant_id = scope_id AND verified_by_id IN (SELECT id FROM _purge_users);
  UPDATE public.referral_payouts SET processed_by = NULL WHERE tenant_id = scope_id AND processed_by IN (SELECT id FROM _purge_users);
  UPDATE public.leads SET assigned_to = NULL WHERE tenant_id = scope_id AND assigned_to IN (SELECT id FROM _purge_users);
  DELETE FROM public.users WHERE tenant_id = scope_id AND id IN (SELECT id FROM _purge_users) AND id <> keep_id;

  -- Reconcile balances belonging to the preserved account only if related entries were removed.
  UPDATE public.users u SET
    available_points = greatest(0, (SELECT coalesce(sum(amount), 0) FROM public.point_transactions WHERE user_id = u.id AND status = 'POSTED')),
    lifetime_points = (SELECT coalesce(sum(amount), 0) FROM public.point_transactions WHERE user_id = u.id AND status = 'POSTED' AND amount > 0),
    pending_points = greatest(0, (SELECT coalesce(sum(amount), 0) FROM public.point_transactions WHERE user_id = u.id AND status = 'PENDING'))
    WHERE u.id = keep_id AND EXISTS (SELECT 1 FROM _purge_points WHERE user_id = keep_id);
  UPDATE public.users u SET current_tier_id = (SELECT t.id FROM public.loyalty_tiers t
    WHERE t.tenant_id = scope_id AND t.min_points <= u.lifetime_points ORDER BY t.min_points DESC LIMIT 1)
    WHERE u.id = keep_id AND EXISTS (SELECT 1 FROM _purge_points WHERE user_id = keep_id);
  UPDATE public.loyalty_accounts a SET
    available_points = greatest(0, (SELECT coalesce(sum(points), 0) FROM public.loyalty_transactions WHERE account_id = a.id)),
    lifetime_points = (SELECT coalesce(sum(greatest(points, 0)), 0) FROM public.loyalty_transactions WHERE account_id = a.id),
    redeemed_points = (SELECT coalesce(sum(abs(points)), 0) FROM public.loyalty_transactions WHERE account_id = a.id AND type = 'redemption')
    WHERE a.tenant_id = scope_id AND a.id IN (SELECT account_id FROM _purge_legacy_transactions);
  UPDATE public.affiliates a SET total_earnings = (SELECT coalesce(sum(amount), 0) FROM public.affiliate_commissions
    WHERE affiliate_id = a.id AND status <> 'cancelled')
    WHERE a.tenant_id = scope_id AND a.id IN (SELECT affiliate_id FROM _purge_commissions);
  UPDATE public.bookings b SET paid_amount = (SELECT coalesce(sum(amount), 0) FROM public.payments
    WHERE booking_id = b.id AND status = 'completed')
    WHERE b.tenant_id = scope_id AND b.id IN (SELECT booking_id FROM _purge_payments);
  UPDATE public.hajj_umrah_bookings b SET advance_paid = (SELECT coalesce(sum(amount), 0) FROM public.payments
    WHERE hajj_umrah_booking_id = b.id AND status = 'completed')
    WHERE b.tenant_id = scope_id AND b.id IN (SELECT hajj_umrah_booking_id FROM _purge_payments);
  UPDATE public.hajj_umrah_bookings SET balance_due = greatest(0, total_amount - advance_paid),
    payment_status = CASE WHEN advance_paid >= total_amount THEN 'paid' WHEN advance_paid > 0 THEN 'partial' ELSE 'unpaid' END
    WHERE tenant_id = scope_id AND id IN (SELECT hajj_umrah_booking_id FROM _purge_payments);

  -- Queue managed, unshared files for the backend's durable removal worker.
  FOR candidate IN SELECT url FROM _purge_file_urls LOOP
    shared := false;
    FOR app_table IN SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public'
      AND tablename NOT IN ('media', 'media_deletion_jobs', '_prisma_migrations') LOOP
      EXECUTE format('SELECT EXISTS (SELECT 1 FROM %I.%I AS r WHERE position($1 IN row_to_json(r.*)::text) > 0)',
        app_table.schemaname, app_table.tablename) INTO shared USING candidate.url;
      EXIT WHEN shared;
    END LOOP;
    IF NOT shared THEN
      INSERT INTO public.media_deletion_jobs(id, tenant_id, url, retry_after)
        VALUES (gen_random_uuid()::text, scope_id, candidate.url, TIMESTAMP '1970-01-01 00:00:00')
        ON CONFLICT (tenant_id, url) DO UPDATE SET retry_after = EXCLUDED.retry_after;
      DELETE FROM public.media WHERE tenant_id = scope_id AND url = candidate.url;
    END IF;
  END LOOP;

  SELECT to_jsonb(u) INTO preserved_keeper FROM public.users u WHERE u.id = keep_id;
  IF preserved_keeper IS NULL OR
    (preserved_keeper - ARRAY['updated_at','created_by_user_id','referred_by_code','lifetime_points','available_points','pending_points','current_tier_id','tier_achieved_at'])
    IS DISTINCT FROM
    (original_keeper - ARRAY['updated_at','created_by_user_id','referred_by_code','lifetime_points','available_points','pending_points','current_tier_id','tier_achieved_at']) THEN
    RAISE EXCEPTION 'Super Admin verification failed. All cleanup changes rolled back.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.users WHERE tenant_id = scope_id AND id <> keep_id) THEN
    RAISE EXCEPTION 'Unexpected remaining accounts. All cleanup changes rolled back.';
  END IF;
  SELECT count(*) INTO file_count FROM public.media_deletion_jobs WHERE tenant_id = scope_id;
  RAISE NOTICE 'Deleted % accounts and linked records. Preserved Super Admin admin@flyngo.com. Pending file removals: %.', target_count, file_count;
END
$cleanup$;

-- Verification: the protected administrator should be the only account in its tenant.
SELECT id, full_name, phone, email, deleted_at FROM public.users
WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = '00000000-0000-0000-0000-00000000admin');
