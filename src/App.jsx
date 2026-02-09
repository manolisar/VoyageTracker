import { ToastProvider } from './contexts/ToastContext';
import VoyageTracker from './VoyageTracker';

export default function App() {
  return (
    <ToastProvider>
      <VoyageTracker />
    </ToastProvider>
  );
}
