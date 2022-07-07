const path = require("path");

const rootPath = path.resolve(__dirname, '../..');

module.exports = function getRootPath(srcPath) {
  return path.join(rootPath, srcPath)
}