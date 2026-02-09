import { useState, useEffect } from 'react';
import { Icons } from '../Icons';
import { useToast } from '../../hooks/useToast';
import { DEFAULT_DENSITIES } from '../../utils/constants';

const SettingsModal = ({ isOpen, onClose, densities, onSave }) => {
  const [localDensities, setLocalDensities] = useState(densities);
  const toast = useToast();

  useEffect(() => {
    setLocalDensities(densities);
  }, [densities]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localDensities);
    toast.addToast('Densities updated', 'success');
    onClose();
  };

  const handleReset = () => {
    setLocalDensities(DEFAULT_DENSITIES);
    toast.addToast('Reset to defaults', 'info');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-lg animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-head flex items-center gap-3">
          <Icons.Settings />
          <div>
            <h2>Density Settings</h2>
            <p>Fuel densities @ 30{'\u00B0'}C</p>
          </div>
        </div>

        <div className="p-6 space-y-5 dark:bg-navy-800">
          <div className="bg-[var(--color-hfo-light)] dark:bg-[rgba(217,119,6,0.08)] border border-[var(--color-hfo-border)] dark:border-[rgba(217,119,6,0.2)] rounded-lg p-4 text-[0.78rem] text-[var(--color-hfo)] dark:text-[var(--color-hfo-band)]">
            <strong>Note:</strong> These densities apply to ALL legs in this cruise. Counter readings are in m{'\u00B3'}, calculations convert to MT.
          </div>

          {Object.keys(localDensities).map(fuel => (
            <div key={fuel}>
              <label className="form-label">
                {fuel} Density (t/m{'\u00B3'})
              </label>
              <input
                type="number"
                step="0.001"
                value={localDensities[fuel]}
                onChange={(e) => setLocalDensities({ ...localDensities, [fuel]: parseFloat(e.target.value) || 0 })}
                className="form-input font-mono text-[1rem]"
              />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-2.5 btn-primary text-white rounded-lg font-semibold text-[0.78rem] flex items-center justify-center gap-2"
            >
              <Icons.Check /> Save Settings
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 btn-flat rounded-lg font-semibold text-[0.78rem]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
