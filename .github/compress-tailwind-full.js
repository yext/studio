const brotli = require("brotli");
const fs = require("fs");
const path = require("path");

const raw = fs.readFileSync(
  path.resolve(__dirname, "../packages/studio/src/tailwind-full.css")
);
const compressed = brotli.compress(raw, {
  quality: 11,
});
fs.writeFileSync(
  path.resolve(__dirname, "../packages/studio/src/tailwind-full.css.br"),
  compressed
);
