import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../../src/components/common/ErrorBoundary";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

it("renders Component without error", () => {
  render(
    <ErrorBoundary>
      <div>Hello world</div>
    </ErrorBoundary>
  );
  expect(screen.getByText("Hello world")).toBeDefined();
});

it("catches error and display a fallback UI when rendering Component with error", async () => {
  const Button = () => {
    const [count, setCount] = useState(0);
    if (count === 1) {
      throw new Error("Simulated error");
    }
    return <button onClick={() => setCount(1)}>Hello world</button>;
  };
  render(
    <ErrorBoundary>
      <Button />
    </ErrorBoundary>
  );
  const button = screen.getByRole("button");
  expect(screen.getByText("Hello world")).toBeDefined();
  jest.spyOn(global.console, "error").mockImplementation();
  expect(button).toBeDefined();
  await userEvent.click(button);
  expect(screen.queryByText("Hello world")).toBeNull();
  expect(screen.getByText("Error: Simulated error")).toBeDefined();
});
