import React from 'react';
import Page from '../../src/pages/index';
import { Studio } from './components/Studio';
import SSRProvider from 'react-bootstrap/SSRProvider'

import './index.css';
import '../../dist/output.css';

export function Main() {
  return (
    <React.StrictMode>
      <SSRProvider>
        <Studio>
          <Page />
        </Studio>
      </SSRProvider>
    </React.StrictMode>
  );
}
