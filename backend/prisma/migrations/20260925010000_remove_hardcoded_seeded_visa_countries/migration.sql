-- Remove all leftover hardcoded/seeded demo VisaCountry records from the database
DELETE FROM "visa_countries"
WHERE LOWER("slug") IN (
  'bangkok',
  'nepal',
  'singapore',
  'tokyo',
  'malaysia',
  'united-arab-emirates-dubai',
  'thailand',
  'australia',
  'united-kingdom-uk'
);
