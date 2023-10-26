import { PageContext } from "@yext/pages";
import { hydrateRoot } from "react-dom/client";

export { render };

const render = async (pageContext: PageContext<any>) => {
  const { Page, pageProps } = pageContext;
  const rootElement = document.getElementById("reactele");
  if (rootElement) {
    hydrateRoot(rootElement, <Page {...pageProps} />);
  }
};
