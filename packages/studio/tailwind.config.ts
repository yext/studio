import type { Config } from "tailwindcss";
import {
  StudioTailwindConfig,
  StudioTailwindTheme,
  STUDIO_PROCESS_ARGS_OBJ,
  CliArgs,
} from "@yext/studio-plugin";
import path from "path";
import fs from "fs";
import { generateTailwindSafelist } from "@yext/studio-plugin";

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
const userTailwindConfig: StudioTailwindConfig | undefined = (() => {
  const tailwindConfigPath = path.resolve(rootDir, "tailwind.config.ts");
  if (fs.existsSync(tailwindConfigPath)) {
    // We have to use require() instead of a dynamic import because
    // tailwind does not support async config.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const tailwindConfig: StudioTailwindConfig = require(tailwindConfigPath);
    return tailwindConfig;
  }
})();
const userTailwindTheme: StudioTailwindTheme =
  userTailwindConfig?.theme?.extend ?? {};

/**
 * The portion of the content array that gets styles from the user's repo.
 * If the user did not specify a tailwind config, default to all styles under the src dir.
 */
const transformedUserContent = (
  userTailwindConfig?.content ?? [path.resolve(rootDir, "src/**/*.{ts,tsx}")]
).map((filepath) => {
  if (path.isAbsolute(filepath)) {
    return filepath;
  }
  return path.join(rootDir, filepath);
});

export default {
  content: [
    path.resolve(__dirname, "src/**/*.{ts,tsx}"),
    path.resolve(__dirname, "index.html"),
    path.resolve(__dirname, "../studio-ui/**/*.tsx"),
    ...transformedUserContent,
  ],
  safelist: generateTailwindSafelist(userTailwindTheme),
  theme: {
    extend: userTailwindTheme,
  },
} satisfies Config;
