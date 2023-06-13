declare module "virtual_yext-studio" {
  import { StudioData } from "@yext/studio-plugin";
  const context: StudioData;
  export default context;
}

declare module "virtual_yext-studio-git-data" {
  import { GitData } from "@yext/studio-plugin";
  const context: GitData;
  export default context;
}
