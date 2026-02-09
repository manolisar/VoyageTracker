import { useEffect } from 'react';

export const useKeyboardShortcuts = (activeCruise, view, autoSave, addToast) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeCruise && view === 'edit') {
          autoSave(activeCruise);
          addToast('Saved manually', 'success');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCruise, view, autoSave, addToast]);
};
