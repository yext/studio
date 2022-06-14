import React from 'react';
import ReactDOM from 'react-dom';
import { Studio } from './Studio';
import { LeftNav } from './LeftNav';
import { Preview } from './Preview';

import '../../dist/output.css';

ReactDOM.render(
  <React.StrictMode>
    <Studio>
      <div className='flex flex-row h-full w-full'>
        <LeftNav>
          <button>Hey</button>
        </LeftNav>
        <Preview>
          <button>Hey</button>
        </Preview>
      </div>
    </Studio>
  </React.StrictMode>,
  document.getElementById('root')
)