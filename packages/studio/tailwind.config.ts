import type { Config } from "tailwindcss";
import {
  StudioTailwindConfig,
  StudioTailwindTheme,
  STUDIO_PROCESS_ARGS_OBJ,
  CliArgs,
} from "@yext/studio-plugin";
import path from "path";
import fs from "fs";

const getRootDir = (): string => {
  const cliArgs: CliArgs = JSON.parse(
    process.env[STUDIO_PROCESS_ARGS_OBJ] as string
  );
  return cliArgs.root ?? process.cwd();
};
const rootDir = getRootDir();

/**
 * The user's StudioTailwindTheme.
 */
const userTailwindTheme: StudioTailwindTheme =
  (() => {
    try {
      const tailwindConfigPath = path.resolve(rootDir, "tailwind.config.ts");
      if (fs.existsSync(tailwindConfigPath)) {
        // We have to use require() instead of a dynamic import because
        // tailwind does not support async config.
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const tailwindConfig: StudioTailwindConfig = require(tailwindConfigPath);
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
    path.resolve(rootDir, "src/**/*.{ts,tsx}"),
  ],
  safelist: generateSafelist(userTailwindTheme),
  theme: {
    extend: userTailwindTheme,
  },
} satisfies Config;
