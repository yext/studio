import ReactDOMServer from 'react-dom/server'
import { Main } from './main'

export function render(_url, context) {
  return ReactDOMServer.renderToString(<Main {...context}/>)
}