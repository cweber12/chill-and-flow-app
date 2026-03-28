import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MOCK_ALL_CLASSES } from "@/lib/mock-data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }),
  usePathname: () => "/classes/1",
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
  fetchClassById: vi
    .fn()
    .mockImplementation((id: string) =>
      Promise.resolve(MOCK_ALL_CLASSES.find((c) => c.id === id) ?? null),
    ),
}));

import ClassDetailPage from "@/app/classes/[id]/page";

describe("Class detail page", () => {
  it("renders class details for a valid id", async () => {
    await act(async () => {
      render(<ClassDetailPage params={Promise.resolve({ id: "1" })} />);
    });
    expect(screen.getByText("Morning Vinyasa Flow")).toBeDefined();
    expect(screen.getByText("About this class")).toBeDefined();
    expect(screen.getByText("← Back to classes")).toBeDefined();
  });

  it("renders not-found for invalid id", async () => {
    await act(async () => {
      render(<ClassDetailPage params={Promise.resolve({ id: "999" })} />);
    });
    expect(screen.getByText("Class not found")).toBeDefined();
  });
});
