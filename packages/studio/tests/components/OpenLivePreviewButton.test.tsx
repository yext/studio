import { render, screen } from "@testing-library/react";
import OpenLivePreviewButton from "../../src/components/OpenLivePreviewButton";
import mockActivePage from "../__utils__/mockActivePage";

it("renders the button when there is an active page state", () => {
  mockActivePage({
    componentTree: [],
    filepath: "",
    cssImports: [],
  });

  render(<OpenLivePreviewButton />);
  expect(screen.getByRole("link")).toBeDefined();
  expect(screen.getByRole("link").textContent).toBe("Live Preview");
});

it("does not render when there is no active page state", () => {
  render(<OpenLivePreviewButton />);
  expect(screen.queryByRole("link")).toBeNull();
});

