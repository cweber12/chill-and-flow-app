import { render, screen, waitFor, act } from "@testing-library/react";
import { Suspense } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockInstructor, mockClasses, mockSeries } = vi.hoisted(() => ({
  mockInstructor: {
    id: "inst-1",
    full_name: "Sage Rivera",
    bio: "Certified vinyasa and meditation teacher with a decade of experience.",
    location: "Sedona, AZ",
    photos: ["https://example.com/sage1.jpg"],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
  mockClasses: [
    {
      id: "c1",
      title: "Morning Vinyasa Flow",
      description: "Energizing morning flow.",
      type: "vinyasa",
      difficulty: "intermediate",
      duration_minutes: 45,
      location: "Sedona, AZ",
      created_at: "2026-03-01T08:00:00Z",
      instructor_id: "inst-1",
    },
  ],
  mockSeries: [
    {
      id: "s1",
      title: "7-Day Beginner Journey",
      description: "A week-long introduction to yoga.",
      classes: ["c1"],
      created_at: "2026-03-01T00:00:00Z",
      instructor_id: "inst-1",
    },
  ],
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/instructors/inst-1",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { id: "student-1", user_metadata: {} },
    role: "user",
    loading: false,
    signOut: vi.fn(),
  }),
}));

vi.mock("@/lib/supabase/queries", () => ({
  fetchInstructorById: vi.fn().mockResolvedValue(mockInstructor),
  fetchClassesByInstructor: vi.fn().mockResolvedValue(mockClasses),
  fetchSeriesByInstructor: vi.fn().mockResolvedValue(mockSeries),
  followInstructor: vi.fn().mockResolvedValue(undefined),
  unfollowInstructor: vi.fn().mockResolvedValue(undefined),
  fetchFollowedInstructorIds: vi.fn().mockResolvedValue([]),
  fetchFollowerCount: vi.fn().mockResolvedValue(42),
}));

import { fetchInstructorById } from "@/lib/supabase/queries";
import InstructorDetailPage from "@/app/instructors/[id]/page";

describe("Instructor detail page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchInstructorById).mockResolvedValue(mockInstructor);
  });

  it("renders loading state while data loads", async () => {
    // Make fetch hang so we see the loading state after params resolve
    vi.mocked(fetchInstructorById).mockReturnValue(new Promise(() => {}));
    await act(async () => {
      render(
        <Suspense fallback={<p>Suspended</p>}>
          <InstructorDetailPage params={Promise.resolve({ id: "inst-1" })} />
        </Suspense>,
      );
    });
    expect(screen.getByText("Loading…")).toBeDefined();
  });

  it("renders instructor info, bio, and location after loading", async () => {
    await act(async () => {
      render(
        <Suspense fallback={<p>Suspended</p>}>
          <InstructorDetailPage params={Promise.resolve({ id: "inst-1" })} />
        </Suspense>,
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Sage Rivera")).toBeDefined();
    });
    expect(screen.getByText("📍 Sedona, AZ")).toBeDefined();
    expect(
      screen.getByText(
        "Certified vinyasa and meditation teacher with a decade of experience.",
      ),
    ).toBeDefined();
  });

  it("renders classes section", async () => {
    await act(async () => {
      render(
        <Suspense fallback={<p>Suspended</p>}>
          <InstructorDetailPage params={Promise.resolve({ id: "inst-1" })} />
        </Suspense>,
      );
    });
    await waitFor(() => {
      expect(screen.getByText("Classes")).toBeDefined();
    });
    expect(screen.getByText("Morning Vinyasa Flow")).toBeDefined();
    expect(screen.getByText("45 min")).toBeDefined();
  });
});
