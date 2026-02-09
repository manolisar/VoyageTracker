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
        <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 text-white px-6 py-5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Icons.Settings />
            <div>
              <h2 className="text-xl font-display font-bold">Density Settings</h2>
              <p className="text-sm text-white/80">Fuel densities @ 30{'\u00B0'}C</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800/50 rounded-xl p-4 text-sm text-gold-800 dark:text-gold-200">
            <strong>Note:</strong> These densities apply to ALL legs in this cruise. Counter readings are in m{'\u00B3'}, calculations convert to MT.
          </div>

          {Object.keys(localDensities).map(fuel => (
            <div key={fuel}>
              <label className="block text-sm font-semibold text-navy-700 dark:text-navy-200 mb-2">
                {fuel} Density (t/m{'\u00B3'})
              </label>
              <input
                type="number"
                step="0.001"
                value={localDensities[fuel]}
                onChange={(e) => setLocalDensities({ ...localDensities, [fuel]: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-navy-50 dark:bg-navy-800 border border-navy-200 dark:border-navy-600
                           rounded-xl font-mono text-lg input-field"
              />
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 btn-primary text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <Icons.Check /> Save Settings
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-navy-100 dark:bg-navy-700 hover:bg-navy-200 dark:hover:bg-navy-600
                         text-navy-700 dark:text-navy-200 rounded-xl font-semibold transition-colors"
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
