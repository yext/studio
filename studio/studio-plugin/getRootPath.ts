import path from 'path'

const rootPath = path.resolve(__dirname, '../..')

export default function getRootPath(srcPath) {
  return path.join(rootPath, srcPath)
}