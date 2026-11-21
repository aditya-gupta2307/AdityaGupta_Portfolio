import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/workspace.css';
import '../styles/sections.css';
import '../styles/undercut.css';
import { UndercutPage } from './UndercutPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UndercutPage />
  </StrictMode>,
);
