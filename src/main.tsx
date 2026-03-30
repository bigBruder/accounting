import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/variables.css';
import './styles/reset.css';
import './styles/global.css';
import './styles/atoms.css';
import './styles/molecules.css';
import './styles/organisms.css';

import './i18n';
import { App } from './App';

const appContainer = document.getElementById('app');
if (appContainer) {
  const root = createRoot(appContainer);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
