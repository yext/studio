export interface GitData {
  canPush: {
    status: boolean;
    reason?: string;
  };
  isWithinCBD: boolean;
}
