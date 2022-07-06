import React from 'react';
import { Studio, StudioProps } from './components/Studio';
import SSRProvider from 'react-bootstrap/SSRProvider'

import './index.css';
import '../../dist/output.css';

export function Main(props: StudioProps) {
  return (
    <React.StrictMode>
      <SSRProvider>
        <Studio {...props} />
      </SSRProvider>
    </React.StrictMode>
  );
}
