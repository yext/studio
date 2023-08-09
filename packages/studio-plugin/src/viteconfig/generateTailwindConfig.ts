import type { Config } from "tailwindcss";
import type { StudioTailwindConfig, StudioTailwindTheme } from "../types";
import fs from "fs";
import upath from "upath";
import typescript from "typescript";
import vm from "vm";
import { fileURLToPath } from "url";

/**
 * Generates a tailwind config for use by studio.
 * This tailwind config will specify a safelist based on the user custom theme, if one exists.
 */
export default function generateTailwindConfig(
  pathToUserProjectRoot: string
): Config {
  const importTailwindTheme = () => {
    try {
      const tailwindConfigPath = upath.resolve(
        pathToUserProjectRoot,
        "tailwind.config.ts"
      );
      if (fs.existsSync(tailwindConfigPath) + ".ts") {
        const rawCode = fs.readFileSync(tailwindConfigPath, "utf-8");
        const cjsCode = typescript.transpile(rawCode);
        const tailwindConfig: StudioTailwindConfig = vm.runInNewContext(
          cjsCode,
          { exports: {} }
        );
        return tailwindConfig?.theme?.extend;
      }
    } catch (e) {
      console.error(e);
    }
  };
  const userTailwindTheme: StudioTailwindTheme = importTailwindTheme() ?? {};

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

  const __dirname = upath.dirname(fileURLToPath(import.meta.url));

  return {
    content: [
      upath.resolve(__dirname, "../../../studio/src/**/*.{ts,tsx}"),
      upath.resolve(__dirname, "../../../index.html"),
      upath.resolve(pathToUserProjectRoot, "src/**/*.{ts,tsx}"),
    ],
    safelist: generateSafelist(userTailwindTheme),
    theme: {
      extend: userTailwindTheme,
    },
  };
}
