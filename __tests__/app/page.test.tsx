import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Home from "@/app/page";

describe("Home page", () => {
  it("renders the heading", () => {
    render(<Home />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Chill");
    expect(heading).toHaveTextContent("Flow");
  });

  it("renders the CTA links", () => {
    render(<Home />);
    expect(screen.getByText("Start Flowing")).toBeDefined();
    expect(screen.getByText("Learn More")).toBeDefined();
  });
});
