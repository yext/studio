import { version } from '../../package.json'

/**
 * Renders the current version number
 */
export default function VersionNumber() {
  return (
    <p className='text-gray-500'>v.{version}</p>
  );
}
