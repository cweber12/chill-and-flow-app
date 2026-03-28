import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MOCK_ALL_CLASSES } from "@/lib/mock-data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/dashboard",
}));

const mockUseAuth = vi.fn();
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/lib/supabase/queries", () => ({
  fetchAllClasses: vi.fn().mockResolvedValue(MOCK_ALL_CLASSES),
  fetchAllSeries: vi.fn().mockResolvedValue([]),
  fetchMyClassEnrollments: vi.fn().mockResolvedValue([]),
  fetchMySeriesEnrollments: vi.fn().mockResolvedValue([]),
}));

import DashboardPage from "@/app/dashboard/page";

describe("User dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading spinner when loading", () => {
    mockUseAuth.mockReturnValue({ user: null, role: "user", loading: true });
    const { container } = render(<DashboardPage />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("renders welcome message and classes section", () => {
    mockUseAuth.mockReturnValue({
      user: { user_metadata: { full_name: "Student" } },
      role: "user",
      loading: false,
    });
    render(<DashboardPage />);
    expect(screen.getByText("Welcome, Student")).toBeDefined();
    expect(screen.getByText("Classes")).toBeDefined();
    expect(screen.getByText("Series")).toBeDefined();
  });
});
