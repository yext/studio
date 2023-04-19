import { render, screen } from "@testing-library/react";
import SaveButton from "../../src/components/SaveButton";
import userEvent from "@testing-library/user-event";
import mockStore from "../__utils__/mockStore";
import useStudioStore from "../../src/store/useStudioStore";
import { PropValueKind, PropValueType } from "@yext/studio-plugin";

it("enables the button when there are pending page changes", async () => {
  const RemovePage = () => {
    const removePage = useStudioStore((store) => store.pages.removePage);
    return <button onClick={() => removePage("world")}>Remove Page</button>;
  };
  render(
    <div>
      <SaveButton />
      <RemovePage />
    </div>
  );
  expect(
    screen.getByRole("button", { name: "Save Changes to Repository" })
  ).toBeDisabled();

  await userEvent.click(screen.getByRole("button", { name: "Remove Page" }));
  const saveButton = screen.getByRole("button", {
    name: "Save Changes to Repository",
  });
  expect(saveButton).not.toBeDisabled();

  await userEvent.click(saveButton);
  expect(saveButton).toBeDisabled();
});

it("enables the button when there are pending SiteSettingsValues changes", () => {
  mockStore({
    previousSave: {
      siteSettings: {
        values: undefined,
      },
      fileMetadatas: {
        UUIDToFileMetadata: {},
      },
    },
    siteSettings: {
      values: {
        anything: {
          valueType: PropValueType.string,
          value: "hi",
          kind: PropValueKind.Literal,
        },
      },
    },
    fileMetadatas: {
      UUIDToFileMetadata: {},
    },
  });
  render(<SaveButton />);
  const saveButton = screen.getByRole("button", {
    name: "Save Changes to Repository",
  });
  expect(saveButton).not.toBeDisabled();
});

it("disables the button when there are no pending changes", () => {
  mockStore({
    previousSave: {
      siteSettings: {
        values: {
          anything: {
            valueType: PropValueType.string,
            value: "hi",
            kind: PropValueKind.Literal,
          },
        },
      },
      fileMetadatas: {
        UUIDToFileMetadata: {},
      },
    },
    siteSettings: {
      values: {
        anything: {
          valueType: PropValueType.string,
          value: "hi",
          kind: PropValueKind.Literal,
        },
      },
    },
    fileMetadatas: {
      UUIDToFileMetadata: {},
    },
    pages: {
      pendingChanges: {
        pagesToRemove: new Set(),
        pagesToUpdate: new Set(),
      },
    },
  });
  render(<SaveButton />);
  const saveButton = screen.getByRole("button", {
    name: "Save Changes to Repository",
  });
  expect(saveButton).toBeDisabled();
});

it("triggers save changes action in store when click", async () => {
  const mockSaveChanges = jest.fn();
  mockStore({
    pages: {
      pendingChanges: {
        pagesToRemove: new Set(["universal"]),
        pagesToUpdate: new Set(),
      },
    },
    actions: {
      saveChanges: mockSaveChanges,
    },
  });
  render(<SaveButton />);
  const saveButton = screen.getByRole("button", {
    name: "Save Changes to Repository",
  });
  expect(
    screen.getByRole("button", { name: "Save Changes to Repository" })
  ).not.toBeDisabled();
  await userEvent.click(saveButton);
  expect(mockSaveChanges).toBeCalled();
});
