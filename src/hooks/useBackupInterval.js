import { useEffect, useRef } from 'react';
import { BACKUP_INTERVAL } from '../utils/constants';
import { saveToBackup } from '../utils/indexeddb';

export const useBackupInterval = (activeCruise, view) => {
  const backupIntervalRef = useRef(null);

  useEffect(() => {
    if (activeCruise && view === 'edit') {
      backupIntervalRef.current = setInterval(() => {
        saveToBackup(activeCruise);
      }, BACKUP_INTERVAL);
    }

    return () => {
      if (backupIntervalRef.current) {
        clearInterval(backupIntervalRef.current);
      }
    };
  }, [activeCruise, view]);
};
