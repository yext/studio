import { StudioTailwindTheme } from "../types";

/**
 * Generates a safelist for custom test colors, background colors, and font sizes.
 */
export default function generateTailwindSafelist(
  theme: StudioTailwindTheme
): string[] {
  const customColors = Object.keys(theme?.colors ?? {});
  const customFontSizes = Object.keys(theme?.fontSize ?? {});
  return [
    ...customFontSizes.map((size) => `text-${size}`),
    ...customColors.flatMap((color) => [`bg-${color}`, `text-${color}`]),
  ];
}
