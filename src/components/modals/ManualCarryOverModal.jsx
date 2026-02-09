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
        <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 text-white px-6 py-4 rounded-t-2xl">
          <h3 className="text-lg font-display font-bold">Carry Over Counters</h3>
          <p className="text-sm text-white/80">Copy END values to next phase START</p>
        </div>
        <div className="p-6 dark:bg-navy-800">
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1">From (END)</div>
              <div className="text-sm font-medium text-navy-800 dark:text-white truncate">{sourceInfo.phaseName}</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-200 dark:border-green-800">
              <div className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase mb-1">To (START)</div>
              <div className="text-sm font-medium text-navy-800 dark:text-white truncate">{targetInfo.phaseName}</div>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {equipmentList.map(({ key, label }) => {
              const val = sourceInfo.equipment[key];
              const hasVal = val && val !== '';
              return (
                <div key={key} onClick={() => hasVal && setSelected(p => ({...p, [key]: !p[key]}))}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer
                    ${!hasVal ? 'opacity-40 cursor-not-allowed border-navy-200 dark:border-navy-700' :
                      selected[key] ? 'bg-ocean-50 dark:bg-ocean-900/20 border-ocean-400 dark:border-ocean-600' :
                      'border-navy-200 dark:border-navy-700 hover:border-navy-300'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold
                      ${selected[key] && hasVal ? 'bg-ocean-500 text-white' : 'bg-navy-200 dark:bg-navy-600'}`}>
                      {selected[key] && hasVal && '\u2713'}
                    </div>
                    <span className="font-medium text-navy-800 dark:text-white">{label}</span>
                  </div>
                  <span className="font-mono text-sm text-navy-600 dark:text-navy-300">{hasVal ? parseFloat(val).toFixed(1) + ' m\u00B3' : '\u2014'}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-200 font-medium hover:bg-navy-200 dark:hover:bg-navy-600 transition-colors">Cancel</button>
            <button onClick={handleConfirm} disabled={!hasValidSelection} className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-colors ${hasValidSelection ? 'btn-primary text-white' : 'bg-navy-200 dark:bg-navy-700 text-navy-400 cursor-not-allowed'}`}>Carry Over</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualCarryOverModal;
