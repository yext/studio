import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from '../src/components/App';
import '.././dist/index.css'
import 'slapshot-studio/index.css'
import { LeftNav, Preview, Studio } from 'slapshot-studio';
import { BannerModuleConfiguration } from 'banner';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Studio>
      <div className='flex flex-row h-full w-full'>
        <LeftNav>
          <BannerModuleConfiguration/>
        </LeftNav>
        <Preview>
          <App />
        </Preview>
      </div>
    </Studio>
  </React.StrictMode>
)