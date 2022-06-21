import React from 'react';
import ReactDOM from 'react-dom';
import { Studio } from './components/Studio';

import './index.css';
import '../../dist/output.css';

ReactDOM.render(
  <React.StrictMode>
    <Studio>
    </Studio>
  </React.StrictMode>,
  document.getElementById('root')
)