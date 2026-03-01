import React from 'react';
import { AppProvider } from './state/store';
import { AppShell } from './components/AppShell';

function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
