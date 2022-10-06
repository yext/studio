module.exports = {
  content: [
    '../src/**/*.tsx',
    './client/**/*.{js,ts,jsx,tsx}'
  ],
  important: true,
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
}
