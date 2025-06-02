import React from 'react';
import { createRoot } from 'react-dom/client';
import '../../styles/globals.css';
import NextAppAdapter from './NextAppAdapter';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <NextAppAdapter />
  </React.StrictMode>
);
