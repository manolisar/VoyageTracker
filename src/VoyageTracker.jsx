import { useState, useEffect, useRef } from 'react';
import { useToast } from './hooks/useToast';
import { useAutoSave } from './hooks/useAutoSave';
import { useBackupInterval } from './hooks/useBackupInterval';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { DEFAULT_DENSITIES, PHASE_TYPES, APP_VERSION } from './utils/constants';
import { defaultCruise, defaultReport } from './utils/factories';
import { calcConsumption, generateFilename } from './utils/calculations';
import { validateCruiseData } from './utils/validation';
import { getAllBackups, deleteBackup, saveToBackup } from './utils/indexeddb';
import { Icons } from './components/Icons';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import DensityBar from './components/layout/DensityBar';
import SettingsModal from './components/modals/SettingsModal';
import VoyageEndModal from './components/modals/VoyageEndModal';
import NewVoyageModal from './components/modals/NewVoyageModal';
import ImportCountersModal from './components/modals/ImportCountersModal';
import ManualCarryOverModal from './components/modals/ManualCarryOverModal';
import FloatingCarryOverButton from './components/ui/FloatingCarryOverButton';
import VoyageList from './components/voyage/VoyageList';
import VoyageEditor from './components/voyage/VoyageEditor';

export default function VoyageTracker() {
  const [voyages, setVoyages] = useState([]);
  const [activeCruise, setActiveCruise] = useState(null);
  const [view, setView] = useState('list');
  const [showSettings, setShowSettings] = useState(false);
  const [showVoyageEndModal, setShowVoyageEndModal] = useState(false);
  const [showNewVoyageModal, setShowNewVoyageModal] = useState(false);
  const [showImportCountersModal, setShowImportCountersModal] = useState(false);
  const [pendingNewCruise, setPendingNewCruise] = useState(null);
  const [pendingVoyageDetails, setPendingVoyageDetails] = useState(null);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [allLegsCollapsed, setAllLegsCollapsed] = useState(false);
  const [recoveryData, setRecoveryData] = useState(null);
  const [activeFilename, setActiveFilename] = useState(null);
  const [lastEditedPhase, setLastEditedPhase] = useState(null);
  const [showCarryOverModal, setShowCarryOverModal] = useState(false);
  const [carryOverTarget, setCarryOverTarget] = useState(null);
  const toast = useToast();

  const autoSave = useAutoSave(activeCruise, view, directoryHandle, activeFilename, setSaveStatus, toast.addToast);
  useBackupInterval(activeCruise, view);
  useKeyboardShortcuts(activeCruise, view, autoSave, toast.addToast);

  // Check for recovery data on mount
  useEffect(() => {
    const checkRecovery = async () => {
      const backups = await getAllBackups();
      if (backups.length > 0 && !directoryHandle) {
        const recent = backups.sort((a, b) =>
          new Date(b.lastModified) - new Date(a.lastModified)
        )[0];

        const lastModified = new Date(recent.lastModified);
        const now = new Date();
        const hourAgo = new Date(now - 60 * 60 * 1000);

        if (lastModified > hourAgo) {
          setRecoveryData(recent);
        }
      }
    };
    checkRecovery();
  }, []);

  const loadVoyagesFromDirectory = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      setDirectoryHandle(handle);

      const loadedVoyages = [];
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

      loadedVoyages.sort((a, b) => {
        const dateA = a.startDate || '1900-01-01';
        const dateB = b.startDate || '1900-01-01';
        return dateB.localeCompare(dateA);
      });

      setVoyages(loadedVoyages);
      setRecoveryData(null);
      toast.addToast(`Loaded ${loadedVoyages.length} voyages`, 'success');
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to load directory:', err);
        toast.addToast('Failed to load voyage directory', 'error');
      }
    }
  };

  const createNewCruise = async () => {
    try {
      if (!directoryHandle) {
        const handle = await window.showDirectoryPicker();
        setDirectoryHandle(handle);
      }
      setShowNewVoyageModal(true);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to select directory:', err);
      }
    }
  };

  const handleNewVoyageCreate = (voyageDetails) => {
    setShowNewVoyageModal(false);

    const safeFrom = voyageDetails.fromPort.replace(/[^a-z0-9]/gi, '_');
    const safeTo = voyageDetails.toPort.replace(/[^a-z0-9]/gi, '_');
    const filename = `${voyageDetails.startDate}_${safeFrom}_to_${safeTo}.json`;

    const newCruise = {
      ...defaultCruise(),
      name: voyageDetails.name,
      startDate: voyageDetails.startDate,
      filename,
    };

    if (voyages.length > 0) {
      setPendingNewCruise(newCruise);
      setPendingVoyageDetails(voyageDetails);
      setShowImportCountersModal(true);
    } else {
      setActiveCruise(newCruise);
      setActiveFilename(filename);
      setView('edit');
      toast.addToast('New voyage created', 'success');
    }
  };

  const handleStartFresh = () => {
    if (pendingNewCruise) {
      setActiveCruise(pendingNewCruise);
      setActiveFilename(generateFilename(pendingNewCruise));
      setView('edit');
      setPendingNewCruise(null);
      setPendingVoyageDetails(null);
      setShowImportCountersModal(false);
      toast.addToast('New voyage created', 'success');
    }
  };

  const handleImportCounters = (countersToImport) => {
    if (pendingNewCruise) {
      const newLeg = {
        id: Date.now(),
        departure: defaultReport('departure'),
        arrival: defaultReport('arrival'),
        voyageReport: null,
      };

      if (newLeg.departure.phases.length > 0) {
        const firstPhase = newLeg.departure.phases[0];
        Object.entries(countersToImport).forEach(([key, value]) => {
          if (firstPhase.equipment[key]) {
            firstPhase.equipment[key].start = value;
          }
        });
      }

      const cruiseWithLeg = {
        ...pendingNewCruise,
        legs: [newLeg],
      };

      setActiveCruise(cruiseWithLeg);
      setActiveFilename(generateFilename(cruiseWithLeg));
      setView('edit');
      setPendingNewCruise(null);
      setPendingVoyageDetails(null);
      setShowImportCountersModal(false);

      const importedCount = Object.keys(countersToImport).length;
      toast.addToast(`Voyage created with ${importedCount} counter${importedCount !== 1 ? 's' : ''} imported`, 'success');
    }
  };

  const getLastVoyage = () => {
    if (voyages.length === 0) return null;
    return voyages[0];
  };

  const openVoyage = (voyage) => {
    setActiveCruise(voyage);
    setActiveFilename(voyage.filename || generateFilename(voyage));
    setView('edit');
  };

  const recoverVoyage = () => {
    if (recoveryData) {
      setActiveCruise(recoveryData);
      setActiveFilename(recoveryData.filename || generateFilename(recoveryData));
      setView('edit');
      setRecoveryData(null);
      toast.addToast('Voyage recovered from backup', 'success');
    }
  };

  const dismissRecovery = async () => {
    if (recoveryData) {
      await deleteBackup(recoveryData.id);
      setRecoveryData(null);
    }
  };

  const updateCruise = (updated) => {
    const withTimestamp = {
      ...updated,
      lastModified: new Date().toISOString(),
    };
    setActiveCruise(withTimestamp);

    setVoyages(prevVoyages => {
      const index = prevVoyages.findIndex(v => v.id === updated.id);
      if (index >= 0) {
        const newVoyages = [...prevVoyages];
        newVoyages[index] = withTimestamp;
        return newVoyages;
      }
      return prevVoyages;
    });
  };

  const addLeg = () => {
    if (!activeCruise) return;
    const newLeg = { id: Date.now(), departure: defaultReport('departure'), arrival: defaultReport('arrival'), voyageReport: null };

    const lastLeg = activeCruise.legs[activeCruise.legs.length - 1];
    if (lastLeg?.arrival?.phases) {
      const lastPhase = lastLeg.arrival.phases.find(p => p.type === PHASE_TYPES.STANDBY)
                       || lastLeg.arrival.phases[lastLeg.arrival.phases.length - 1];
      if (lastPhase?.equipment && newLeg.departure.phases[0]) {
        Object.keys(newLeg.departure.phases[0].equipment).forEach(key => {
          if (lastPhase.equipment[key]?.end) {
            newLeg.departure.phases[0].equipment[key].start = lastPhase.equipment[key].end;
          }
        });
      }
    }

    updateCruise({ ...activeCruise, legs: [...activeCruise.legs, newLeg] });
    toast.addToast(lastLeg ? 'New leg added with counters from previous leg' : 'New leg added', 'success');
  };

  const updateLeg = (legIndex, newLeg) => {
    const newLegs = [...activeCruise.legs];
    newLegs[legIndex] = newLeg;
    updateCruise({ ...activeCruise, legs: newLegs });
  };

  const deleteLeg = (legIndex) => {
    const newLegs = activeCruise.legs.filter((_, i) => i !== legIndex);
    updateCruise({ ...activeCruise, legs: newLegs });
    toast.addToast('Leg deleted', 'info');
  };

  const handleSaveDensities = (newDensities) => {
    updateCruise({ ...activeCruise, densities: newDensities });
  };

  const handleVoyageEnd = (voyageEndData) => {
    updateCruise({ ...activeCruise, voyageEnd: voyageEndData });
    setShowVoyageEndModal(false);
  };

  // Manual carry-over logic
  const findNextPhase = (legIdx, repType, phaseIdx) => {
    if (!activeCruise) return null;
    const leg = activeCruise.legs[legIdx];
    if (!leg) return null;
    const rep = repType === 'departure' ? leg.departure : leg.arrival;
    if (!rep || !rep.phases) return null;

    if (phaseIdx < rep.phases.length - 1) {
      const next = rep.phases[phaseIdx + 1];
      return { legIndex: legIdx, reportType: repType, phaseIndex: phaseIdx + 1, phaseName: next.name || 'Next Phase',
        equipment: { dg12: next.equipment.dg12?.start || '', dg4: next.equipment.dg4?.start || '', dg3: next.equipment.dg3?.start || '', boiler1: next.equipment.boiler1?.start || '', boiler2: next.equipment.boiler2?.start || '' }
      };
    }
    if (repType === 'departure' && leg.arrival?.phases?.length > 0) {
      const next = leg.arrival.phases[0];
      return { legIndex: legIdx, reportType: 'arrival', phaseIndex: 0, phaseName: next.name || 'First Arrival Phase',
        equipment: { dg12: next.equipment.dg12?.start || '', dg4: next.equipment.dg4?.start || '', dg3: next.equipment.dg3?.start || '', boiler1: next.equipment.boiler1?.start || '', boiler2: next.equipment.boiler2?.start || '' }
      };
    }
    if (repType === 'arrival' && legIdx < activeCruise.legs.length - 1) {
      const nextLeg = activeCruise.legs[legIdx + 1];
      if (nextLeg?.departure?.phases?.length > 0) {
        const next = nextLeg.departure.phases[0];
        return { legIndex: legIdx + 1, reportType: 'departure', phaseIndex: 0, phaseName: next.name || 'Next Leg First Phase',
          equipment: { dg12: next.equipment.dg12?.start || '', dg4: next.equipment.dg4?.start || '', dg3: next.equipment.dg3?.start || '', boiler1: next.equipment.boiler1?.start || '', boiler2: next.equipment.boiler2?.start || '' }
        };
      }
    }
    return null;
  };

  const handleOpenCarryOver = () => {
    if (!lastEditedPhase) { toast.addToast('Edit END values in a phase first', 'warning'); return; }
    const target = findNextPhase(lastEditedPhase.legIndex, lastEditedPhase.reportType, lastEditedPhase.phaseIndex);
    if (target) { setCarryOverTarget(target); setShowCarryOverModal(true); }
    else { toast.addToast('No next phase found to carry over to', 'warning'); }
  };

  const handleConfirmCarryOver = (counters) => {
    if (!carryOverTarget || !activeCruise) { setShowCarryOverModal(false); return; }
    const { legIndex, reportType, phaseIndex } = carryOverTarget;
    const newLegs = activeCruise.legs.map((leg, li) => {
      if (li !== legIndex) return leg;
      const rep = reportType === 'departure' ? leg.departure : leg.arrival;
      const newPhases = rep.phases.map((phase, pi) => {
        if (pi !== phaseIndex) return phase;
        const newEq = { ...phase.equipment };
        Object.entries(counters).forEach(([k, v]) => { if (v && newEq[k]) newEq[k] = { ...newEq[k], start: v }; });
        return { ...phase, equipment: newEq };
      });
      return reportType === 'departure' ? { ...leg, departure: { ...rep, phases: newPhases } } : { ...leg, arrival: { ...rep, phases: newPhases } };
    });
    updateCruise({ ...activeCruise, legs: newLegs });
    const count = Object.keys(counters).length;
    toast.addToast(count + ' counter(s) carried over', 'success');
    setShowCarryOverModal(false);
    setLastEditedPhase(null);
  };

  const trackPhaseEnd = (legIdx, repType, phaseIdx, phaseName, equipment) => {
    const ends = { dg12: equipment.dg12?.end || '', dg4: equipment.dg4?.end || '', dg3: equipment.dg3?.end || '', boiler1: equipment.boiler1?.end || '', boiler2: equipment.boiler2?.end || '' };
    const hasAnyEnd = Object.values(ends).some(v => v && v !== '');
    if (hasAnyEnd) {
      setLastEditedPhase({ legIndex: legIdx, reportType: repType, phaseIndex: phaseIdx, phaseName: phaseName || 'Phase', equipment: ends });
    }
  };

  const densities = activeCruise?.densities || DEFAULT_DENSITIES;
  const isFileSystemSupported = 'showDirectoryPicker' in window;

  return (
    <div className="min-h-screen">
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        densities={densities}
        onSave={handleSaveDensities}
      />

      {showVoyageEndModal && activeCruise && (
        <VoyageEndModal
          cruise={activeCruise}
          onClose={() => setShowVoyageEndModal(false)}
          onSave={handleVoyageEnd}
          densities={densities}
        />
      )}

      {showNewVoyageModal && (
        <NewVoyageModal
          isOpen={showNewVoyageModal}
          onClose={() => setShowNewVoyageModal(false)}
          onCreate={handleNewVoyageCreate}
        />
      )}

      {showImportCountersModal && (
        <ImportCountersModal
          isOpen={showImportCountersModal}
          onClose={() => {
            setShowImportCountersModal(false);
            setPendingNewCruise(null);
            setPendingVoyageDetails(null);
          }}
          onStartFresh={handleStartFresh}
          onImport={handleImportCounters}
          lastVoyage={getLastVoyage()}
        />
      )}

      {showCarryOverModal && lastEditedPhase && carryOverTarget && (
        <ManualCarryOverModal
          isOpen={showCarryOverModal}
          onClose={() => setShowCarryOverModal(false)}
          onConfirm={handleConfirmCarryOver}
          sourceInfo={lastEditedPhase}
          targetInfo={carryOverTarget}
        />
      )}

      {view === 'edit' && activeCruise && (
        <FloatingCarryOverButton
          onClick={handleOpenCarryOver}
          disabled={!lastEditedPhase}
          sourceInfo={lastEditedPhase}
        />
      )}

      {/* Recovery Banner */}
      {recoveryData && (
        <div className="recovery-banner px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icons.Database />
              <div>
                <span className="font-semibold">Unsaved work found:</span> {recoveryData.name || 'Unnamed Voyage'}
                <span className="text-sm opacity-80 ml-2">
                  (Last modified: {new Date(recoveryData.lastModified).toLocaleString()})
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={recoverVoyage}
                className="px-4 py-1.5 bg-white/90 hover:bg-white text-amber-800 rounded-lg font-semibold text-sm transition-colors"
              >
                Recover
              </button>
              <button
                onClick={dismissRecovery}
                className="px-4 py-1.5 bg-amber-700/50 hover:bg-amber-700 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      <Header
        saveStatus={saveStatus}
        directoryHandle={directoryHandle}
        view={view}
        activeCruise={activeCruise}
        onSave={() => { autoSave(activeCruise); toast.addToast('Saved', 'success'); }}
        onShowSettings={() => setShowSettings(true)}
      />

      {!isFileSystemSupported && (
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 text-sm text-red-800 dark:text-red-200 flex items-center gap-3">
            <span className="text-xl">{'\u26A0\uFE0F'}</span>
            <div>
              <strong>Browser Not Supported:</strong> This app requires Chrome or Edge with File System Access API.
            </div>
          </div>
        </div>
      )}

      <DensityBar densities={densities} />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {view === 'list' ? (
          <VoyageList
            voyages={voyages}
            directoryHandle={directoryHandle}
            onLoadDirectory={loadVoyagesFromDirectory}
            onCreateNew={createNewCruise}
            onOpenVoyage={openVoyage}
          />
        ) : (
          <VoyageEditor
            activeCruise={activeCruise}
            densities={densities}
            activeFilename={activeFilename}
            allLegsCollapsed={allLegsCollapsed}
            setAllLegsCollapsed={setAllLegsCollapsed}
            updateCruise={updateCruise}
            addLeg={addLeg}
            updateLeg={updateLeg}
            deleteLeg={deleteLeg}
            setView={setView}
            setActiveFilename={setActiveFilename}
            setShowVoyageEndModal={setShowVoyageEndModal}
            trackPhaseEnd={trackPhaseEnd}
          />
        )}
      </main>

      <Footer directoryHandle={directoryHandle} />
    </div>
  );
}
