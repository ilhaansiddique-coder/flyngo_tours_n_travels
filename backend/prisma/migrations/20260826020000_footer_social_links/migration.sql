ALTER TABLE "footer_configs"
  ADD COLUMN IF NOT EXISTS "social_links" JSONB NOT NULL DEFAULT '[]';

UPDATE "footer_configs" AS f
SET "social_links" = source.links
FROM (
  SELECT
    ts."tenant_id",
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', 'social-' || source.platform,
          'platform', source.platform,
          'label', source.label,
          'href', source.href,
          'isVisible', true,
          'openInNewTab', true
        ) ORDER BY source.sort_order
      ) FILTER (WHERE source.href IS NOT NULL AND source.href <> ''),
      '[]'::jsonb
    ) AS links
  FROM "tenant_settings" ts
  CROSS JOIN LATERAL (
    VALUES
      ('facebook', 'Facebook', ts."facebook_url", 1),
      ('instagram', 'Instagram', ts."instagram_url", 2),
      ('twitter', 'Twitter', ts."twitter_url", 3),
      ('youtube', 'YouTube', ts."youtube_url", 4)
  ) AS source(platform, label, href, sort_order)
  GROUP BY ts."tenant_id"
) AS source
WHERE f."tenant_id" = source."tenant_id";
