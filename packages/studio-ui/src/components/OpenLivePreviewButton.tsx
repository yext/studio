/**
 * OpenLivePreviewButton is a button that when clicked, opens the
 * pages development server index page in a new tab.
 * Port 5173 hardcoded for now as it will be the pages dev port in most cases
 */
export default function OpenLivePreviewButton(): JSX.Element | null {
  return (
    <div className="relative inline-block">
      <a
        className="rounded-md text-white bg-blue-600 px-2 py-1 flex items-center gap-x-2 shadow-md hover:bg-blue-700 hover:shadow-lg"
        href="http://localhost:5173/"
        target="_blank"
        rel="noreferrer"
      >
        Live Preview
      </a>
    </div>
  );
}
