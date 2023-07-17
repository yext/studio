import { SimpleGit } from "simple-git";

export default class GitOperations {
  constructor(private git: SimpleGit) {}
  /**
   * Gets the numbers of commits between the current remote branch and the given ref.
   */
  async getNumCommitsFromRef(ref: string): Promise<number> {
    const branchName = (
      await this.git.raw(["branch", "--show-current"])
    ).trim();
    const rawOutput = await this.git.raw([
      "rev-list",
      `${ref}..origin/${branchName}`,
      "--count",
    ]);
    return parseInt(rawOutput.trim());
  }

  async getCommitMessage(): Promise<string> {
    return this.git.raw(["show-branch", "--no-name", "HEAD"]);
  }

  async getCurrentRef(): Promise<string> {
    return this.git.revparse(["HEAD"]);
  }
}
