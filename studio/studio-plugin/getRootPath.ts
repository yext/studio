import path from 'path'

const rootPath = path.resolve(__dirname, '../..')

export default function getRootPath(srcPath: string): string {
  return path.join(rootPath, srcPath)
}