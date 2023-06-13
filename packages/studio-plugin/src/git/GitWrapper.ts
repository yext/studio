import { SimpleGit } from "simple-git";
import { GitData } from "../types";

export default class GitWrapper {
  private git: SimpleGit;
  private gitData?: GitData;

  constructor(git: SimpleGit) {
    this.git = git;
  }

  async setup() {
    if (process.env.YEXT_CBD_BRANCH) {
      const branchName = process.env.YEXT_CBD_BRANCH.replace("refs/heads/", "");
      await this.git.checkout(branchName);
    }
    await this.refreshData();
  }

  async deploy() {
    await this.git.add(".");
    // .initializationdata is a special file created by CBD that should not be committed.
    // If the file does not exist this is a no-op.
    await this.git.reset(["--", ".initializationdata"]);
    await this.git.commit("Yext Studio Commit");
    await this.git.push();
  }

  getStoredData() {
    return this.gitData;
  }

  private async canPush(): Promise<{ reason?: string; status: boolean }> {
    try {
      const remotes = await this.git.getRemotes();
      if (remotes.length === 0) {
        return {
          status: false,
          reason: "No remotes found.",
        };
      } else if (remotes.length > 1) {
        return {
          status: false,
          reason: "Multiple remotes found.",
        };
      }
      const upstreamBranch = await this.git.revparse(["--abbrev-ref", "@{u}"]);
      if (!upstreamBranch) {
        return {
          status: false,
          reason: "No upstream branch found",
        };
      }
      const diff = await this.git.diff(["--stat", upstreamBranch]);
      if (!diff) {
        return {
          status: false,
          reason: "No changes to push.",
        };
      }

      return {
        status: true,
      };
    } catch (err: unknown) {
      if (!(err instanceof Error)) {
        throw err;
      }

      return {
        status: false,
        reason: err.message,
      };
    }
  }

  async refreshData() {
    const canPush = await this.canPush();
    this.gitData = {
      canPush,
      isWithinCBD: !!process.env.YEXT_CBD_BRANCH,
    };
  }
}
