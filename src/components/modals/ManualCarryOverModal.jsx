import { useState, useEffect } from 'react';

const ManualCarryOverModal = ({ isOpen, onClose, onConfirm, sourceInfo, targetInfo }) => {
  const [selected, setSelected] = useState({ dg12: true, dg4: true, dg3: true, boiler1: true, boiler2: true });

  useEffect(() => {
    if (isOpen) setSelected({ dg12: true, dg4: true, dg3: true, boiler1: true, boiler2: true });
  }, [isOpen]);

  if (!isOpen || !sourceInfo || !targetInfo) return null;

  const equipmentList = [
    { key: 'dg12', label: 'DG 1-2' }, { key: 'dg4', label: 'DG 4' }, { key: 'dg3', label: 'DG 3' },
    { key: 'boiler1', label: 'Boiler 1' }, { key: 'boiler2', label: 'Boiler 2' },
  ];

  const handleConfirm = () => {
    const result = {};
    Object.entries(selected).forEach(([key, isSelected]) => {
      if (isSelected && sourceInfo.equipment[key]) result[key] = sourceInfo.equipment[key];
    });
    onConfirm(result);
  };

  const hasValidSelection = Object.entries(sourceInfo.equipment).some(([k, v]) => v && v !== '' && selected[k]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Carry Over Counters</h3>
          <p>Copy END values to next phase START</p>
        </div>
        <div className="p-6 dark:bg-navy-800">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[var(--color-surface2)] dark:bg-[rgba(30,41,59,0.5)] rounded-lg p-3 border border-[var(--color-border-subtle)] dark:border-white/10">
              <div className="form-label mb-1">From (END)</div>
              <div className="text-[0.78rem] font-medium text-[var(--color-text)] dark:text-white truncate">{sourceInfo.phaseName}</div>
            </div>
            <div className="bg-[var(--color-surface2)] dark:bg-[rgba(30,41,59,0.5)] rounded-lg p-3 border border-[var(--color-border-subtle)] dark:border-white/10">
              <div className="form-label mb-1">To (START)</div>
              <div className="text-[0.78rem] font-medium text-[var(--color-text)] dark:text-white truncate">{targetInfo.phaseName}</div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {equipmentList.map(({ key, label }) => {
              const val = sourceInfo.equipment[key];
              const hasVal = val && val !== '';
              return (
                <div key={key} onClick={() => hasVal && setSelected(p => ({...p, [key]: !p[key]}))}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer
                    ${!hasVal ? 'opacity-40 cursor-not-allowed border-[var(--color-border-subtle)] dark:border-navy-700' :
                      selected[key] ? 'bg-[var(--color-surface2)] dark:bg-[rgba(6,182,212,0.08)] border-[var(--color-ocean-500)] dark:border-[var(--color-ocean-600)]' :
                      'border-[var(--color-border-subtle)] dark:border-navy-700 hover:border-[var(--color-dim)]'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold
                      ${selected[key] && hasVal ? 'bg-[var(--color-ocean-500)] text-white' : 'bg-[var(--color-surface2)] dark:bg-navy-600'}`}>
                      {selected[key] && hasVal && '\u2713'}
                    </div>
                    <span className="font-medium text-[0.82rem] text-[var(--color-text)] dark:text-white">{label}</span>
                  </div>
                  <span className="font-mono text-[0.78rem] text-[var(--color-dim)]">{hasVal ? parseFloat(val).toFixed(1) + ' m\u00B3' : '\u2014'}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg btn-flat font-medium text-[0.78rem]">Cancel</button>
            <button onClick={handleConfirm} disabled={!hasValidSelection} className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-[0.78rem] transition-colors ${hasValidSelection ? 'btn-primary text-white' : 'bg-[var(--color-surface2)] dark:bg-navy-700 text-[var(--color-faint)] cursor-not-allowed'}`}>Carry Over</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualCarryOverModal;
