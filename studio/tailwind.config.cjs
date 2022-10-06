module.exports = {
  content: [
    '../src/**/*.tsx',
    './client/index.html',
    './client/**/*.{js,ts,jsx,tsx}'
  ],
  important: true,
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
}
