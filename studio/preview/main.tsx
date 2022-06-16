import React from 'react';
import ReactDOM from 'react-dom';
import { Studio } from './components/Studio';
import { LeftNav } from './components/LeftNav';
import { Preview } from './components/Preview';

import '../../dist/output.css';
import UniversalSearchPage from '../../src/pages/index';
import UniversalConfiguration from '../components/search/universal-experience-configuration';

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