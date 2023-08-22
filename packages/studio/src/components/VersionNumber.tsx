import { version } from '../../package.json'

/**
 * Renders the current version number
 */
export default function VersionNumber() {
  return (
    <div>v.{version}</div>
  );
}
