import type { Config } from 'tailwindcss'
import path from 'path';

export default {
  content: [path.join(__dirname, "src/**/*.tsx")],
  theme: {
    extend: {},
  },
} satisfies Config;