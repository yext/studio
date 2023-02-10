import { SimpleGit, simpleGit } from "simple-git";

const gitInstance: SimpleGit = simpleGit();

export default class GitWrapper {
  static async deploy() {
    await gitInstance.add("-A");
    await gitInstance.commit("Yext Studio Commit");
    await gitInstance.push();
  }

  static async canPush(): Promise<{ msg?: string, canPush: boolean }> {
    return {
      canPush: true
    }
  }
}