import { useState } from 'react';
import { Icons } from '../Icons';
import { PHASE_TYPES } from '../../utils/constants';

const ImportCountersModal = ({ isOpen, onClose, onStartFresh, onImport, lastVoyage }) => {
  const [selectedCounters, setSelectedCounters] = useState({
    dg12: true, dg4: true, dg3: true, boiler1: true, boiler2: true,
  });
  const [showSelection, setShowSelection] = useState(false);

  if (!isOpen || !lastVoyage) return null;

  const getLastCounterValues = () => {
    const lastLeg = lastVoyage.legs[lastVoyage.legs.length - 1];
    if (!lastLeg?.arrival?.phases) return null;

    const standbyPhase = lastLeg.arrival.phases.find(p => p.type === PHASE_TYPES.STANDBY);
    const lastPhase = standbyPhase || lastLeg.arrival.phases[lastLeg.arrival.phases.length - 1];

    if (!lastPhase?.equipment) return null;

    const counters = {};
    Object.entries(lastPhase.equipment).forEach(([key, eq]) => {
      counters[key] = eq.end || '';
    });

    return counters;
  };

  const lastCounters = getLastCounterValues();

  const formatNumber = (num) => {
    if (!num || num === '') return '\u2013';
    return parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const equipmentList = [
    { key: 'dg12', label: 'DG 1-2' },
    { key: 'dg4', label: 'DG 4' },
    { key: 'dg3', label: 'DG 3' },
    { key: 'boiler1', label: 'Boiler 1' },
    { key: 'boiler2', label: 'Boiler 2' },
  ];

  const handleSelectAll = () => {
    setSelectedCounters({ dg12: true, dg4: true, dg3: true, boiler1: true, boiler2: true });
  };

  const handleDeselectAll = () => {
    setSelectedCounters({ dg12: false, dg4: false, dg3: false, boiler1: false, boiler2: false });
  };

  const handleToggle = (key) => {
    setSelectedCounters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleImport = () => {
    const countersToImport = {};
    Object.entries(selectedCounters).forEach(([key, isSelected]) => {
      if (isSelected && lastCounters && lastCounters[key]) {
        countersToImport[key] = lastCounters[key];
      }
    });
    onImport(countersToImport);
  };

  const selectedCount = Object.values(selectedCounters).filter(Boolean).length;

  if (!showSelection) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 text-white px-6 py-5 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <Icons.Database />
              <div>
                <h2 className="text-xl font-display font-bold">New Voyage</h2>
                <p className="text-sm text-white/80">Previous voyage data available</p>
              </div>
            </div>
          </div>

          <div className="p-6 dark:bg-navy-800">
            <div className="mb-5">
              <p className="text-navy-700 dark:text-navy-200 mb-3">
                Would you like to import counter values from the last voyage?
              </p>
              <div className="bg-navy-50 dark:bg-navy-900 rounded-xl p-4">
                <div className="text-sm text-navy-500 dark:text-navy-400 mb-1">Last Voyage</div>
                <div className="font-display font-bold text-navy-800 dark:text-white">
                  {lastVoyage.name || 'Unnamed Voyage'}
                </div>
                <div className="text-sm text-navy-500 dark:text-navy-400">
                  {lastVoyage.endDate || lastVoyage.startDate || 'No date'} {'\u2022'} {lastVoyage.legs?.length || 0} legs
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={onStartFresh}
                className="flex-1 px-4 py-3 rounded-xl bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-200 font-semibold hover:bg-navy-200 dark:hover:bg-navy-600 transition-colors">
                Start Fresh
              </button>
              <button onClick={() => setShowSelection(true)}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all btn-primary text-white">
                Import Counters
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 text-white px-6 py-5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Icons.Database />
            <div>
              <h2 className="text-xl font-display font-bold">Import Counters</h2>
              <p className="text-sm text-white/80">From: {lastVoyage.name || 'Last Voyage'}</p>
            </div>
          </div>
        </div>

        <div className="p-6 dark:bg-navy-800">
          <div className="mb-4">
            <p className="text-sm text-navy-600 dark:text-navy-300 mb-4">
              Select which counters to carry over. Deselect any that were reset.
            </p>

            <div className="flex gap-3 mb-4">
              <button onClick={handleSelectAll}
                className="px-3 py-1.5 text-sm rounded-lg bg-ocean-100 dark:bg-ocean-900/30 text-ocean-700 dark:text-ocean-300 hover:bg-ocean-200 dark:hover:bg-ocean-900/50 transition-colors">
                {'\u2713'} Select All
              </button>
              <button onClick={handleDeselectAll}
                className="px-3 py-1.5 text-sm rounded-lg bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-600 transition-colors">
                {'\u2717'} Deselect All
              </button>
            </div>

            <div className="space-y-2">
              {equipmentList.map(({ key, label }) => {
                const value = lastCounters?.[key];
                const hasValue = value && value !== '';

                return (
                  <div key={key} onClick={() => hasValue && handleToggle(key)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all
                      ${!hasValue
                        ? 'bg-navy-50 dark:bg-navy-900/50 border-navy-200 dark:border-navy-700 opacity-50 cursor-not-allowed'
                        : selectedCounters[key]
                          ? 'bg-ocean-50 dark:bg-ocean-900/20 border-ocean-300 dark:border-ocean-700 cursor-pointer'
                          : 'bg-white dark:bg-navy-800 border-navy-200 dark:border-navy-700 cursor-pointer hover:border-navy-300'
                      }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors
                        ${!hasValue
                          ? 'bg-navy-200 dark:bg-navy-700'
                          : selectedCounters[key]
                            ? 'bg-ocean-500 text-white'
                            : 'bg-navy-200 dark:bg-navy-700'
                        }`}>
                        {selectedCounters[key] && hasValue && <Icons.Check />}
                      </div>
                      <span className="font-semibold text-navy-800 dark:text-white">{label}</span>
                    </div>
                    <div className="text-right">
                      {hasValue ? (
                        <>
                          <div className="font-mono font-bold text-navy-800 dark:text-white">
                            {formatNumber(value)} m{'\u00B3'}
                          </div>
                          {!selectedCounters[key] && (
                            <div className="text-xs text-gold-600 dark:text-gold-400 font-semibold">RESET</div>
                          )}
                        </>
                      ) : (
                        <div className="text-sm text-navy-400 dark:text-navy-500">No data</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-navy-50 dark:bg-navy-900 rounded-xl p-3 mb-4 text-sm text-navy-600 dark:text-navy-300">
            Selected counters will populate the first Departure phase Start values.
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowSelection(false)}
              className="px-4 py-3 rounded-xl bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-200 font-semibold hover:bg-navy-200 dark:hover:bg-navy-600 transition-colors">
              {'\u2190'} Back
            </button>
            <button onClick={handleImport}
              className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all btn-primary text-white">
              Import {selectedCount > 0 ? `${selectedCount} Counter${selectedCount !== 1 ? 's' : ''}` : 'Selected'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCountersModal;
