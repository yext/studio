/**
 * A slice for containing environment data.
 */
export default interface GitDataSlice {
  canPush: {
    status: boolean;
    reason?: string;
  };
}
