import { useEffect, useRef, useCallback } from 'react';
import { AUTO_SAVE_DELAY, BACKUP_INTERVAL } from '../constants';
import { saveToBackup } from '../utils/storage';

/**
 * Custom hook for auto-saving with debounce and periodic backup
 * @param {Object} options - Configuration options
 * @param {Object} options.data - Data to save
 * @param {boolean} options.enabled - Whether auto-save is enabled
 * @param {Function} options.onSave - Save function to call
 * @param {number} options.delay - Debounce delay in ms (default: AUTO_SAVE_DELAY)
 * @param {number} options.backupInterval - Backup interval in ms (default: BACKUP_INTERVAL)
 */
export function useAutoSave({
  data,
  enabled = true,
  onSave,
  delay = AUTO_SAVE_DELAY,
  backupInterval = BACKUP_INTERVAL,
}) {
  const saveTimeoutRef = useRef(null);
  const backupIntervalRef = useRef(null);

  // Debounced save
  useEffect(() => {
    if (!enabled || !data || !onSave) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      onSave(data);
    }, delay);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, enabled, onSave, delay]);

  // Periodic backup to IndexedDB
  useEffect(() => {
    if (!enabled || !data) return;

    backupIntervalRef.current = setInterval(() => {
      saveToBackup(data);
    }, backupInterval);

    return () => {
      if (backupIntervalRef.current) {
        clearInterval(backupIntervalRef.current);
      }
    };
  }, [data, enabled, backupInterval]);

  // Manual save trigger
  const saveNow = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    if (data && onSave) {
      onSave(data);
    }
  }, [data, onSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (backupIntervalRef.current) {
        clearInterval(backupIntervalRef.current);
      }
    };
  }, []);

  return {
    saveNow,
  };
}

/**
 * Custom hook for keyboard shortcuts
 * @param {Object} shortcuts - Map of key combinations to handlers
 */
export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = [];
      if (e.ctrlKey || e.metaKey) key.push('mod');
      if (e.shiftKey) key.push('shift');
      if (e.altKey) key.push('alt');
      key.push(e.key.toLowerCase());

      const combo = key.join('+');
      const handler = shortcuts[combo];

      if (handler) {
        e.preventDefault();
        handler(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
