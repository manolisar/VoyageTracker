import { useEffect, useRef } from 'react';
import { AUTO_SAVE_DELAY, APP_VERSION } from '../utils/constants';
import { generateFilename } from '../utils/calculations';
import { saveToBackup } from '../utils/indexeddb';

export const useAutoSave = (activeCruise, view, directoryHandle, activeFilename, setSaveStatus, addToast) => {
  const saveTimeoutRef = useRef(null);

  const autoSave = async (cruise) => {
    if (!directoryHandle || !cruise) return;

    setSaveStatus('saving');

    try {
      const filename = activeFilename || generateFilename(cruise);
      const dataWithMeta = {
        ...cruise,
        filename,
        lastModified: new Date().toISOString(),
        version: APP_VERSION,
      };
      const dataStr = JSON.stringify(dataWithMeta, null, 2);

      const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(dataStr);
      await writable.close();

      await saveToBackup(dataWithMeta);

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Auto-save failed:', err);
      setSaveStatus('error');
      addToast('Save failed - check folder permissions', 'error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  useEffect(() => {
    if (activeCruise && view === 'edit') {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        autoSave(activeCruise);
      }, AUTO_SAVE_DELAY);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [activeCruise, view]);

  return autoSave;
};
