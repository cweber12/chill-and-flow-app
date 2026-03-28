import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/admin/create-class",
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
  createClass: vi.fn().mockResolvedValue({}),
  uploadClassVideo: vi.fn().mockResolvedValue("https://example.com/video.mp4"),
}));

import CreateClassPage from "@/app/admin/create-class/page";

describe("Create class page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the form fields", () => {
    render(<CreateClassPage />);
    expect(screen.getByText("Create New Class")).toBeDefined();
    expect(screen.getByLabelText("Class Title")).toBeDefined();
    expect(screen.getByLabelText("Description")).toBeDefined();
    expect(screen.getByLabelText("Type")).toBeDefined();
    expect(screen.getByLabelText("Difficulty")).toBeDefined();
    expect(screen.getByLabelText("Duration (min)")).toBeDefined();
    expect(screen.getByText("Create Class")).toBeDefined();
  });
});
