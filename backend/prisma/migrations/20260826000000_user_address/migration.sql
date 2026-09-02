-- Add customer address to users, captured at signup (name + phone + address).
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address" TEXT;
