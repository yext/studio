import { SimpleGit } from "simple-git";
import { GitData } from "../types";

export default class GitWrapper {
  private git: SimpleGit;
  private gitData?: GitData;

  constructor(git: SimpleGit) {
    this.git = git;
  }

  async deploy() {
    await this.git.add(".");
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        return {
          status: false,
          reason: err.message,
        };
      } else {
        throw err;
      }
    }
    return {
      status: true,
    };
  }

  async refreshData() {
    const canPush = await this.canPush();
    this.gitData = { canPush };
  }
}
