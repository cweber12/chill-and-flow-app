-- ─────────────────────────────────────────────────────────────────────────────
-- Chill & Flow — One-shot Supabase setup script
--
-- Paste this entire file into the Supabase SQL Editor and click "Run".
-- It is fully idempotent — safe to run more than once.
--
-- What it does:
--   1. Creates the current_user_role() helper function
--   2. Creates all tables (yoga_classes, yoga_series, series_classes,
--      instructor_profiles, student_profiles, instructor_follows,
--      class_enrollments, series_enrollments)
--   3. Enables RLS and creates all policies on every table
--   4. Creates the photos storage bucket and its RLS policies
--   5. Reloads the PostgREST schema cache
-- ─────────────────────────────────────────────────────────────────────────────

-- ══════════════════════════════════════════════════════════════════════════════
-- 1. HELPER FUNCTION
-- ══════════════════════════════════════════════════════════════════════════════

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
as $$
  select coalesce(
    (auth.jwt() -> 'user_metadata' ->> 'role'),
    'user'
  )
$$;

-- ══════════════════════════════════════════════════════════════════════════════
-- 2. TABLES
-- ══════════════════════════════════════════════════════════════════════════════

-- ── yoga_classes ──────────────────────────────────────────────────────────────

create table if not exists public.yoga_classes (
  id               uuid        primary key default gen_random_uuid(),
  title            text        not null,
  description      text        not null default '',
  type             text        not null
                               check (type in ('vinyasa','hatha','yin','restorative','power','meditation')),
  difficulty       text        not null
                               check (difficulty in ('beginner','intermediate','advanced')),
  duration_minutes integer     not null check (duration_minutes between 1 and 300),
  video_url        text,
  thumbnail_url    text,
  instructor_id    uuid        not null references auth.users(id) on delete cascade,
  created_at       timestamptz not null default now()
);

alter table public.yoga_classes add column if not exists location  text not null default '';
alter table public.yoga_classes add column if not exists image_url text;

create index if not exists yoga_classes_type_idx       on public.yoga_classes (type);
create index if not exists yoga_classes_difficulty_idx on public.yoga_classes (difficulty);
create index if not exists yoga_classes_created_at_idx on public.yoga_classes (created_at desc);
create index if not exists yoga_classes_location_idx   on public.yoga_classes (location);

-- ── yoga_series ───────────────────────────────────────────────────────────────

create table if not exists public.yoga_series (
  id            uuid        primary key default gen_random_uuid(),
  title         text        not null,
  description   text        not null default '',
  instructor_id uuid        not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now()
);

alter table public.yoga_series add column if not exists image_url text;

create index if not exists yoga_series_created_at_idx on public.yoga_series (created_at desc);

-- ── series_classes (join table) ───────────────────────────────────────────────

create table if not exists public.series_classes (
  series_id uuid    not null references public.yoga_series(id) on delete cascade,
  class_id  uuid    not null references public.yoga_classes(id) on delete cascade,
  position  integer not null default 0,
  primary key (series_id, class_id)
);

create index if not exists series_classes_series_idx on public.series_classes (series_id);

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

alter table public.instructor_profiles add column if not exists city  text not null default '';
alter table public.instructor_profiles add column if not exists state text not null default '';
alter table public.instructor_profiles add column if not exists zip   text not null default '';

create index if not exists instructor_profiles_location_idx on public.instructor_profiles (location);

-- ── student_profiles ──────────────────────────────────────────────────────────

create table if not exists public.student_profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  full_name   text        not null default '',
  bio         text        not null default '',
  city        text        not null default '',
  state       text        not null default '',
  zip         text        not null default '',
  photo_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── instructor_follows ────────────────────────────────────────────────────────

create table if not exists public.instructor_follows (
  user_id       uuid not null references auth.users(id) on delete cascade,
  instructor_id uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (user_id, instructor_id)
);

create index if not exists instructor_follows_user_idx       on public.instructor_follows (user_id);
create index if not exists instructor_follows_instructor_idx on public.instructor_follows (instructor_id);

-- ── class_enrollments ─────────────────────────────────────────────────────────

create table if not exists public.class_enrollments (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  class_id   uuid        not null references public.yoga_classes(id) on delete cascade,
  status     text        not null default 'enrolled' check (status in ('enrolled','completed')),
  created_at timestamptz not null default now(),
  unique (user_id, class_id)
);

create index if not exists class_enrollments_user_idx  on public.class_enrollments (user_id, status);
create index if not exists class_enrollments_class_idx on public.class_enrollments (class_id);

-- ── series_enrollments ────────────────────────────────────────────────────────

create table if not exists public.series_enrollments (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  series_id  uuid        not null references public.yoga_series(id) on delete cascade,
  status     text        not null default 'enrolled' check (status in ('enrolled','completed')),
  created_at timestamptz not null default now(),
  unique (user_id, series_id)
);

create index if not exists series_enrollments_user_idx    on public.series_enrollments (user_id, status);
create index if not exists series_enrollments_series_idx  on public.series_enrollments (series_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- 3. ROW LEVEL SECURITY — TABLES
-- ══════════════════════════════════════════════════════════════════════════════

-- Helper: Idempotent policy creation — Postgres errors on duplicate policy
-- names, so we drop-if-exists then create.

-- ── yoga_classes ──────────────────────────────────────────────────────────────

alter table public.yoga_classes enable row level security;

drop policy if exists "classes_select_authenticated" on public.yoga_classes;
create policy "classes_select_authenticated"
  on public.yoga_classes for select to authenticated using (true);

drop policy if exists "classes_insert_admin" on public.yoga_classes;
create policy "classes_insert_admin"
  on public.yoga_classes for insert to authenticated
  with check (public.current_user_role() = 'admin');

drop policy if exists "classes_update_admin" on public.yoga_classes;
create policy "classes_update_admin"
  on public.yoga_classes for update to authenticated
  using  (instructor_id = auth.uid() and public.current_user_role() = 'admin')
  with check (instructor_id = auth.uid());

drop policy if exists "classes_delete_admin" on public.yoga_classes;
create policy "classes_delete_admin"
  on public.yoga_classes for delete to authenticated
  using (instructor_id = auth.uid() and public.current_user_role() = 'admin');

-- ── yoga_series ───────────────────────────────────────────────────────────────

alter table public.yoga_series enable row level security;

drop policy if exists "series_select_authenticated" on public.yoga_series;
create policy "series_select_authenticated"
  on public.yoga_series for select to authenticated using (true);

drop policy if exists "series_insert_admin" on public.yoga_series;
create policy "series_insert_admin"
  on public.yoga_series for insert to authenticated
  with check (public.current_user_role() = 'admin');

drop policy if exists "series_update_admin" on public.yoga_series;
create policy "series_update_admin"
  on public.yoga_series for update to authenticated
  using  (instructor_id = auth.uid() and public.current_user_role() = 'admin')
  with check (instructor_id = auth.uid());

drop policy if exists "series_delete_admin" on public.yoga_series;
create policy "series_delete_admin"
  on public.yoga_series for delete to authenticated
  using (instructor_id = auth.uid() and public.current_user_role() = 'admin');

-- ── series_classes ────────────────────────────────────────────────────────────

alter table public.series_classes enable row level security;

drop policy if exists "series_classes_select_authenticated" on public.series_classes;
create policy "series_classes_select_authenticated"
  on public.series_classes for select to authenticated using (true);

drop policy if exists "series_classes_insert_admin" on public.series_classes;
create policy "series_classes_insert_admin"
  on public.series_classes for insert to authenticated
  with check (public.current_user_role() = 'admin');

drop policy if exists "series_classes_delete_admin" on public.series_classes;
create policy "series_classes_delete_admin"
  on public.series_classes for delete to authenticated
  using (public.current_user_role() = 'admin');

-- ── instructor_profiles ───────────────────────────────────────────────────────

alter table public.instructor_profiles enable row level security;

drop policy if exists "profiles_select_authenticated" on public.instructor_profiles;
create policy "profiles_select_authenticated"
  on public.instructor_profiles for select to authenticated using (true);

drop policy if exists "profiles_insert_own" on public.instructor_profiles;
create policy "profiles_insert_own"
  on public.instructor_profiles for insert to authenticated
  with check (id = auth.uid() and public.current_user_role() = 'admin');

drop policy if exists "profiles_update_own" on public.instructor_profiles;
create policy "profiles_update_own"
  on public.instructor_profiles for update to authenticated
  using  (id = auth.uid() and public.current_user_role() = 'admin')
  with check (id = auth.uid());

-- ── student_profiles ──────────────────────────────────────────────────────────

alter table public.student_profiles enable row level security;

drop policy if exists "student_profiles_select_authenticated" on public.student_profiles;
create policy "student_profiles_select_authenticated"
  on public.student_profiles for select to authenticated using (true);

drop policy if exists "student_profiles_insert_own" on public.student_profiles;
create policy "student_profiles_insert_own"
  on public.student_profiles for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "student_profiles_update_own" on public.student_profiles;
create policy "student_profiles_update_own"
  on public.student_profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ── instructor_follows ────────────────────────────────────────────────────────

alter table public.instructor_follows enable row level security;

drop policy if exists "follows_select_authenticated" on public.instructor_follows;
create policy "follows_select_authenticated"
  on public.instructor_follows for select to authenticated using (true);

drop policy if exists "follows_insert_own" on public.instructor_follows;
create policy "follows_insert_own"
  on public.instructor_follows for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "follows_delete_own" on public.instructor_follows;
create policy "follows_delete_own"
  on public.instructor_follows for delete to authenticated
  using (user_id = auth.uid());

-- ── class_enrollments ─────────────────────────────────────────────────────────

alter table public.class_enrollments enable row level security;

drop policy if exists "enrollments_select_authenticated" on public.class_enrollments;
create policy "enrollments_select_authenticated"
  on public.class_enrollments for select to authenticated using (true);

drop policy if exists "enrollments_insert_own" on public.class_enrollments;
create policy "enrollments_insert_own"
  on public.class_enrollments for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "enrollments_update_own" on public.class_enrollments;
create policy "enrollments_update_own"
  on public.class_enrollments for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "enrollments_delete_own" on public.class_enrollments;
create policy "enrollments_delete_own"
  on public.class_enrollments for delete to authenticated
  using (user_id = auth.uid());

-- ── series_enrollments ────────────────────────────────────────────────────────

alter table public.series_enrollments enable row level security;

drop policy if exists "series_enrollments_select_authenticated" on public.series_enrollments;
create policy "series_enrollments_select_authenticated"
  on public.series_enrollments for select to authenticated using (true);

drop policy if exists "series_enrollments_insert_own" on public.series_enrollments;
create policy "series_enrollments_insert_own"
  on public.series_enrollments for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "series_enrollments_update_own" on public.series_enrollments;
create policy "series_enrollments_update_own"
  on public.series_enrollments for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "series_enrollments_delete_own" on public.series_enrollments;
create policy "series_enrollments_delete_own"
  on public.series_enrollments for delete to authenticated
  using (user_id = auth.uid());

-- ══════════════════════════════════════════════════════════════════════════════
-- 4. STORAGE BUCKET + POLICIES
-- ══════════════════════════════════════════════════════════════════════════════

-- Create the shared "photos" bucket (used for all profile photos).
-- If you already created it in the dashboard, this is a no-op.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Drop any old/conflicting storage policies from earlier migrations
drop policy if exists "photos_select_authenticated"  on storage.objects;
drop policy if exists "photos_insert_authenticated"  on storage.objects;
drop policy if exists "photos_delete_authenticated"  on storage.objects;
drop policy if exists "photos_insert_admin"          on storage.objects;
drop policy if exists "photos_delete_admin"          on storage.objects;
drop policy if exists "instructor_photos_select"     on storage.objects;
drop policy if exists "instructor_photos_insert"     on storage.objects;
drop policy if exists "instructor_photos_delete"     on storage.objects;
drop policy if exists "photos_bucket_select"         on storage.objects;
drop policy if exists "photos_bucket_insert"         on storage.objects;
drop policy if exists "photos_bucket_delete"         on storage.objects;

-- Any authenticated user can read/upload/delete from the photos bucket.
create policy "photos_bucket_select"
  on storage.objects for select to authenticated
  using (bucket_id = 'photos');

create policy "photos_bucket_insert"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'photos');

create policy "photos_bucket_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'photos');

-- ══════════════════════════════════════════════════════════════════════════════
-- 5. RELOAD SCHEMA CACHE
-- ══════════════════════════════════════════════════════════════════════════════

-- Tell PostgREST to reload so new tables appear via the Supabase API immediately.
notify pgrst, 'reload schema';
