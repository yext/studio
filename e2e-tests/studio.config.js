/** @type {import('@yext/studio').StudioConfig} */
import path from "path";

export default {
  isPagesJSRepo: true,
  port: 5173,
  paths: {
    pages: path.resolve("./src/templates"),
  },
};
