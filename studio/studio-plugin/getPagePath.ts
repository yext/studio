import studioConfig from '../../src/studio'
import path from 'path'
import getRootPath from './getRootPath'

export default function getPagePath(pageFile: string): string {
  const pathFromSrc = path.join(studioConfig.dirs?.pagesDir ?? './src/pages', pageFile)
  return getRootPath(pathFromSrc)
}