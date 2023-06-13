import { simpleGit, Response, RemoteWithRefs } from "simple-git";
import GitWrapper from "../../src/git/GitWrapper";
import { GitData } from "../../src/types";

jest.mock("simple-git", () => {
  return {
    simpleGit: () => {
      return {
        add: jest.fn(),
        commit: jest.fn(),
        push: jest.fn(),
        getRemotes: jest.fn(),
        revparse: jest.fn(),
        diff: jest.fn(),
        reset: jest.fn(),
      };
    },
  };
});

it("invokes Git commands correctly on deploy", async () => {
  const mockedGitInstance = simpleGit();
  const gitAddSpy = jest.spyOn(mockedGitInstance, "add");
  const gitCommitSpy = jest.spyOn(mockedGitInstance, "commit");
  const gitPushSpy = jest.spyOn(mockedGitInstance, "push");

  const gitWrapper = new GitWrapper(mockedGitInstance);

  await gitWrapper.deploy();

  expect(gitAddSpy).toBeCalledWith(".");
  expect(gitCommitSpy).toBeCalledWith("Yext Studio Commit");
  expect(gitPushSpy).toBeCalled();
});

describe("verifying canPush calculation", () => {
  const mockedGitInstance = simpleGit();
  const gitRemotesSpy = jest.spyOn(mockedGitInstance, "getRemotes");
  const gitRevParseSpy = jest.spyOn(mockedGitInstance, "revparse");
  const gitDiffSpy = jest.spyOn(mockedGitInstance, "diff");

  const gitWrapper = new GitWrapper(mockedGitInstance);

  it("handles arbitrarily thrown errors correctly", async () => {
    jest.spyOn(mockedGitInstance, "getRemotes").mockImplementation(() => {
      throw new Error("Arbitrary error");
    });
    await gitWrapper.refreshData();
    expect(gitWrapper.getStoredData()?.canPush).toEqual({
      reason: "Arbitrary error",
      status: false,
    });
  });

  it("handles no remotes correctly", async () => {
    gitRemotesSpy.mockReturnValue(getResponseWithRemotes([]));
    await gitWrapper.refreshData();

    const expectedData: GitData = {
      canPush: {
        status: false,
        reason: "No remotes found.",
      },
      isWithinCBD: false,
    };
    expect(gitWrapper.getStoredData()).toEqual(expectedData);
  });

  it("handles multiple remotes correctly", async () => {
    const refs = { fetch: "fetch", push: "push" };
    const remotes: RemoteWithRefs[] = [
      {
        name: "remote 1",
        refs,
      },
      {
        name: "remote 2",
        refs,
      },
    ];
    gitRemotesSpy.mockReturnValue(getResponseWithRemotes(remotes));
    await gitWrapper.refreshData();

    const expectedData: GitData = {
      canPush: {
        status: false,
        reason: "Multiple remotes found.",
      },
      isWithinCBD: false,
    };
    expect(gitWrapper.getStoredData()).toEqual(expectedData);
  });

  it("handles no upstream branch correctly", async () => {
    gitRemotesSpy.mockReturnValue(getDefaultResponseWithRemotes());
    gitRevParseSpy.mockReturnValue(getResponseWithString(""));
    await gitWrapper.refreshData();

    const expectedData: GitData = {
      canPush: {
        status: false,
        reason: "No upstream branch found",
      },
      isWithinCBD: false,
    };
    expect(gitWrapper.getStoredData()).toEqual(expectedData);
  });

  it("handles no changes correctly", async () => {
    gitRemotesSpy.mockReturnValue(getDefaultResponseWithRemotes());
    gitRevParseSpy.mockReturnValue(getResponseWithString("branch"));
    gitDiffSpy.mockReturnValue(getResponseWithString(""));
    await gitWrapper.refreshData();

    const expectedData: GitData = {
      canPush: {
        status: false,
        reason: "No changes to push.",
      },
      isWithinCBD: false,
    };
    expect(gitWrapper.getStoredData()).toEqual(expectedData);
  });

  it("returns status 'true' correctly", async () => {
    gitRemotesSpy.mockReturnValue(getDefaultResponseWithRemotes());
    gitRevParseSpy.mockReturnValue(getResponseWithString("branch"));
    gitDiffSpy.mockReturnValue(getResponseWithString("Diff"));
    await gitWrapper.refreshData();

    const expectedData: GitData = {
      canPush: {
        status: true,
      },
      isWithinCBD: false,
    };
    expect(gitWrapper.getStoredData()).toEqual(expectedData);
  });
});

function getDefaultResponseWithRemotes(): Response<RemoteWithRefs[]> {
  const refs = { fetch: "fetch", push: "push" };
  const remotes: RemoteWithRefs[] = [
    {
      name: "remote 1",
      refs,
    },
  ];

  return getResponseWithRemotes(remotes);
}

function getResponseWithRemotes(
  remotes: RemoteWithRefs[]
): Response<RemoteWithRefs[]> {
  return Promise.resolve(remotes) as Response<RemoteWithRefs[]>;
}

function getResponseWithString(value: string): Response<string> {
  return Promise.resolve(value) as Response<string>;
}
