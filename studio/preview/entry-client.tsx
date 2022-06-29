import ReactDOM from 'react-dom'
import { Main } from './Main'

ReactDOM.hydrate(
  <Main {...(window as any).__ssrContext}/>,
  document.getElementById('root')
)