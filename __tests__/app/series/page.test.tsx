import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MOCK_ALL_CLASSES, MOCK_ALL_SERIES } from "@/lib/mock-data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/series/s1",
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
  fetchSeriesById: vi.fn().mockImplementation((id: string) =>
    Promise.resolve(MOCK_ALL_SERIES.find((s) => s.id === id) ?? null),
  ),
  fetchClassById: vi.fn().mockImplementation((id: string) =>
    Promise.resolve(MOCK_ALL_CLASSES.find((c) => c.id === id) ?? null),
  ),
}));

import SeriesDetailPage from "@/app/series/[id]/page";

describe("Series detail page", () => {
  it("renders series details with class list", async () => {
    await act(async () => {
      render(<SeriesDetailPage params={Promise.resolve({ id: "s1" })} />);
    });
    expect(screen.getByText("7-Day Beginner Journey")).toBeDefined();
    expect(screen.getByText("← Back to series")).toBeDefined();
    expect(screen.getByText("Day 1")).toBeDefined();
    expect(screen.getByText("Day 7")).toBeDefined();
  });

  it("renders not-found for invalid series id", async () => {
    await act(async () => {
      render(<SeriesDetailPage params={Promise.resolve({ id: "invalid" })} />);
    });
    expect(screen.getByText("Series not found")).toBeDefined();
  });
});
