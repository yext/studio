/**
 * Returns whether or not a file is a styling file
 * based on its file extension.  Studio supports CSS
 * and SCSS.
 */
export default function isStyleFile(filename: string) {
  return (
    filename.endsWith(".css") ||
    filename.endsWith(".scss")
  );
}