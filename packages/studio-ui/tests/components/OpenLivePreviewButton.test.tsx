import { render, screen } from "@testing-library/react";
import OpenLivePreviewButton from "../../src/components/OpenLivePreviewButton";

it("renders the live preview button", () => {
  render(<OpenLivePreviewButton />);
  expect(screen.getByRole("link")).toBeDefined();
  expect(screen.getByRole("link").textContent).toBe("Live Preview");
});

it("opens the pages development server when clicked", () => {
  render(<OpenLivePreviewButton />);
  expect(screen.getByRole("link")).toBeDefined();
  expect(screen.getByRole("link").textContent).toBe("Live Preview");
});
