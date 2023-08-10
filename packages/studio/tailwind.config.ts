import type { Config } from "tailwindcss";
import type {
  StudioTailwindConfig,
  StudioTailwindTheme,
} from "@yext/studio-plugin";
import path from "path";
import fs from "fs";

/**
 * The user's StudioTailwindTheme.
 *
 * We have to use require() instead of a dynamic import because
 * tailwind does not support async config.
 */
const userTailwindTheme: StudioTailwindTheme =
  (() => {
    try {
      const tailwindConfigPath = path.resolve(
        process.cwd(),
        "tailwind.config.ts"
      );
      console.log(tailwindConfigPath);
      if (fs.existsSync(tailwindConfigPath)) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const tailwindConfig: StudioTailwindConfig = require(tailwindConfigPath);
        console.log("user's tailwind config", tailwindConfig);
        return tailwindConfig?.theme?.extend;
      }
    } catch (e) {
      console.error(e);
    }
  })() ?? {};

/**
 * Generates a safelist for custom test colors, background colors, and font sizes.
 */
const generateSafelist = (theme: StudioTailwindTheme): string[] => {
  const customColors = Object.keys(theme?.colors ?? {});
  const customFontSizes = Object.keys(theme?.fontSize ?? {});
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
