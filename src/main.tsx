import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/fonts';
import './styles/global.css';
import App from './App';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// Accessibility checks in development only. Results appear in the browser console.
if (import.meta.env.DEV && !location.search.includes('noaxe')) {
  Promise.all([import('@axe-core/react'), import('react'), import('react-dom')]).then(
    ([axe, React, ReactDOM]) => axe.default(React, ReactDOM, 1000),
  );
}
