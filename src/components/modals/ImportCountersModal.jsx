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
          <div className="modal-head flex items-center gap-3">
            <Icons.Database />
            <div>
              <h2>New Voyage</h2>
              <p>Previous voyage data available</p>
            </div>
          </div>

          <div className="p-6 dark:bg-navy-800">
            <div className="mb-5">
              <p className="text-[0.82rem] text-[var(--color-text)] dark:text-navy-200 mb-3">
                Would you like to import counter values from the last voyage?
              </p>
              <div className="bg-[var(--color-surface2)] dark:bg-navy-900 rounded-lg p-4">
                <div className="form-label mb-1">Last Voyage</div>
                <div className="font-bold text-[0.88rem] text-[var(--color-text)] dark:text-white">
                  {lastVoyage.name || 'Unnamed Voyage'}
                </div>
                <div className="text-[0.72rem] text-[var(--color-dim)]">
                  {lastVoyage.endDate || lastVoyage.startDate || 'No date'} {'\u2022'} {lastVoyage.legs?.length || 0} legs
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={onStartFresh}
                className="flex-1 px-4 py-2.5 rounded-lg btn-flat font-semibold text-[0.78rem]">
                Start Fresh
              </button>
              <button onClick={() => setShowSelection(true)}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-[0.78rem] transition-all btn-primary text-white">
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
        <div className="modal-head flex items-center gap-3">
          <Icons.Database />
          <div>
            <h2>Import Counters</h2>
            <p>From: {lastVoyage.name || 'Last Voyage'}</p>
          </div>
        </div>

        <div className="p-6 dark:bg-navy-800">
          <div className="mb-4">
            <p className="text-[0.78rem] text-[var(--color-dim)] mb-4">
              Select which counters to carry over. Deselect any that were reset.
            </p>

            <div className="flex gap-3 mb-4">
              <button onClick={handleSelectAll}
                className="px-3 py-1.5 text-[0.72rem] rounded-lg btn-flat">
                {'\u2713'} Select All
              </button>
              <button onClick={handleDeselectAll}
                className="px-3 py-1.5 text-[0.72rem] rounded-lg btn-flat">
                {'\u2717'} Deselect All
              </button>
            </div>

            <div className="space-y-2">
              {equipmentList.map(({ key, label }) => {
                const value = lastCounters?.[key];
                const hasValue = value && value !== '';

                return (
                  <div key={key} onClick={() => hasValue && handleToggle(key)}
                    className={`flex items-center justify-between p-3.5 rounded-lg border-2 transition-all
                      ${!hasValue
                        ? 'bg-[var(--color-surface2)] dark:bg-navy-900/50 border-[var(--color-border-subtle)] dark:border-navy-700 opacity-50 cursor-not-allowed'
                        : selectedCounters[key]
                          ? 'bg-[var(--color-surface2)] dark:bg-[rgba(6,182,212,0.08)] border-[var(--color-ocean-500)] dark:border-[var(--color-ocean-600)] cursor-pointer'
                          : 'bg-[var(--color-surface)] dark:bg-navy-800 border-[var(--color-border-subtle)] dark:border-navy-700 cursor-pointer hover:border-[var(--color-dim)]'
                      }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors text-xs
                        ${!hasValue
                          ? 'bg-[var(--color-surface2)] dark:bg-navy-700'
                          : selectedCounters[key]
                            ? 'bg-[var(--color-ocean-500)] text-white'
                            : 'bg-[var(--color-surface2)] dark:bg-navy-700'
                        }`}>
                        {selectedCounters[key] && hasValue && <Icons.Check />}
                      </div>
                      <span className="font-semibold text-[0.82rem] text-[var(--color-text)] dark:text-white">{label}</span>
                    </div>
                    <div className="text-right">
                      {hasValue ? (
                        <>
                          <div className="font-mono font-bold text-[0.82rem] text-[var(--color-text)] dark:text-white">
                            {formatNumber(value)} m{'\u00B3'}
                          </div>
                          {!selectedCounters[key] && (
                            <div className="text-[0.6rem] text-[var(--color-hfo)] font-bold uppercase">RESET</div>
                          )}
                        </>
                      ) : (
                        <div className="text-[0.72rem] text-[var(--color-faint)]">No data</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[var(--color-surface2)] dark:bg-navy-900 rounded-lg p-3 mb-4 text-[0.72rem] text-[var(--color-dim)]">
            Selected counters will populate the first Departure phase Start values.
          </div>

          <div className="flex gap-3">
            <button onClick={() => setShowSelection(false)}
              className="px-4 py-2.5 rounded-lg btn-flat font-semibold text-[0.78rem]">
              {'\u2190'} Back
            </button>
            <button onClick={handleImport}
              className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-[0.78rem] transition-all btn-primary text-white">
              Import {selectedCount > 0 ? `${selectedCount} Counter${selectedCount !== 1 ? 's' : ''}` : 'Selected'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportCountersModal;
