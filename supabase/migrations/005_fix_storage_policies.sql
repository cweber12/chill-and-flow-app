-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 005: Fix colliding storage policy names + reload schema cache
--
-- Migration 003 created policies on storage.objects named:
--   photos_select_authenticated  (bucket_id = 'instructor_photos')
--   photos_insert_admin          (bucket_id = 'instructor_photos')
--   photos_delete_admin          (bucket_id = 'instructor_photos')
--
-- Migration 004 tried to create policies with the same prefix:
--   photos_select_authenticated  ← NAME COLLISION → fails silently
--   photos_insert_authenticated  ← may not have been created
--   photos_delete_authenticated  ← may not have been created
--
-- This migration drops the conflicting policies and recreates them all
-- with unique, bucket-prefixed names.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Drop existing storage policies (ignore errors if they don't exist) ───────

drop policy if exists "photos_select_authenticated" on storage.objects;
drop policy if exists "photos_insert_admin"          on storage.objects;
drop policy if exists "photos_delete_admin"          on storage.objects;
drop policy if exists "photos_insert_authenticated"  on storage.objects;
drop policy if exists "photos_delete_authenticated"  on storage.objects;

-- ── Recreate instructor_photos bucket policies with unique names ─────────────

create policy "instructor_photos_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'instructor_photos');

create policy "instructor_photos_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'instructor_photos' and public.current_user_role() = 'admin');

create policy "instructor_photos_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'instructor_photos' and public.current_user_role() = 'admin');

-- ── Ensure photos bucket exists ──────────────────────────────────────────────

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- ── Create photos bucket policies with unique names ──────────────────────────
-- Any authenticated user can read, upload, and delete from the shared photos bucket.

create policy "photos_bucket_select"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'photos');

create policy "photos_bucket_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

create policy "photos_bucket_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos');

-- ── Reload PostgREST schema cache ────────────────────────────────────────────
-- This ensures new tables from migrations 003/004 are visible via the API.

notify pgrst, 'reload schema';
