import { simpleGit } from "simple-git";
import GitWrapper from "../../src/git/GitWrapper";

jest.mock("simple-git", () => {
  return {
    simpleGit: () => {
      return {
        add: jest.fn(),
        commit: jest.fn(),
        push: jest.fn(),
      };
    },
  };
});
const mockedGitInstance = simpleGit();
const gitAddSpy = jest.spyOn(mockedGitInstance, "add");
const gitCommitSpy = jest.spyOn(mockedGitInstance, "commit");
const gitPushSpy = jest.spyOn(mockedGitInstance, "push");

const gitWrapper = new GitWrapper(mockedGitInstance);

it("invokes Git commands correctly on deploy", async () => {
  await gitWrapper.deploy();

  expect(gitAddSpy).toBeCalledWith("-A");
  expect(gitCommitSpy).toBeCalledWith("Yext Studio Commit");
  expect(gitPushSpy).toBeCalled();
});
