export default async function prettyPrintError(header: string, reason: string) {
  const colors = (await import("colors")).default;
  console.error(colors.bgRed(header));
  console.group();
  console.error(colors.red(reason));
  console.groupEnd();
}
