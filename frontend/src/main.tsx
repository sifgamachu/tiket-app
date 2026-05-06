import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AppStoreProvider } from './store/AppStore';
import { ToastProvider } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getTg } from './lib/telegram';
import './index.css';

// Initialize Telegram WebApp if running inside Telegram.
// The script tag in index.html loads `window.Telegram.WebApp` synchronously
// before this module runs, so the API is available here.
const tg = getTg();
if (tg) {
  tg.ready();
  tg.expand();
  // Match the app to the brand without fighting Telegram's chrome
  tg.setHeaderColor?.('#1A6B3A');
  tg.setBackgroundColor?.('#FAF7F0');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AppStoreProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AppStoreProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
