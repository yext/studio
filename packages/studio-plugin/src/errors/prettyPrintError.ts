import colors from "colors";

export default function prettyPrintError(header: string, stack?: string) {
  console.error(colors.bgRed(header));
  if (stack) {
    console.group();
    const stackMessage =
      stack.length >= 1200 ? stack.slice(0, 1200).trim() : stack;
    console.error(colors.red(stackMessage));
    console.groupEnd();
  }
}
