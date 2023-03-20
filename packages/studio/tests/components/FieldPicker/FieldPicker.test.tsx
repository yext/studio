import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FieldPicker from "../../../src/components/FieldPicker/FieldPicker";

const streamDocument = {
  __: {
    templateType: "JS",
  },
  address: {
    city: "Chicago",
    countryCode: "US",
    line1: "500 West Madison St.",
    line2: "Suite 2810",
    localizedCountryName: "United States",
    localizedRegionName: "Illinois",
    postalCode: "60661",
    region: "IL",
  },
  addressHidden: false,
  name: "benny",
  profile: {
    description: "lorem ipsum quicksum pipsum",
  },
};

it("can display available string fields and objects containing string fields", async () => {
  renderFieldPicker();
  expect(screen.queryByText(/\w/)).toBeNull();
  await userEvent.click(
    screen.getByRole("button", { name: "Toggle field picker" })
  );
  expect(screen.getByText("address")).toBeDefined();
  expect(screen.getByText("name")).toBeDefined();
  expect(screen.getByText("profile")).toBeDefined();
  expect(screen.queryByText("__")).toBeNull();
  expect(screen.queryByText("addressHidden")).toBeNull();
});

it("can display nested fields", async () => {
  renderFieldPicker();
  await userEvent.click(
    screen.getByRole("button", { name: "Toggle field picker" })
  );
  expect(screen.queryByText("city")).toBeNull();
  await userEvent.click(screen.getByText("address"));
  expect(screen.getByText("city")).toBeDefined();
});

it("can select nested fields", async () => {
  const handleFieldSelection = jest.fn();
  renderFieldPicker(handleFieldSelection);
  await userEvent.click(
    screen.getByRole("button", { name: "Toggle field picker" })
  );
  await userEvent.click(screen.getByText("address"));
  expect(handleFieldSelection).toHaveBeenCalledTimes(0);
  await userEvent.click(screen.getByText("localizedCountryName"));
  expect(handleFieldSelection).toHaveBeenCalledTimes(1);
  expect(handleFieldSelection).toHaveBeenCalledWith(
    "document.address.localizedCountryName"
  );
});

it("can close the field picker", async () => {
  renderFieldPicker();
  await userEvent.click(
    screen.getByRole("button", { name: "Toggle field picker" })
  );
  expect(screen.getAllByText(/\w/)).toBeDefined();
  await userEvent.click(
    screen.getByRole("button", { name: "Toggle field picker" })
  );
  expect(screen.queryByText(/\w/)).toBeNull();
});

it("can collapse a section", async () => {
  renderFieldPicker();
  await userEvent.click(
    screen.getByRole("button", { name: "Toggle field picker" })
  );
  await userEvent.click(screen.getByText("address"));
  expect(screen.getByText("city")).toBeDefined();
  await userEvent.click(screen.getByText("address"));
  expect(screen.queryByText("city")).toBeNull();
});

it("opening one section will collapse unrelated ones", async () => {
  renderFieldPicker();
  await userEvent.click(
    screen.getByRole("button", { name: "Toggle field picker" })
  );
  await userEvent.click(screen.getByText("address"));
  expect(screen.getByText("city")).toBeDefined();
  expect(screen.queryByText("description")).toBeNull();
  await userEvent.click(screen.getByText("profile"));
  expect(screen.queryByText("city")).toBeNull();
  expect(screen.getByText("description")).toBeDefined();
});

function renderFieldPicker(handleFieldSelection = jest.fn()) {
  render(
    <FieldPicker
      streamDocument={streamDocument}
      handleFieldSelection={handleFieldSelection}
      fieldType="string"
    />
  );
}
