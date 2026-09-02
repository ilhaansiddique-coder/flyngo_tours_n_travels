-- Flexible JSON content block for visa country detail pages (intro, pricing
-- tiers, process, terms, facts, FAQ, key destinations). 100% data-driven page.
ALTER TABLE "visa_countries" ADD COLUMN "content" JSONB;
