export default function getNpmPackageName(filepath: string): string {
  const [_, nodeModulesPath] = filepath.split("node_modules/");

  if (nodeModulesPath) {
    const directories = nodeModulesPath.split("/");
    const packageName = nodeModulesPath.startsWith("@")
      ? [directories[0], directories[1]].join("/")
      : directories[0];
    return packageName + "/";
  }

  return "";
}