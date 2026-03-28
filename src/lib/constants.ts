import type { ClassDifficulty, ClassType } from "@/types";

export const CLASS_TYPES: ClassType[] = [
  "vinyasa",
  "hatha",
  "yin",
  "restorative",
  "power",
  "meditation",
];

export const DIFFICULTIES: ClassDifficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
];

export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
