import { useState, useEffect, useRef } from 'react';
import { useToast } from '../../context/ToastContext';
import { Icons } from '../common/Icons';
import { ThemeToggle } from '../common/ThemeToggle';
import SettingsModal from '../modals/SettingsModal';
import VoyageEndModal from '../modals/VoyageEndModal';
import NewVoyageModal from '../modals/NewVoyageModal';
import ImportCountersModal from '../modals/ImportCountersModal';
import CruiseSummary from './CruiseSummary';
import LegSection from '../leg/LegSection';
import {
  APP_VERSION,
  DEFAULT_DENSITIES,
  AUTO_SAVE_DELAY,
  BACKUP_INTERVAL,
  PHASE_TYPES,
} from '../../constants';
import { defaultCruise, defaultReport } from '../../utils/dataFactory';
import { validateCruiseData } from '../../utils/validation';
import { calcCruiseTotal, generateFilename } from '../../utils/calculations';
import {
  saveToBackup,
  getAllBackups,
  deleteBackup,
} from '../../utils/storage';

function VoyageTracker() {
  const [voyages, setVoyages] = useState([]);
  const [activeCruise, setActiveCruise] = useState(null);
  const [view, setView] = useState('list');
  const [showSettings, setShowSettings] = useState(false);
  const [showVoyageEndModal, setShowVoyageEndModal] = useState(false);
  const [showNewVoyageModal, setShowNewVoyageModal] = useState(false);
  const [showImportCountersModal, setShowImportCountersModal] = useState(false);
  const [pendingNewCruise, setPendingNewCruise] = useState(null); // Holds new cruise while import modal is open
  const [pendingVoyageDetails, setPendingVoyageDetails] = useState(null); // Holds voyage details from NewVoyageModal
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [directoryHandle, setDirectoryHandle] = useState(null);
  const [allLegsCollapsed, setAllLegsCollapsed] = useState(false);
  const [recoveryData, setRecoveryData] = useState(null);
  const [activeFilename, setActiveFilename] = useState(null); // Stores filename separately - doesn't change during editing
  const saveTimeoutRef = useRef(null);
  const backupIntervalRef = useRef(null);
  const toast = useToast();

  // Check for recovery data on mount
  useEffect(() => {
    const checkRecovery = async () => {
      const backups = await getAllBackups();
      if (backups.length > 0 && !directoryHandle) {
        // Check for unsaved changes
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
  }, [directoryHandle]);

  // Periodic backup
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

  // Auto-save function
  const autoSave = async (cruise) => {
    if (!directoryHandle || !cruise) return;

    setSaveStatus('saving');

    try {
      // Use activeFilename (stable) - never changes during editing session
      const filename = activeFilename || generateFilename(cruise);
      const dataWithMeta = {
        ...cruise,
        lastModified: new Date().toISOString(),
        version: APP_VERSION,
      };
      const dataStr = JSON.stringify(dataWithMeta, null, 2);

      const fileHandle = await directoryHandle.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(dataStr);
      await writable.close();

      // Also save to IndexedDB backup
      await saveToBackup(dataWithMeta);

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Auto-save failed:', err);
      setSaveStatus('error');
      toast.addToast('Save failed - check folder permissions', 'error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Debounced auto-save
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeCruise && view === 'edit') {
          autoSave(activeCruise);
          toast.addToast('Saved manually', 'success');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCruise, view]);

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

            // Validate and fix data
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

      // Show NewVoyageModal to get voyage details first
      setShowNewVoyageModal(true);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Failed to select directory:', err);
      }
    }
  };

  // Handle voyage details from NewVoyageModal
  const handleNewVoyageCreate = (voyageDetails) => {
    setShowNewVoyageModal(false);

    const newCruise = {
      ...defaultCruise(),
      name: voyageDetails.name,
      startDate: voyageDetails.startDate,
    };

    // Check if we have previous voyages to import from
    if (voyages.length > 0) {
      // Store the new cruise and show import modal
      setPendingNewCruise(newCruise);
      setPendingVoyageDetails(voyageDetails);
      setShowImportCountersModal(true);
    } else {
      // No previous voyages, just create new cruise
      setActiveCruise(newCruise);
      setActiveFilename(generateFilename(newCruise));
      setView('edit');
      toast.addToast('New voyage created', 'success');
    }
  };

  // Handle starting fresh (no import)
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

  // Handle importing counters from last voyage
  const handleImportCounters = (countersToImport) => {
    if (pendingNewCruise) {
      // Add a leg with departure pre-filled
      const newLeg = {
        id: Date.now(),
        departure: defaultReport('departure'),
        arrival: defaultReport('arrival'),
      };

      // Pre-fill the first phase's Start values with imported counters
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

  // Get the last voyage for import
  const getLastVoyage = () => {
    if (voyages.length === 0) return null;
    // Voyages are already sorted by date (newest first)
    return voyages[0];
  };

  const openVoyage = (voyage) => {
    setActiveCruise(voyage);
    setActiveFilename(voyage.filename || generateFilename(voyage)); // Lock the filename
    setView('edit');
  };

  const recoverVoyage = () => {
    if (recoveryData) {
      setActiveCruise(recoveryData);
      setActiveFilename(recoveryData.filename || generateFilename(recoveryData)); // Lock the filename
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
    const newLeg = { id: Date.now(), departure: defaultReport('departure'), arrival: defaultReport('arrival') };

    // Counter carry-over from last leg
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

  const densities = activeCruise?.densities || DEFAULT_DENSITIES;
  const isFileSystemSupported = 'showDirectoryPicker' in window;

  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving': return { text: 'Saving...', class: 'bg-gold-500', dot: 'bg-gold-300' };
      case 'saved': return { text: 'Saved', class: 'bg-green-500', dot: 'bg-green-300 connected' };
      case 'error': return { text: 'Error', class: 'bg-red-500', dot: 'bg-red-300 error' };
      default: return directoryHandle
        ? { text: 'Connected', class: 'bg-navy-600 dark:bg-navy-700', dot: 'bg-green-400 connected' }
        : { text: 'No folder', class: 'bg-gold-500', dot: 'bg-gold-300 disconnected' };
    }
  };

  const status = getSaveStatusDisplay();

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

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-navy-200/50 dark:border-navy-700/50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-ocean-500/25">
                <Icons.Ship />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-navy-800 dark:text-white">Voyage Tracker</h1>
                <p className="text-xs text-navy-500 dark:text-navy-400">Engine Department • v{APP_VERSION}</p>
              </div>
            </div>

            <div className="flex gap-3 items-center">
              {/* Status Badge */}
              <div className={`${status.class} text-white px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-2`}>
                <span className={`status-dot ${status.dot}`}></span>
                {status.text}
              </div>

              {view === 'edit' && activeCruise && (
                <>
                  <button
                    onClick={() => { autoSave(activeCruise); toast.addToast('Saved', 'success'); }}
                    className="p-2.5 bg-ocean-500 hover:bg-ocean-600 text-white rounded-xl transition-colors shadow-lg shadow-ocean-500/25"
                    title="Save Now (Ctrl+S)"
                  >
                    <Icons.Save />
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-2.5 bg-navy-100 dark:bg-navy-700 hover:bg-navy-200 dark:hover:bg-navy-600
                               text-navy-600 dark:text-navy-200 rounded-xl transition-colors"
                    title="Density Settings"
                  >
                    <Icons.Settings />
                  </button>
                </>
              )}

              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Browser Support Warning */}
      {!isFileSystemSupported && (
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 text-sm text-red-800 dark:text-red-200 flex items-center gap-3">
            <span className="text-xl">⚠️</span>
            <div>
              <strong>Browser Not Supported:</strong> This app requires Chrome or Edge with File System Access API.
            </div>
          </div>
        </div>
      )}

      {/* Density Bar */}
      <div className="max-w-6xl mx-auto px-4 py-2">
        <div className="glass-card rounded-xl px-4 py-2.5 text-sm flex flex-wrap gap-x-6 gap-y-1 items-center">
          <span className="font-semibold text-navy-700 dark:text-navy-200">Current Densities:</span>
          <span className="text-navy-600 dark:text-navy-300">HFO: <b className="font-mono">{densities.HFO}</b></span>
          <span className="text-navy-600 dark:text-navy-300">MGO: <b className="font-mono">{densities.MGO}</b></span>
          <span className="text-navy-600 dark:text-navy-300">LSFO: <b className="font-mono">{densities.LSFO}</b></span>
          <span className="text-navy-400 dark:text-navy-500 ml-auto text-xs">
            Counters in m³ • Summaries in MT • DG3 & Boilers always MGO • Auto-saves
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {view === 'list' ? (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-display font-bold text-navy-800 dark:text-white">Voyage Files</h2>
              <div className="flex gap-3">
                <button
                  onClick={loadVoyagesFromDirectory}
                  className="px-5 py-2.5 bg-navy-100 dark:bg-navy-700 hover:bg-navy-200 dark:hover:bg-navy-600
                             text-navy-700 dark:text-navy-200 rounded-xl font-semibold flex items-center gap-2 transition-colors"
                >
                  <Icons.Folder /> Select Folder
                </button>
                <button
                  onClick={createNewCruise}
                  className="px-5 py-2.5 btn-primary text-white rounded-xl font-semibold flex items-center gap-2"
                >
                  <Icons.Plus /> New Voyage
                </button>
              </div>
            </div>

            {!directoryHandle && voyages.length === 0 ? (
              <div className="glass-card rounded-2xl py-16 text-center">
                <div className="text-6xl mb-6">📁</div>
                <p className="text-xl font-display font-semibold text-navy-700 dark:text-navy-200 mb-2">
                  No folder selected
                </p>
                <p className="text-navy-500 dark:text-navy-400">
                  Use <span className="font-semibold text-ocean-600 dark:text-ocean-400">"Select Folder"</span> above to open your voyage folder,<br/>
                  or click <span className="font-semibold text-ocean-600 dark:text-ocean-400">"New Voyage"</span> to start fresh
                </p>
              </div>
            ) : voyages.length === 0 ? (
              <div className="glass-card rounded-2xl py-16 text-center">
                <div className="text-6xl mb-6">🚢</div>
                <p className="text-xl font-display font-semibold text-navy-700 dark:text-navy-200 mb-2">
                  No voyage files found
                </p>
                <p className="text-navy-500 dark:text-navy-400">
                  Click "New Voyage" to create your first voyage
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {voyages.map((voyage, index) => (
                  <div
                    key={voyage.id}
                    className="voyage-card glass-card rounded-2xl p-5 flex justify-between items-center hover:shadow-xl
                               transition-all cursor-pointer group animate-slide-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                    onClick={() => openVoyage(voyage)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-xl
                                      flex items-center justify-center text-white text-xl shadow-lg shadow-ocean-500/25">
                        🚢
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-navy-800 dark:text-white flex items-center gap-2">
                          {voyage.name || 'Unnamed Voyage'}
                          {voyage.voyageEnd && (
                            <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              ✓ Completed
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-navy-500 dark:text-navy-400">
                          {voyage.startDate || 'No date'} • {voyage.vessel} • {voyage.legs.length} legs • {calcCruiseTotal(voyage).toFixed(1)} MT
                        </p>
                        <p className="text-xs text-navy-400 dark:text-navy-500 mt-1 font-mono">
                          📄 {voyage.filename}
                        </p>
                      </div>
                    </div>
                    <div className="text-ocean-500 group-hover:translate-x-1 transition-transform">
                      <Icons.ArrowRight />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            <button
              onClick={() => { setView('list'); setActiveFilename(null); }}
              className="mb-4 text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300
                         font-semibold text-sm flex items-center gap-1 transition-colors"
            >
              ← Back to Voyages
            </button>

            {activeCruise && (
              <>
                {/* Cruise Info Card */}
                <div className="glass-card rounded-2xl p-5 mb-6">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">
                        Cruise Name
                      </label>
                      <input type="text" value={activeCruise.name}
                        onChange={(e) => updateCruise({ ...activeCruise, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600
                                   rounded-xl text-sm input-field font-medium"
                        placeholder="Singapore to Hong Kong" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">
                        Vessel
                      </label>
                      <input type="text" value={activeCruise.vessel}
                        onChange={(e) => updateCruise({ ...activeCruise, vessel: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600
                                   rounded-xl text-sm input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">
                        Start Date
                      </label>
                      <input type="date" value={activeCruise.startDate}
                        onChange={(e) => updateCruise({ ...activeCruise, startDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600
                                   rounded-xl text-sm input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">
                        End Date
                      </label>
                      <input type="date" value={activeCruise.endDate}
                        onChange={(e) => updateCruise({ ...activeCruise, endDate: e.target.value })}
                        className="w-full px-4 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600
                                   rounded-xl text-sm input-field" />
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-navy-400 dark:text-navy-500 font-mono flex items-center gap-2">
                    <Icons.Save /> Saving to: {activeFilename}
                  </div>
                </div>

                <CruiseSummary cruise={activeCruise} densities={densities} />

                {/* Notes shown if voyage completed and has notes */}
                {activeCruise.voyageEnd?.notes && (
                  <div className="glass-card rounded-xl px-5 py-3 mb-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50
                                  dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200/50 dark:border-green-800/30">
                    <span className="text-sm font-semibold text-navy-600 dark:text-navy-300">Notes:</span>
                    <span className="text-sm text-navy-600 dark:text-navy-400 ml-2">{activeCruise.voyageEnd.notes}</span>
                  </div>
                )}

                {/* Legs Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-display font-bold text-navy-800 dark:text-white">Voyage Legs</h2>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAllLegsCollapsed(!allLegsCollapsed)}
                      className="px-4 py-2 bg-navy-100 dark:bg-navy-700 hover:bg-navy-200 dark:hover:bg-navy-600
                                 text-navy-600 dark:text-navy-200 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
                    >
                      {allLegsCollapsed ? <><Icons.ChevronDown /> Expand All</> : <><Icons.ChevronRight /> Collapse All</>}
                    </button>
                    <button
                      onClick={() => setShowVoyageEndModal(true)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700
                                 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
                    >
                      <Icons.Flag /> End Voyage
                    </button>
                    <button
                      onClick={addLeg}
                      className="px-4 py-2 btn-primary text-white rounded-xl font-semibold text-sm flex items-center gap-2"
                    >
                      <Icons.Plus /> Add Leg
                    </button>
                  </div>
                </div>

                {activeCruise.legs.map((leg, idx) => (
                  <LegSection
                    key={leg.id}
                    leg={leg}
                    legIndex={idx}
                    onChange={(newLeg) => updateLeg(idx, newLeg)}
                    onDelete={() => deleteLeg(idx)}
                    densities={densities}
                    externalCollapsed={allLegsCollapsed}
                  />
                ))}

                {activeCruise.legs.length === 0 && (
                  <div className="glass-card rounded-2xl py-12 text-center">
                    <div className="text-5xl mb-4">🚢</div>
                    <p className="text-navy-500 dark:text-navy-400">No legs yet. Click "Add Leg" to add voyage data.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-navy-400 dark:text-navy-500">
        <div className="flex items-center justify-center gap-2">
          <span>Auto-saves to network folder</span>
          <span>•</span>
          <span>Backup to IndexedDB</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className={`status-dot ${directoryHandle ? 'connected' : 'disconnected'}`}></span>
            {directoryHandle ? 'Connected' : 'No folder selected'}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default VoyageTracker;
