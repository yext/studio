import colors from "colors";

export default function prettyPrintError(header: string, reason: string) {
  console.error(colors.bgRed(header));
  console.group();
  console.error(colors.red(reason));
  console.groupEnd();
}
