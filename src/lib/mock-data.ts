import type { YogaClass, YogaSeries } from "@/types";

// 15 yoga class names — pick one per render via index rotation
const CLASS_TITLE_BANK = [
  "Morning Vinyasa Flow",
  "Sunset Hatha Calm",
  "Gentle Yin Restore",
  "Power Sculpt Burn",
  "Ocean Breath Meditation",
  "Sunrise Salutation",
  "Moonlit Restorative",
  "Core Strength Flow",
  "Deep Stretch Release",
  "Warrior Sequence",
  "Balanced Body Fusion",
  "Mindful Morning Practice",
  "Slow Flow Surrender",
  "Energizing Backbends",
  "Grounding Earth Flow",
] as const;

export function getPlaceholderTitle(): string {
  return CLASS_TITLE_BANK[Math.floor(Math.random() * CLASS_TITLE_BANK.length)];
}

// ── Mock classes ──────────────────────────────────────────

export const MOCK_ALL_CLASSES: YogaClass[] = [
  {
    id: "1",
    title: "Morning Vinyasa Flow",
    description:
      "Energizing morning flow to start your day with intention. Focus on sun salutations, standing poses, and breathwork to awaken body and mind.",
    type: "vinyasa",
    difficulty: "intermediate",
    duration_minutes: 45,
    location: "Sedona, AZ",
    created_at: "2026-03-01T08:00:00Z",
    instructor_id: "admin-1",
  },
  {
    id: "2",
    title: "Gentle Yin Restore",
    description:
      "Deep stretching and relaxation for recovery days. Poses held 3-5 minutes to target connective tissue and promote flexibility.",
    type: "yin",
    difficulty: "beginner",
    duration_minutes: 60,
    location: "Sedona, AZ",
    created_at: "2026-03-05T10:00:00Z",
    instructor_id: "admin-1",
  },
  {
    id: "3",
    title: "Power Sculpt",
    description:
      "High-intensity power yoga for strength building. Challenging arm balances, core work, and dynamic sequences.",
    type: "power",
    difficulty: "advanced",
    duration_minutes: 50,
    location: "Sedona, AZ",
    created_at: "2026-03-08T14:00:00Z",
    instructor_id: "admin-1",
  },
  {
    id: "4",
    title: "Sunset Hatha",
    description:
      "Slow, mindful practice to wind down your evening. Gentle standing and seated poses with emphasis on breath awareness.",
    type: "hatha",
    difficulty: "beginner",
    duration_minutes: 40,
    location: "Sedona, AZ",
    created_at: "2026-03-10T18:00:00Z",
    instructor_id: "admin-1",
  },
  {
    id: "5",
    title: "Guided Meditation",
    description:
      "A calming guided meditation for deep relaxation. Body scan, breathwork, and visualization techniques.",
    type: "meditation",
    difficulty: "beginner",
    duration_minutes: 20,
    location: "Sedona, AZ",
    created_at: "2026-03-12T07:00:00Z",
    instructor_id: "admin-1",
  },
  {
    id: "6",
    title: "Restorative Bliss",
    description:
      "Gentle restorative poses with bolster and props support. Perfect for stress relief and nervous system regulation.",
    type: "restorative",
    difficulty: "beginner",
    duration_minutes: 55,
    location: "Sedona, AZ",
    created_at: "2026-03-14T16:00:00Z",
    instructor_id: "admin-1",
  },
  {
    id: "7",
    title: "Flow & Let Go",
    description:
      "A creative vinyasa flow linking breath to movement with hip and heart openers.",
    type: "vinyasa",
    difficulty: "beginner",
    duration_minutes: 35,
    location: "Sedona, AZ",
    created_at: "2026-03-16T09:00:00Z",
    instructor_id: "admin-1",
  },
  {
    id: "8",
    title: "Warrior Strength",
    description:
      "Build power through warrior sequences, lunges, and standing balances in this intermediate hatha class.",
    type: "hatha",
    difficulty: "intermediate",
    duration_minutes: 45,
    location: "Sedona, AZ",
    created_at: "2026-03-18T11:00:00Z",
    instructor_id: "admin-1",
  },
  {
    id: "9",
    title: "Deep Yin Hips",
    description:
      "Target your hips and lower back with extended-hold yin poses for deep release.",
    type: "yin",
    difficulty: "intermediate",
    duration_minutes: 50,
    location: "Sedona, AZ",
    created_at: "2026-03-20T15:00:00Z",
    instructor_id: "admin-1",
  },
  {
    id: "10",
    title: "Power Core Ignite",
    description:
      "Advanced core-focused power yoga. Planks, boat pose variations, and dynamic twists.",
    type: "power",
    difficulty: "advanced",
    duration_minutes: 40,
    location: "Sedona, AZ",
    created_at: "2026-03-22T13:00:00Z",
    instructor_id: "admin-1",
  },
  {
    id: "11",
    title: "Breath & Be",
    description:
      "A meditation class focused on pranayama techniques: alternate nostril, box breathing, and ujjayi.",
    type: "meditation",
    difficulty: "intermediate",
    duration_minutes: 25,
    location: "Sedona, AZ",
    created_at: "2026-03-24T06:00:00Z",
    instructor_id: "admin-1",
  },
  {
    id: "12",
    title: "Candlelight Restorative",
    description:
      "A nurturing evening restorative practice with supported poses and gentle music.",
    type: "restorative",
    difficulty: "beginner",
    duration_minutes: 60,
    location: "Sedona, AZ",
    created_at: "2026-03-26T20:00:00Z",
    instructor_id: "admin-1",
  },
];

// ── Mock series ───────────────────────────────────────────

export const MOCK_ALL_SERIES: YogaSeries[] = [
  {
    id: "s1",
    title: "7-Day Beginner Journey",
    description:
      "A week-long introduction to yoga. Each day builds on the previous, covering fundamentals of breath, alignment, and simple flows.",
    classes: ["1", "4", "2", "6", "5", "7", "12"],
    created_at: "2026-03-01T00:00:00Z",
    instructor_id: "admin-1",
  },
  {
    id: "s2",
    title: "Strength & Power Series",
    description:
      "Four classes designed to build physical strength and endurance through power yoga and challenging sequences.",
    classes: ["3", "10", "8", "1"],
    created_at: "2026-03-10T00:00:00Z",
    instructor_id: "admin-1",
  },
  {
    id: "s3",
    title: "Rest & Restore",
    description:
      "A 5-day series focused on recovery, deep stretching, and nervous system regulation through yin and restorative practices.",
    classes: ["2", "6", "9", "12", "5"],
    created_at: "2026-03-18T00:00:00Z",
    instructor_id: "admin-1",
  },
];
