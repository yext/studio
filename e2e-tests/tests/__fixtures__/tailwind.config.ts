import type { StudioTailwindConfig } from "@yext/studio";

export default {
  content: ["./src/**/*.{ts,tsx}", "../tests/custom-tailwind.spec.ts"],
  theme: {
    extend: {
      colors: {
        primary: "#aa00ff",
      },
      fontSize: {
        extremelyLarge: "60px",
      },
    },
  },
} satisfies StudioTailwindConfig;
