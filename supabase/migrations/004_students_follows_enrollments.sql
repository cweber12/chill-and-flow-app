-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 004: student profiles, follows, enrollments, photos bucket,
--                background images for classes & series
-- ─────────────────────────────────────────────────────────────────────────────

-- ── student_profiles ─────────────────────────────────────────────────────────

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

alter table public.student_profiles enable row level security;

create policy "student_profiles_select_authenticated"
  on public.student_profiles for select
  to authenticated
  using (true);

create policy "student_profiles_insert_own"
  on public.student_profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "student_profiles_update_own"
  on public.student_profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ── instructor_follows ───────────────────────────────────────────────────────

create table if not exists public.instructor_follows (
  user_id       uuid not null references auth.users(id) on delete cascade,
  instructor_id uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (user_id, instructor_id)
);

create index if not exists instructor_follows_user_idx on public.instructor_follows (user_id);
create index if not exists instructor_follows_instructor_idx on public.instructor_follows (instructor_id);

alter table public.instructor_follows enable row level security;

create policy "follows_select_authenticated"
  on public.instructor_follows for select
  to authenticated
  using (true);

create policy "follows_insert_own"
  on public.instructor_follows for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "follows_delete_own"
  on public.instructor_follows for delete
  to authenticated
  using (user_id = auth.uid());

-- ── class_enrollments ────────────────────────────────────────────────────────

create table if not exists public.class_enrollments (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  class_id   uuid        not null references public.yoga_classes(id) on delete cascade,
  status     text        not null default 'enrolled' check (status in ('enrolled','completed')),
  created_at timestamptz not null default now(),
  unique (user_id, class_id)
);

create index if not exists class_enrollments_user_idx on public.class_enrollments (user_id, status);
create index if not exists class_enrollments_class_idx on public.class_enrollments (class_id);

alter table public.class_enrollments enable row level security;

create policy "enrollments_select_authenticated"
  on public.class_enrollments for select
  to authenticated
  using (true);

create policy "enrollments_insert_own"
  on public.class_enrollments for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "enrollments_update_own"
  on public.class_enrollments for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "enrollments_delete_own"
  on public.class_enrollments for delete
  to authenticated
  using (user_id = auth.uid());

-- ── series_enrollments ───────────────────────────────────────────────────────

create table if not exists public.series_enrollments (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references auth.users(id) on delete cascade,
  series_id  uuid        not null references public.yoga_series(id) on delete cascade,
  status     text        not null default 'enrolled' check (status in ('enrolled','completed')),
  created_at timestamptz not null default now(),
  unique (user_id, series_id)
);

create index if not exists series_enrollments_user_idx on public.series_enrollments (user_id, status);
create index if not exists series_enrollments_series_idx on public.series_enrollments (series_id);

alter table public.series_enrollments enable row level security;

create policy "series_enrollments_select_authenticated"
  on public.series_enrollments for select
  to authenticated
  using (true);

create policy "series_enrollments_insert_own"
  on public.series_enrollments for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "series_enrollments_update_own"
  on public.series_enrollments for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "series_enrollments_delete_own"
  on public.series_enrollments for delete
  to authenticated
  using (user_id = auth.uid());

-- ── photos storage bucket (shared for student + instructor profile photos) ───

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "photos_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'photos');

create policy "photos_insert_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos');

create policy "photos_delete_authenticated"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos');

-- ── Background images for classes and series ─────────────────────────────────

alter table public.yoga_classes  add column if not exists image_url text;
alter table public.yoga_series   add column if not exists image_url text;

-- ── Location columns on instructor_profiles (city/state/zip) ─────────────────
-- Migrate from single 'location' text to structured city/state/zip.

alter table public.instructor_profiles add column if not exists city  text not null default '';
alter table public.instructor_profiles add column if not exists state text not null default '';
alter table public.instructor_profiles add column if not exists zip   text not null default '';
