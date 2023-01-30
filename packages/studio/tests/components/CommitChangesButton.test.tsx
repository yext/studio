import { render, screen } from "@testing-library/react";
import CommitChangesButton from "../../src/components/CommitChangesButton";
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
      <CommitChangesButton />
      <RemovePage />
    </div>
  );
  expect(screen.getByRole("button", { name: "Save to file" })).toBeDisabled();

  await userEvent.click(screen.getByRole("button", { name: "Remove Page" }));
  const commitChangesButton = screen.getByRole("button", {
    name: "Save to file",
  });
  expect(commitChangesButton).not.toBeDisabled();

  await userEvent.click(commitChangesButton);
  expect(commitChangesButton).toBeDisabled();
});

it("enables the button when there are pending SiteSettingsValues changes", async () => {
  mockStore({
    previousCommit: {
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
  render(<CommitChangesButton />);
  const commitChangesButton = screen.getByRole("button", {
    name: "Save to file",
  });
  expect(commitChangesButton).not.toBeDisabled();
});

it("disables the button when there are no pending SiteSettingsValues changes", async () => {
  mockStore({
    previousCommit: {
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
  });
  render(<CommitChangesButton />);
  const commitChangesButton = screen.getByRole("button", {
    name: "Save to file",
  });
  expect(commitChangesButton).toBeDisabled();
});

it("triggers commit changes action in store when click", async () => {
  const mockCommitChangesAction = jest.fn();
  mockStore({
    pages: {
      pendingChanges: {
        pagesToRemove: new Set(["universal"]),
        pagesToUpdate: new Set(),
      },
    },
    commitChanges: mockCommitChangesAction,
  });
  render(<CommitChangesButton />);
  const commitChangesButton = screen.getByRole("button", {
    name: "Save to file",
  });
  expect(
    screen.getByRole("button", { name: "Save to file" })
  ).not.toBeDisabled();
  await userEvent.click(commitChangesButton);
  expect(mockCommitChangesAction).toBeCalled();
});
