import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MOCK_ALL_CLASSES } from "@/lib/mock-data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/admin/classes",
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
  fetchAllClasses: vi.fn().mockResolvedValue(MOCK_ALL_CLASSES),
}));

import AdminClassesPage from "@/app/admin/classes/page";

describe("Admin classes page", () => {
  it("renders all type filter buttons", () => {
    render(<AdminClassesPage />);
    expect(screen.getByText("All")).toBeDefined();
    expect(screen.getByText("Vinyasa")).toBeDefined();
    expect(screen.getByText("Hatha")).toBeDefined();
    expect(screen.getByText("Yin")).toBeDefined();
    expect(screen.getByText("Meditation")).toBeDefined();
  });

  it("renders class cards after data loads", async () => {
    render(<AdminClassesPage />);
    await waitFor(() => {
      expect(screen.getByText("Morning Vinyasa Flow")).toBeDefined();
      expect(screen.getByText("Sunset Hatha")).toBeDefined();
    });
  });

  it("filters classes by type selection", async () => {
    render(<AdminClassesPage />);
    await waitFor(() => screen.getByText("Morning Vinyasa Flow"));
    const yinButton = screen.getByText("Yin");
    fireEvent.click(yinButton);
    expect(screen.getByText("Gentle Yin Restore")).toBeDefined();
    expect(screen.queryByText("Power Sculpt")).toBeNull();
  });
});
