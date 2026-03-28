-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 001: yoga_classes, yoga_series, series_classes, storage bucket
-- Run this in the Supabase SQL editor or via `supabase db push`.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Helpers ───────────────────────────────────────────────────────────────────

-- Role check: returns the value of user_metadata.role from the current JWT.
-- Used in RLS policies below.
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

-- Indexes
create index if not exists yoga_classes_type_idx       on public.yoga_classes (type);
create index if not exists yoga_classes_difficulty_idx on public.yoga_classes (difficulty);
create index if not exists yoga_classes_created_at_idx on public.yoga_classes (created_at desc);

-- RLS
alter table public.yoga_classes enable row level security;

create policy "classes_select_authenticated"
  on public.yoga_classes for select
  to authenticated
  using (true);

create policy "classes_insert_admin"
  on public.yoga_classes for insert
  to authenticated
  with check (public.current_user_role() = 'admin');

create policy "classes_update_admin"
  on public.yoga_classes for update
  to authenticated
  using  (instructor_id = auth.uid() and public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "classes_delete_admin"
  on public.yoga_classes for delete
  to authenticated
  using  (instructor_id = auth.uid() and public.current_user_role() = 'admin');

-- ── yoga_series ───────────────────────────────────────────────────────────────

create table if not exists public.yoga_series (
  id            uuid        primary key default gen_random_uuid(),
  title         text        not null,
  description   text        not null default '',
  instructor_id uuid        not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now()
);

create index if not exists yoga_series_created_at_idx on public.yoga_series (created_at desc);

alter table public.yoga_series enable row level security;

create policy "series_select_authenticated"
  on public.yoga_series for select
  to authenticated
  using (true);

create policy "series_insert_admin"
  on public.yoga_series for insert
  to authenticated
  with check (public.current_user_role() = 'admin');

create policy "series_update_admin"
  on public.yoga_series for update
  to authenticated
  using  (instructor_id = auth.uid() and public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "series_delete_admin"
  on public.yoga_series for delete
  to authenticated
  using  (instructor_id = auth.uid() and public.current_user_role() = 'admin');

-- ── series_classes (ordered join table) ──────────────────────────────────────

create table if not exists public.series_classes (
  series_id uuid    not null references public.yoga_series(id)  on delete cascade,
  class_id  uuid    not null references public.yoga_classes(id) on delete cascade,
  position  integer not null,
  primary key (series_id, class_id)
);

create index if not exists series_classes_series_idx on public.series_classes (series_id, position);

alter table public.series_classes enable row level security;

create policy "series_classes_select_authenticated"
  on public.series_classes for select
  to authenticated
  using (true);

create policy "series_classes_insert_admin"
  on public.series_classes for insert
  to authenticated
  with check (public.current_user_role() = 'admin');

create policy "series_classes_update_admin"
  on public.series_classes for update
  to authenticated
  using  (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "series_classes_delete_admin"
  on public.series_classes for delete
  to authenticated
  using  (public.current_user_role() = 'admin');

-- ── Storage: class_videos bucket ─────────────────────────────────────────────
-- 500 MB limit per file; only common video formats accepted.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'class_videos',
  'class_videos',
  true,
  524288000,
  array['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
)
on conflict (id) do nothing;

create policy "videos_select_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'class_videos');

create policy "videos_insert_admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'class_videos' and public.current_user_role() = 'admin');

create policy "videos_delete_admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'class_videos' and public.current_user_role() = 'admin');
