import React from 'react';
import { createRoot } from 'react-dom/client';
import GameList from './GameList'; // Ensure this path is correct

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <GameList />
  </React.StrictMode>
);
