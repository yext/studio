import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FieldPicker from "../../../src/components/FieldPicker/FieldPicker";
import filterEntityData from "../../../src/utils/filterEntityData";
import { PropValueType, TypeGuards } from "@yext/studio-plugin";

const entityData = {
  __: {
    templateType: "JS",
  },
  address: {
    city: "Chicago",
    postalCode: "60661",
    region: "IL",
  },
  bool: false,
  name: "benny",
  profile: {
    desc: "lorem ipsum quicksum pipsum",
  },
  c_myCustomField: "my custom field",
};

it("can display available string fields and objects containing string fields", async () => {
  renderFieldPicker();
  expect(screen.queryByText(/\w/)).toBeNull();
  await userEvent.click(
    screen.getByRole("button", { name: "Toggle field picker" })
  );
  expect(screen.getByText("Address")).toBeDefined();
  expect(screen.getByText("Name")).toBeDefined();
  expect(screen.getByText("Profile")).toBeDefined();
  expect(screen.queryByText("__")).toBeNull();
  expect(screen.queryByText("Bool")).toBeNull();
  expect(screen.getByText("My Custom Field")).toBeDefined();
});

it("can display nested fields", async () => {
  renderFieldPicker();
  await userEvent.click(
    screen.getByRole("button", { name: "Toggle field picker" })
  );
  expect(screen.queryByText("City")).toBeNull();
  await userEvent.click(screen.getByText("Address"));
  expect(screen.getByText("City")).toBeDefined();
});

it("can select nested fields", async () => {
  const handleFieldSelection = jest.fn();
  renderFieldPicker(handleFieldSelection);
  await userEvent.click(
    screen.getByRole("button", { name: "Toggle field picker" })
  );
  await userEvent.click(screen.getByText("Address"));
  expect(handleFieldSelection).toHaveBeenCalledTimes(0);
  await userEvent.click(screen.getByText("Postal Code"));
  expect(handleFieldSelection).toHaveBeenCalledTimes(1);
  expect(handleFieldSelection).toHaveBeenCalledWith(
    "document.address.postalCode"
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
  await userEvent.click(screen.getByText("Address"));
  expect(screen.getByText("City")).toBeDefined();
  await userEvent.click(screen.getByText("Address"));
  expect(screen.queryByText("City")).toBeNull();
});

it("opening one section will collapse unrelated ones", async () => {
  renderFieldPicker();
  await userEvent.click(
    screen.getByRole("button", { name: "Toggle field picker" })
  );
  await userEvent.click(screen.getByText("Address"));
  expect(screen.getByText("City")).toBeDefined();
  expect(screen.queryByText("Desc")).toBeNull();
  await userEvent.click(screen.getByText("Profile"));
  expect(screen.queryByText("City")).toBeNull();
  expect(screen.getByText("Desc")).toBeDefined();
});

function renderFieldPicker(handleFieldSelection = jest.fn()) {
  const fieldFilter = (value: unknown) =>
    TypeGuards.valueMatchesPropType({ type: PropValueType.string }, value);
  render(
    <FieldPicker
      filteredEntityData={filterEntityData(fieldFilter, entityData)}
      handleFieldSelection={handleFieldSelection}
    />
  );
}
