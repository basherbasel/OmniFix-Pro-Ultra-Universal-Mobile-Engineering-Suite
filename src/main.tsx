import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { WorkstationProvider } from './context/WorkstationContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WorkstationProvider>
      <App />
    </WorkstationProvider>
  </StrictMode>,
);
