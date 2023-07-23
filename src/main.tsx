import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './shadcnStyles.css';
import './index.scss';
import './game.scss';
import { ThemeProvider } from './components/theme-provider.tsx';
import { Toaster } from '~/components/ui/toaster';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <App />
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>,
);
