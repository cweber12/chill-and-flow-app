import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/admin",
}));

const mockUseAuth = vi.fn();
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

import AdminDashboard from "@/app/admin/page";

describe("Admin dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading spinner when loading", () => {
    mockUseAuth.mockReturnValue({ user: null, role: "admin", loading: true });
    const { container } = render(<AdminDashboard />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("renders dashboard cards for admin", () => {
    mockUseAuth.mockReturnValue({
      user: { user_metadata: { full_name: "Yogi" } },
      role: "admin",
      loading: false,
    });
    render(<AdminDashboard />);
    expect(screen.getByText("Welcome back, Yogi")).toBeDefined();
    expect(screen.getByText("All Classes")).toBeDefined();
    expect(screen.getByText("All Series")).toBeDefined();
    expect(screen.getByText("My Profile")).toBeDefined();
    expect(screen.getByText("Create Class")).toBeDefined();
    expect(screen.getByText("Create Series")).toBeDefined();
  });
});
