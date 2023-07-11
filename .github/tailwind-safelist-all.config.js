/**
 * This config is used to generate the full tailwindcss bundle with all styles,
 * this way we can support users specifying tailwind classes at runtime
 * through the browser.
 *
 * @type {import('tailwindcss').Config}
 **/
module.exports = {
  safelist: [
    {
      pattern: /.*/,
    },
  ],
};
