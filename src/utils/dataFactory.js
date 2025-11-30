import { PHASE_TYPES, DEFAULT_DENSITIES, APP_VERSION } from '../constants';

export const defaultEquipment = () => ({
  dg12: { start: '', end: '', fuel: 'HFO' },
  dg4: { start: '', end: '', fuel: 'HFO' },
  dg3: { start: '', end: '', fuel: 'MGO' },
  boiler1: { start: '', end: '', fuel: 'MGO' },
  boiler2: { start: '', end: '', fuel: 'MGO' },
});

export const createPhase = (type, name = '') => ({
  id: Date.now() + Math.random(),
  type: type,
  name: name,
  equipment: defaultEquipment(),
});

export const defaultDeparturePhases = () => [
  createPhase(PHASE_TYPES.PORT, 'FWE → SBE (In Port)'),
  createPhase(PHASE_TYPES.STANDBY, 'SBE → FA (Stand By Departure)'),
];

export const defaultArrivalPhases = () => [
  createPhase(PHASE_TYPES.SEA, 'FA → SBE (Sea Passage)'),
  createPhase(PHASE_TYPES.STANDBY, 'SBE → FWE (Stand By Arrival)'),
];

export const defaultReport = (type) => ({
  id: Date.now() + Math.random(),
  type,
  date: '',
  port: '',
  timeEvents: { sbe: '', fwe: '', fa: '' },
  phases: type === 'departure' ? defaultDeparturePhases() : defaultArrivalPhases(),
  rob: { hfo: '', mgo: '', lsfo: '' },
  bunkered: { hfo: '', mgo: '', lsfo: '' },
  freshWater: { rob: '', bunkered: '', production: '', consumption: '' },
  aep: { openLoopHrs: '', closedLoopHrs: '', alkaliCons: '', alkaliRob: '' },
  lubeOil: { meCons: '', lo13s14s: '', usedLo13c: '' },
  engineer: '',
});

export const defaultCruise = () => {
  const id = Date.now();
  const date = new Date().toISOString().split('T')[0];
  return {
    id,
    name: '',
    vessel: 'Celebrity Solstice',
    startDate: '',
    endDate: '',
    legs: [],
    densities: { ...DEFAULT_DENSITIES },
    voyageEnd: null,
    lastModified: new Date().toISOString(),
    version: APP_VERSION,
    filename: `${date}_voyage_${id}.json`,
  };
};
