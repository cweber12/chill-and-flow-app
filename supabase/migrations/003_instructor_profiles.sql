-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 003: instructor_profiles table and instructor_photos storage bucket
-- ─────────────────────────────────────────────────────────────────────────────

-- ── instructor_profiles ───────────────────────────────────────────────────────

create table if not exists public.instructor_profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  full_name   text        not null default '',
  bio         text        not null default '',
  location    text        not null default '',
  photos      text[]      not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists instructor_profiles_location_idx on public.instructor_profiles (location);

alter table public.instructor_profiles enable row level security;

-- Anyone authenticated can read instructor profiles
create policy "profiles_select_authenticated"
  on public.instructor_profiles for select
  to authenticated
  using (true);

-- Instructors/admins can insert their own profile
create policy "profiles_insert_own"
  on public.instructor_profiles for insert
  to authenticated
  with check (id = auth.uid() and public.current_user_role() = 'admin');

-- Instructors/admins can update their own profile
create policy "profiles_update_own"
  on public.instructor_profiles for update
  to authenticated
  using  (id = auth.uid() and public.current_user_role() = 'admin')
  with check (id = auth.uid());

-- ── Storage: instructor_photos bucket ────────────────────────────────────────
-- 10 MB limit per file; common image formats.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'instructor_photos',
  'instructor_photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "photos_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'instructor_photos');

create policy "photos_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'instructor_photos' and public.current_user_role() = 'admin');

create policy "photos_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'instructor_photos' and public.current_user_role() = 'admin');

-- ── Add location column to yoga_classes ──────────────────────────────────────
-- Allows filtering classes by instructor location.

alter table public.yoga_classes add column if not exists location text not null default '';
create index if not exists yoga_classes_location_idx on public.yoga_classes (location);
