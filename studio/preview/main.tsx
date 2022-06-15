import React from 'react';
import ReactDOM from 'react-dom';
import { Studio } from './Studio';
import { LeftNav } from './LeftNav';
import { Preview } from './Preview';

import '../../dist/output.css';
import UniversalSearchPage from '../../src/pages/index';
import UniversalConfiguration from '../components/search/universal-configuration';

ReactDOM.render(
  <React.StrictMode>
    <Studio>
      <div className='flex flex-row h-full w-full'>
        <LeftNav>
          <UniversalConfiguration pageId='index'/>
        </LeftNav>
        <Preview>
          <UniversalSearchPage></UniversalSearchPage>
        </Preview>
      </div>
    </Studio>
  </React.StrictMode>,
  document.getElementById('root')
)