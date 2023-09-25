/**
 * A slice for containing environment data.
 */
export default interface StudioGitDataSlice {
  canPush: {
    status: boolean;
    reason?: string;
  };
}
