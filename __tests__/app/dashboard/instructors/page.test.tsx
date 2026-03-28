import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

const { mockInstructors } = vi.hoisted(() => ({
  mockInstructors: [
    {
      id: "inst-1",
      full_name: "Sage Rivera",
      bio: "Vinyasa specialist with 10 years of teaching.",
      location: "Sedona, AZ",
      photos: ["https://example.com/sage.jpg"],
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-03-01T00:00:00Z",
    },
    {
      id: "inst-2",
      full_name: "Luna Chen",
      bio: "Yin and restorative yoga expert.",
      location: "Portland, OR",
      photos: [],
      created_at: "2026-01-15T00:00:00Z",
      updated_at: "2026-02-20T00:00:00Z",
    },
  ],
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/dashboard/instructors",
}));

vi.mock("@/lib/supabase/queries", () => ({
  fetchAllInstructors: vi.fn().mockResolvedValue(mockInstructors),
}));

import InstructorSearchPage from "@/app/dashboard/instructors/page";

describe("Instructor search page", () => {
  it("renders loading state initially", () => {
    render(<InstructorSearchPage />);
    expect(screen.getByText("Loading instructors…")).toBeDefined();
  });

  it("renders instructor cards after data loads", async () => {
    render(<InstructorSearchPage />);
    await waitFor(() => {
      expect(screen.getByText("Sage Rivera")).toBeDefined();
      expect(screen.getByText("Luna Chen")).toBeDefined();
    });
    expect(screen.getByText("📍 Sedona, AZ")).toBeDefined();
    expect(screen.getByText("📍 Portland, OR")).toBeDefined();
  });

  it("filters instructors by search text", async () => {
    render(<InstructorSearchPage />);
    await waitFor(() => screen.getByText("Sage Rivera"));
    const searchInput = screen.getByPlaceholderText(
      "Search by name, location, or specialty...",
    );
    fireEvent.change(searchInput, { target: { value: "luna" } });
    expect(screen.getByText("Luna Chen")).toBeDefined();
    expect(screen.queryByText("Sage Rivera")).toBeNull();
  });
});
