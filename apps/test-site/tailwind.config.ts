import type { StudioTailwindConfig } from "@yext/studio";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#aa00ff",
      },
      fontSize: {
        primary: "14px",
      },
    },
  },
} satisfies StudioTailwindConfig;
