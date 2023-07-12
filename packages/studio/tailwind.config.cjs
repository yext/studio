const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.join(__dirname, "src/**/*.tsx")],
  theme: {
    extend: {},
  },
  variants: {
    extend: {
      visibility: ['group-hover'],
    }
  }
};
