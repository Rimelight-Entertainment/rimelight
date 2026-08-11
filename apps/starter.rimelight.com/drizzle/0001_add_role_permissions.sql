ALTER TABLE "page_templates" ADD COLUMN IF NOT EXISTS "role_permissions" jsonb DEFAULT '{"whoCanCreate":[],"whoCanEdit":[],"whoCanReview":[],"whoCanView":[]}'::jsonb NOT NULL;
