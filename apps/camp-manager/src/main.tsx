import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '../../../packages/shared-ui/styles/reset.css';
import '../../../packages/shared-ui/styles/variables.css';
import '../../../packages/shared-ui/styles/global.css';

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
