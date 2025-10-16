import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './sidebar.css';
import './styles.css';
import './img/favicon.png';

const root = createRoot(document.getElementById('root'));
root.render(<App />);