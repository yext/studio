import type { Config } from "tailwindcss";

/**
 * The subset of a tailwind Config supported by Studio.
 */
export type StudioTailwindConfig = Omit<Config, "theme"> & {
  theme: {
    extend: StudioTailwindTheme;
  };
};

/**
 * The subset of a tailwind ThemeConfig supported by Studio.
 */
export interface StudioTailwindTheme {
  colors?: Record<string, string>;
  fontSize?: Record<string, string>;
}
