import { useState, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { APP_VERSION } from '../constants';
import { validateCruiseData } from '../utils/validation';
import { generateFilename } from '../utils/calculations';

/**
 * Custom hook for File System Access API operations
 * Handles directory selection, file loading, and saving
 */
export function useFileSystem() {
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
  const toast = useToast();

  const isSupported = 'showDirectoryPicker' in window;

  /**
   * Open a directory picker and return the handle
   */
  const selectDirectory = useCallback(async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setDirectoryHandle(handle);
      return handle;
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to select directory:', err);
        toast.addToast('Failed to select folder', 'error');
      }
      return null;
    }
  }, [toast]);

  /**
   * Load all voyage JSON files from the selected directory
   */
  const loadVoyagesFromDirectory = useCallback(async (handle = directoryHandle) => {
    if (!handle) {
      handle = await selectDirectory();
      if (!handle) return [];
    }

    const loadedVoyages = [];

    try {
      for await (const entry of handle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.json')) {
          try {
            const file = await entry.getFile();
            const text = await file.text();
            const rawData = JSON.parse(text);

            const { valid, errors, data: voyage } = validateCruiseData(rawData);

            if (!valid) {
              console.warn(`Validation issues in ${entry.name}:`, errors);
              toast.addToast(`Fixed issues in ${entry.name}`, 'warning');
            }

            loadedVoyages.push({
              ...voyage,
              filename: entry.name,
            });
          } catch (err) {
            console.error(`Failed to load ${entry.name}:`, err);
            toast.addToast(`Failed to load ${entry.name}`, 'error');
          }
        }
      }

      // Sort by date, newest first
      loadedVoyages.sort((a, b) => {
        const dateA = a.startDate || '1900-01-01';
        const dateB = b.startDate || '1900-01-01';
        return dateB.localeCompare(dateA);
      });

      toast.addToast(`Loaded ${loadedVoyages.length} voyages`, 'success');
      return loadedVoyages;
    } catch (err) {
      console.error('Failed to load directory:', err);
      toast.addToast('Failed to load voyage directory', 'error');
      return [];
    }
  }, [directoryHandle, selectDirectory, toast]);

  /**
   * Save a cruise to a JSON file in the selected directory
   */
  const saveCruise = useCallback(async (cruise, filename = null) => {
    if (!directoryHandle || !cruise) {
      return false;
    }

    setSaveStatus('saving');

    try {
      const targetFilename = filename || cruise.filename || generateFilename(cruise);
      const dataWithMeta = {
        ...cruise,
        lastModified: new Date().toISOString(),
        version: APP_VERSION,
      };
      const dataStr = JSON.stringify(dataWithMeta, null, 2);

      const fileHandle = await directoryHandle.getFileHandle(targetFilename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(dataStr);
      await writable.close();

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
      return true;
    } catch (err) {
      console.error('Save failed:', err);
      setSaveStatus('error');
      toast.addToast('Save failed - check folder permissions', 'error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return false;
    }
  }, [directoryHandle, toast]);

  /**
   * Get display info for current save status
   */
  const getSaveStatusDisplay = useCallback(() => {
    switch (saveStatus) {
      case 'saving':
        return { text: 'Saving...', class: 'bg-gold-500', dot: 'bg-gold-300' };
      case 'saved':
        return { text: 'Saved', class: 'bg-green-500', dot: 'bg-green-300 connected' };
      case 'error':
        return { text: 'Error', class: 'bg-red-500', dot: 'bg-red-300 error' };
      default:
        return directoryHandle
          ? { text: 'Connected', class: 'bg-navy-600 dark:bg-navy-700', dot: 'bg-green-400 connected' }
          : { text: 'No folder', class: 'bg-gold-500', dot: 'bg-gold-300 disconnected' };
    }
  }, [saveStatus, directoryHandle]);

  return {
    directoryHandle,
    setDirectoryHandle,
    saveStatus,
    setSaveStatus,
    isSupported,
    selectDirectory,
    loadVoyagesFromDirectory,
    saveCruise,
    getSaveStatusDisplay,
  };
}
