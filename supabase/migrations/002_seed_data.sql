-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 002: Seed data for yoga_classes, yoga_series, and series_classes.
-- Run this AFTER 001_classes_series.sql.
-- Uses a known admin UUID; replace if your admin user has a different id.
-- ─────────────────────────────────────────────────────────────────────────────

-- Use a deterministic admin UUID for seeding. Replace with your real admin
-- user id if needed, or run: SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin' LIMIT 1;
-- For now we insert via a temporary variable.

do $$
declare
  admin_id uuid;
  c1  uuid; c2  uuid; c3  uuid; c4  uuid; c5  uuid; c6  uuid;
  c7  uuid; c8  uuid; c9  uuid; c10 uuid; c11 uuid; c12 uuid;
  s1  uuid; s2  uuid; s3  uuid;
begin
  -- Grab the first admin user. If none exists, create a placeholder.
  select id into admin_id
    from auth.users
    where raw_user_meta_data ->> 'role' = 'admin'
    limit 1;

  if admin_id is null then
    raise notice 'No admin user found — skipping seed. Create an admin account first, then re-run.';
    return;
  end if;

  -- ── Classes ───────────────────────────────────────────────

  insert into public.yoga_classes (id, title, description, type, difficulty, duration_minutes, instructor_id, created_at)
  values
    (gen_random_uuid(), 'Morning Vinyasa Flow',
     'Energizing morning flow to start your day with intention. Focus on sun salutations, standing poses, and breathwork to awaken body and mind.',
     'vinyasa', 'intermediate', 45, admin_id, '2026-03-01T08:00:00Z')
  returning id into c1;

  insert into public.yoga_classes (id, title, description, type, difficulty, duration_minutes, instructor_id, created_at)
  values
    (gen_random_uuid(), 'Gentle Yin Restore',
     'Deep stretching and relaxation for recovery days. Poses held 3-5 minutes to target connective tissue and promote flexibility.',
     'yin', 'beginner', 60, admin_id, '2026-03-05T10:00:00Z')
  returning id into c2;

  insert into public.yoga_classes (id, title, description, type, difficulty, duration_minutes, instructor_id, created_at)
  values
    (gen_random_uuid(), 'Power Sculpt',
     'High-intensity power yoga for strength building. Challenging arm balances, core work, and dynamic sequences.',
     'power', 'advanced', 50, admin_id, '2026-03-08T14:00:00Z')
  returning id into c3;

  insert into public.yoga_classes (id, title, description, type, difficulty, duration_minutes, instructor_id, created_at)
  values
    (gen_random_uuid(), 'Sunset Hatha',
     'Slow, mindful practice to wind down your evening. Gentle standing and seated poses with emphasis on breath awareness.',
     'hatha', 'beginner', 40, admin_id, '2026-03-10T18:00:00Z')
  returning id into c4;

  insert into public.yoga_classes (id, title, description, type, difficulty, duration_minutes, instructor_id, created_at)
  values
    (gen_random_uuid(), 'Guided Meditation',
     'A calming guided meditation for deep relaxation. Body scan, breathwork, and visualization techniques.',
     'meditation', 'beginner', 20, admin_id, '2026-03-12T07:00:00Z')
  returning id into c5;

  insert into public.yoga_classes (id, title, description, type, difficulty, duration_minutes, instructor_id, created_at)
  values
    (gen_random_uuid(), 'Restorative Bliss',
     'Gentle restorative poses with bolster and props support. Perfect for stress relief and nervous system regulation.',
     'restorative', 'beginner', 55, admin_id, '2026-03-14T16:00:00Z')
  returning id into c6;

  insert into public.yoga_classes (id, title, description, type, difficulty, duration_minutes, instructor_id, created_at)
  values
    (gen_random_uuid(), 'Flow & Let Go',
     'A creative vinyasa flow linking breath to movement with hip and heart openers.',
     'vinyasa', 'beginner', 35, admin_id, '2026-03-16T09:00:00Z')
  returning id into c7;

  insert into public.yoga_classes (id, title, description, type, difficulty, duration_minutes, instructor_id, created_at)
  values
    (gen_random_uuid(), 'Warrior Strength',
     'Build power through warrior sequences, lunges, and standing balances in this intermediate hatha class.',
     'hatha', 'intermediate', 45, admin_id, '2026-03-18T11:00:00Z')
  returning id into c8;

  insert into public.yoga_classes (id, title, description, type, difficulty, duration_minutes, instructor_id, created_at)
  values
    (gen_random_uuid(), 'Deep Yin Hips',
     'Target your hips and lower back with extended-hold yin poses for deep release.',
     'yin', 'intermediate', 50, admin_id, '2026-03-20T15:00:00Z')
  returning id into c9;

  insert into public.yoga_classes (id, title, description, type, difficulty, duration_minutes, instructor_id, created_at)
  values
    (gen_random_uuid(), 'Power Core Ignite',
     'Advanced core-focused power yoga. Planks, boat pose variations, and dynamic twists.',
     'power', 'advanced', 40, admin_id, '2026-03-22T13:00:00Z')
  returning id into c10;

  insert into public.yoga_classes (id, title, description, type, difficulty, duration_minutes, instructor_id, created_at)
  values
    (gen_random_uuid(), 'Breath & Be',
     'A meditation class focused on pranayama techniques: alternate nostril, box breathing, and ujjayi.',
     'meditation', 'intermediate', 25, admin_id, '2026-03-24T06:00:00Z')
  returning id into c11;

  insert into public.yoga_classes (id, title, description, type, difficulty, duration_minutes, instructor_id, created_at)
  values
    (gen_random_uuid(), 'Candlelight Restorative',
     'A nurturing evening restorative practice with supported poses and gentle music.',
     'restorative', 'beginner', 60, admin_id, '2026-03-26T20:00:00Z')
  returning id into c12;

  -- ── Series ────────────────────────────────────────────────

  insert into public.yoga_series (id, title, description, instructor_id, created_at)
  values
    (gen_random_uuid(), '7-Day Beginner Journey',
     'A week-long introduction to yoga. Each day builds on the previous, covering fundamentals of breath, alignment, and simple flows.',
     admin_id, '2026-03-01T00:00:00Z')
  returning id into s1;

  insert into public.yoga_series (id, title, description, instructor_id, created_at)
  values
    (gen_random_uuid(), 'Strength & Power Series',
     'Four classes designed to build physical strength and endurance through power yoga and challenging sequences.',
     admin_id, '2026-03-10T00:00:00Z')
  returning id into s2;

  insert into public.yoga_series (id, title, description, instructor_id, created_at)
  values
    (gen_random_uuid(), 'Rest & Restore',
     'A 5-day series focused on recovery, deep stretching, and nervous system regulation through yin and restorative practices.',
     admin_id, '2026-03-15T00:00:00Z')
  returning id into s3;

  -- ── Series ↔ Classes (ordered) ─────────────────────────────

  -- 7-Day Beginner Journey: c1, c4, c2, c6, c5, c7, c12
  insert into public.series_classes (series_id, class_id, position) values
    (s1, c1,  0), (s1, c4,  1), (s1, c2,  2), (s1, c6,  3),
    (s1, c5,  4), (s1, c7,  5), (s1, c12, 6);

  -- Strength & Power Series: c3, c10, c8, c1
  insert into public.series_classes (series_id, class_id, position) values
    (s2, c3,  0), (s2, c10, 1), (s2, c8,  2), (s2, c1,  3);

  -- Rest & Restore: c2, c6, c9, c12, c5
  insert into public.series_classes (series_id, class_id, position) values
    (s3, c2,  0), (s3, c6,  1), (s3, c9,  2), (s3, c12, 3), (s3, c5, 4);

end $$;
