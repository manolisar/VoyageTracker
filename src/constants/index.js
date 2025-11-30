export const APP_VERSION = '5.0.0';
export const BACKUP_DB_NAME = 'VoyageTrackerBackup';
export const BACKUP_STORE_NAME = 'cruises';
export const AUTO_SAVE_DELAY = 1000;
export const BACKUP_INTERVAL = 30000; // 30 seconds

export const DEFAULT_DENSITIES = {
  HFO: 0.92,
  MGO: 0.83,
  LSFO: 0.92,
};

export const FUEL_OPTIONS = ['HFO', 'MGO', 'LSFO'];

export const PHASE_TYPES = {
  PORT: 'port',
  SEA: 'sea',
  STANDBY: 'standby',
};

export const EQUIPMENT_KEYS = {
  DG12: 'dg12',
  DG4: 'dg4',
  DG3: 'dg3',
  BOILER1: 'boiler1',
  BOILER2: 'boiler2',
};

export const EQUIPMENT_LABELS = {
  [EQUIPMENT_KEYS.DG12]: 'DG 1-2',
  [EQUIPMENT_KEYS.DG4]: 'DG 4',
  [EQUIPMENT_KEYS.DG3]: 'DG 3',
  [EQUIPMENT_KEYS.BOILER1]: 'Boiler 1',
  [EQUIPMENT_KEYS.BOILER2]: 'Boiler 2',
};

// Equipment fuel restrictions
export const EQUIPMENT_FUEL_RESTRICTIONS = {
  [EQUIPMENT_KEYS.DG12]: ['HFO', 'MGO', 'LSFO'],
  [EQUIPMENT_KEYS.DG4]: ['HFO', 'MGO', 'LSFO'],
  [EQUIPMENT_KEYS.DG3]: ['MGO'], // MGO only
  [EQUIPMENT_KEYS.BOILER1]: ['MGO'], // MGO only
  [EQUIPMENT_KEYS.BOILER2]: ['MGO'], // MGO only
};
