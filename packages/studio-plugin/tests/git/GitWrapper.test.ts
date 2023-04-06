import { simpleGit, Response, RemoteWithRefs } from "simple-git";
import GitWrapper from "../../src/git/GitWrapper";

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

  expect(gitAddSpy).toBeCalledWith("-A");
  expect(gitCommitSpy).toBeCalledWith("Yext Studio Commit");
  expect(gitPushSpy).toBeCalled();
});

describe("verifying canPush calculation", () => {
  const mockedGitInstance = simpleGit();
  const gitRemotesSpy = jest.spyOn(mockedGitInstance, "getRemotes");
  const gitRevParseSpy = jest.spyOn(mockedGitInstance, "revparse");
  const gitDiffSpy = jest.spyOn(mockedGitInstance, "diff");

  const gitWrapper = new GitWrapper(mockedGitInstance);

  it("handles no remotes correctly", async () => {
    const remotes: RemoteWithRefs[] = [];
    gitRemotesSpy.mockImplementation(
      (_verbose, _callback) =>
        Promise.resolve(remotes) as Response<RemoteWithRefs[]>
    );
    await gitWrapper.refreshData();

    const expectedData = {
      canPush: {
        status: false,
        reason: "No remotes found.",
      },
    };
    expect(gitWrapper.getStoredData()).toEqual(expectedData);
    expect(gitRemotesSpy).toBeCalled();
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
    gitRemotesSpy.mockImplementation(
      (_verbose, _callback) =>
        Promise.resolve(remotes) as Response<RemoteWithRefs[]>
    );
    await gitWrapper.refreshData();

    const expectedData = {
      canPush: {
        status: false,
        reason: "Multiple remotes found.",
      },
    };
    expect(gitWrapper.getStoredData()).toEqual(expectedData);
    expect(gitRemotesSpy).toBeCalled();
  });

  it("handles no upstream branch correctly", async () => {
    const refs = { fetch: "fetch", push: "push" };
    const remotes: RemoteWithRefs[] = [
      {
        name: "remote 1",
        refs,
      },
    ];
    gitRemotesSpy.mockImplementation(
      (_verbose, _callback) =>
        Promise.resolve(remotes) as Response<RemoteWithRefs[]>
    );
    gitRevParseSpy.mockImplementation(
      (_options, _callback) => Promise.resolve("") as Response<string>
    );
    await gitWrapper.refreshData();

    const expectedData = {
      canPush: {
        status: false,
        reason: "No upstream branch found",
      },
    };
    expect(gitWrapper.getStoredData()).toEqual(expectedData);
    expect(gitRemotesSpy).toBeCalled();
    expect(gitRevParseSpy).toBeCalledWith(["--abbrev-ref", "@{u}"]);
  });

  it("handles no changes correctly", async () => {
    const refs = { fetch: "fetch", push: "push" };
    const remotes: RemoteWithRefs[] = [
      {
        name: "remote 1",
        refs,
      },
    ];
    gitRemotesSpy.mockImplementation(
      (_verbose, _callback) =>
        Promise.resolve(remotes) as Response<RemoteWithRefs[]>
    );
    gitRevParseSpy.mockImplementation(
      (_options, _callback) => Promise.resolve("branch") as Response<string>
    );
    gitDiffSpy.mockImplementation(
      (_options, _callback) => Promise.resolve("") as Response<string>
    );
    await gitWrapper.refreshData();

    const expectedData = {
      canPush: {
        status: false,
        reason: "No changes to push.",
      },
    };
    expect(gitWrapper.getStoredData()).toEqual(expectedData);
    expect(gitRemotesSpy).toBeCalled();
    expect(gitRevParseSpy).toBeCalled();
    expect(gitDiffSpy).toBeCalledWith(["--stat", "branch"]);
  });

  it("returns status 'true' correctly", async () => {
    const refs = { fetch: "fetch", push: "push" };
    const remotes: RemoteWithRefs[] = [
      {
        name: "remote 1",
        refs,
      },
    ];
    gitRemotesSpy.mockImplementation(
      (_verbose, _callback) =>
        Promise.resolve(remotes) as Response<RemoteWithRefs[]>
    );
    gitRevParseSpy.mockImplementation(
      (_options, _callback) => Promise.resolve("branch") as Response<string>
    );
    gitDiffSpy.mockImplementation(
      (_options, _callback) => Promise.resolve("Diff") as Response<string>
    );
    await gitWrapper.refreshData();

    const expectedData = {
      canPush: {
        status: true,
      },
    };
    expect(gitWrapper.getStoredData()).toEqual(expectedData);
    expect(gitRemotesSpy).toBeCalled();
    expect(gitRevParseSpy).toBeCalled();
    expect(gitDiffSpy).toBeCalled();
  });
});
