import { SimpleGit, simpleGit } from "simple-git";
import { GitData } from "../types";

export default class GitWrapper {
  private git: SimpleGit;
  private gitData?: GitData;

  constructor() {
    this.git = simpleGit();
  }

  async deploy() {
    await this.git.add("-A");
    await this.git.commit("Yext Studio Commit");
    await this.git.push();
  }

  getStoredData() {
    return this.gitData;
  }

  private async canPush(): Promise<{ reason?: string, status: boolean }> {
    const remotes = await this.git.getRemotes();
    if (remotes.length === 0) {
      return {
        status: false,
        reason: 'No remote branches found.'
      };
    } else if (remotes.length > 1) {
      return {
        status: false,
        reason: 'Multiple remote branches found.'
      };
    }
    const diff = await this.git.diff(['--stat', remotes[0].name]);
    console.log(diff)
    return {
      status: true,
      reason: "No prob"
    }
  }

  async refreshData() {
    console.log('refreshing')
    const canPush = await this.canPush();
    this.gitData = { canPush };
  }
}
