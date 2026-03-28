import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MOCK_ALL_SERIES } from "@/lib/mock-data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/admin/series",
}));

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    user: { user_metadata: {} },
    role: "admin",
    loading: false,
    signOut: vi.fn(),
  }),
}));

vi.mock("@/lib/supabase/queries", () => ({
  fetchAllSeries: vi.fn().mockResolvedValue(MOCK_ALL_SERIES),
}));

import AdminSeriesPage from "@/app/admin/series/page";

describe("Admin series page", () => {
  it("renders series cards after data loads", async () => {
    render(<AdminSeriesPage />);
    await waitFor(() => {
      expect(screen.getByText("All Series")).toBeDefined();
      expect(screen.getByText("7-Day Beginner Journey")).toBeDefined();
      expect(screen.getByText("Strength & Power Series")).toBeDefined();
      expect(screen.getByText("Rest & Restore")).toBeDefined();
    });
  });

  it("shows class count for each series", async () => {
    render(<AdminSeriesPage />);
    await waitFor(() => {
      expect(screen.getByText("7 classes")).toBeDefined();
      expect(screen.getByText("4 classes")).toBeDefined();
      expect(screen.getByText("5 classes")).toBeDefined();
    });
  });
});
