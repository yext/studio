import type { Config } from "tailwindcss";
import path from "path";
import fs from "fs";

/**
 * The subset of a tailwind ThemeConfig that we support.
 */
interface StudioTailwindTheme {
  colors?: Record<string, string>;
  fontSize?: Record<string, string>;
}

/**
 * We have to use require() instead of a dynamic import because
 * tailwind does not support async config.
 */
let userTailwindTheme: StudioTailwindTheme = {};
try {
  const tailwindConfigPath = path.resolve(process.cwd(), "tailwind.config.ts");
  if (fs.existsSync(tailwindConfigPath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    userTailwindTheme = require(tailwindConfigPath)?.theme?.extend ?? {};
  }
} catch (e) {
  console.error(e);
}

/**
 * Generates a safelist for custom test colors, background colors, and font sizes.
 */
const generateSafelist = (customTheme: StudioTailwindTheme): string[] => {
  const customColors = Object.keys(customTheme?.colors ?? {});
  const customFontSizes = Object.keys(customTheme?.fontSize ?? {});
  return [
    ...customFontSizes.map((size) => `text-${size}`),
    ...customColors.flatMap((color) => [`bg-${color}`, `text-${color}`]),
  ];
};

export default {
  content: [
    path.resolve(__dirname, "src/**/*.{ts,tsx}"),
    path.resolve(__dirname, "index.html"),
    path.resolve(process.cwd(), "src/**/*.{ts,tsx}"),
  ],
  safelist: generateSafelist(userTailwindTheme),
  theme: {
    extend: userTailwindTheme,
  },
} satisfies Config;
