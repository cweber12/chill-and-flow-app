import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

const { mockProfile } = vi.hoisted(() => ({
  mockProfile: {
    id: "admin-1",
    full_name: "Sage Rivera",
    bio: "Certified yoga teacher specializing in vinyasa and meditation.",
    location: "Sedona, AZ",
    photos: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/admin/profile",
}));

const mockUseAuth = vi.fn();
vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock("@/lib/supabase/queries", () => ({
  fetchInstructorById: vi.fn().mockResolvedValue(mockProfile),
  upsertInstructorProfile: vi.fn(),
  uploadInstructorPhoto: vi.fn(),
}));

import InstructorProfilePage from "@/app/admin/profile/page";

describe("Instructor profile page", () => {
  it("renders loading state while auth is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, role: "admin", loading: true });
    render(<InstructorProfilePage />);
    expect(screen.getByText("Loading…")).toBeDefined();
  });

  it("renders profile form fields after loading", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "admin-1", user_metadata: {} },
      role: "admin",
      loading: false,
    });
    render(<InstructorProfilePage />);
    await waitFor(() => {
      expect(screen.getByLabelText("Full Name")).toBeDefined();
      expect(screen.getByLabelText("Bio")).toBeDefined();
      expect(screen.getByLabelText("Location")).toBeDefined();
    });
    expect((screen.getByLabelText("Full Name") as HTMLInputElement).value).toBe(
      "Sage Rivera",
    );
    expect((screen.getByLabelText("Bio") as HTMLTextAreaElement).value).toBe(
      "Certified yoga teacher specializing in vinyasa and meditation.",
    );
    expect(
      (screen.getByLabelText("Location") as HTMLInputElement).value,
    ).toBe("Sedona, AZ");
  });

  it("renders photo gallery section", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "admin-1", user_metadata: {} },
      role: "admin",
      loading: false,
    });
    render(<InstructorProfilePage />);
    await waitFor(() => {
      expect(screen.getByText("Photos")).toBeDefined();
    });
    expect(screen.getByAltText("Photo 1")).toBeDefined();
    expect(screen.getByAltText("Photo 2")).toBeDefined();
    expect(screen.getByLabelText("Add photo")).toBeDefined();
  });
});
