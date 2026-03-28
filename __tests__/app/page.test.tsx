import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
    refresh: vi.fn(),
    push: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Mock the auth hook
const mockUseAuth = vi.fn();
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  }),
}));

import Home from "@/app/page";

describe("Home page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading spinner when auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, role: null, loading: true });
    const { container } = render(<Home />);
    expect(container.querySelector(".animate-spin")).toBeTruthy();
  });

  it("renders login form when user is not authenticated", () => {
    mockUseAuth.mockReturnValue({ user: null, role: null, loading: false });
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Chill",
    );
    expect(screen.getAllByText("Sign In").length).toBeGreaterThan(0);
    expect(screen.getByText("Create Account")).toBeDefined();
  });

  it("renders login form with email and password fields", () => {
    mockUseAuth.mockReturnValue({ user: null, role: null, loading: false });
    render(<Home />);
    expect(screen.getByLabelText("Email")).toBeDefined();
    expect(screen.getByLabelText("Password")).toBeDefined();
  });
});
