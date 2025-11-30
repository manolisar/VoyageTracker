import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import VoyageTracker from './components/voyage/VoyageTracker';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <VoyageTracker />
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
