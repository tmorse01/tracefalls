import { StoreProvider } from './state/store';
import { AppShell } from './components/AppShell';

function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}

export default App;
