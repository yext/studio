import * as ReactDOMServer from "react-dom/server";
import { PageContext } from "@yext/pages";

export { render };

const render = async (pageContext: PageContext<any>) => {
  const { Page, pageProps } = pageContext;
  const viewHtml = ReactDOMServer.renderToString(<Page {...pageProps} />);
  return `<!DOCTYPE html>
    <html lang="<!--app-lang-->">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div id="reactele">${viewHtml}</div>
      </body>
    </html>`;
};
