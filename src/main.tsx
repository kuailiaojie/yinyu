import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { DynamicThemeProvider } from './theme/DynamicTheme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DynamicThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DynamicThemeProvider>
  </React.StrictMode>
);
