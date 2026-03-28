import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MOCK_ALL_CLASSES, MOCK_ALL_SERIES } from "@/lib/mock-data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/dashboard/browse",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { user_metadata: {} },
    role: "user",
    loading: false,
    signOut: vi.fn(),
  }),
}));

vi.mock("@/lib/supabase/queries", () => ({
  fetchAllClasses: vi.fn().mockResolvedValue(MOCK_ALL_CLASSES),
  fetchAllSeries: vi.fn().mockResolvedValue(MOCK_ALL_SERIES),
  fetchAllInstructors: vi.fn().mockResolvedValue([]),
  fetchFollowedInstructorIds: vi.fn().mockResolvedValue([]),
  fetchMyClassEnrollments: vi.fn().mockResolvedValue([]),
  fetchMySeriesEnrollments: vi.fn().mockResolvedValue([]),
  enrollInClass: vi.fn().mockResolvedValue(undefined),
  unenrollFromClass: vi.fn().mockResolvedValue(undefined),
  enrollInSeries: vi.fn().mockResolvedValue(undefined),
  unenrollFromSeries: vi.fn().mockResolvedValue(undefined),
}));

import BrowseClassesPage from "@/app/dashboard/browse/page";

describe("Browse classes page", () => {
  it("renders search and filter controls", () => {
    render(<BrowseClassesPage />);
    expect(screen.getByPlaceholderText("Search classes...")).toBeDefined();
    expect(screen.getByLabelText("Filter by type")).toBeDefined();
    expect(screen.getByLabelText("Filter by difficulty")).toBeDefined();
  });

  it("renders class cards after data loads", async () => {
    render(<BrowseClassesPage />);
    await waitFor(() => {
      expect(screen.getByText("Morning Vinyasa Flow")).toBeDefined();
      expect(screen.getByText("Gentle Yin Restore")).toBeDefined();
      expect(screen.getByText("Power Sculpt")).toBeDefined();
    });
  });

  it("filters classes by search", async () => {
    render(<BrowseClassesPage />);
    await waitFor(() => screen.getByText("Morning Vinyasa Flow"));
    const searchInput = screen.getByPlaceholderText("Search classes...");
    fireEvent.change(searchInput, { target: { value: "vinyasa" } });
    expect(screen.getByText("Morning Vinyasa Flow")).toBeDefined();
    expect(screen.queryByText("Power Sculpt")).toBeNull();
  });

  it("filters classes by type", async () => {
    render(<BrowseClassesPage />);
    await waitFor(() => screen.getByText("Morning Vinyasa Flow"));
    const typeSelect = screen.getByLabelText("Filter by type");
    fireEvent.change(typeSelect, { target: { value: "meditation" } });
    expect(screen.getByText("Guided Meditation")).toBeDefined();
    expect(screen.queryByText("Morning Vinyasa Flow")).toBeNull();
  });
});
