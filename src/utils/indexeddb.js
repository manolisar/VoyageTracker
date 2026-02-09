import { APP_VERSION, BACKUP_DB_NAME, BACKUP_STORE_NAME } from './constants';

export const openBackupDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(BACKUP_DB_NAME, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(BACKUP_STORE_NAME)) {
        const store = db.createObjectStore(BACKUP_STORE_NAME, { keyPath: 'id' });
        store.createIndex('lastModified', 'lastModified', { unique: false });
      }
    };
  });
};

export const saveToBackup = async (cruise) => {
  try {
    const db = await openBackupDB();
    const tx = db.transaction(BACKUP_STORE_NAME, 'readwrite');
    const store = tx.objectStore(BACKUP_STORE_NAME);

    const backupData = {
      ...cruise,
      lastModified: new Date().toISOString(),
      version: APP_VERSION,
    };

    store.put(backupData);
    await tx.complete;
    db.close();
    return true;
  } catch (err) {
    console.error('Backup failed:', err);
    return false;
  }
};

export const loadFromBackup = async (id) => {
  try {
    const db = await openBackupDB();
    const tx = db.transaction(BACKUP_STORE_NAME, 'readonly');
    const store = tx.objectStore(BACKUP_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => {
        db.close();
        resolve(request.result);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Load backup failed:', err);
    return null;
  }
};

export const getAllBackups = async () => {
  try {
    const db = await openBackupDB();
    const tx = db.transaction(BACKUP_STORE_NAME, 'readonly');
    const store = tx.objectStore(BACKUP_STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        db.close();
        resolve(request.result || []);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  } catch (err) {
    console.error('Get backups failed:', err);
    return [];
  }
};

export const deleteBackup = async (id) => {
  try {
    const db = await openBackupDB();
    const tx = db.transaction(BACKUP_STORE_NAME, 'readwrite');
    const store = tx.objectStore(BACKUP_STORE_NAME);
    store.delete(id);
    await tx.complete;
    db.close();
    return true;
  } catch (err) {
    console.error('Delete backup failed:', err);
    return false;
  }
};
