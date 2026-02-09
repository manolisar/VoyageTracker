import { useState, useEffect } from 'react';
import { Icons } from '../Icons';

const NewVoyageModal = ({ isOpen, onClose, onCreate }) => {
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromPort, setFromPort] = useState('');
  const [toPort, setToPort] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStartDate(new Date().toISOString().split('T')[0]);
      setFromPort('');
      setToPort('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const voyageName = fromPort && toPort ? `${fromPort} to ${toPort}` : '';
  const canCreate = startDate && fromPort.trim() && toPort.trim();

  const handleCreate = () => {
    if (canCreate) {
      onCreate({
        startDate,
        name: voyageName,
        fromPort: fromPort.trim(),
        toPort: toPort.trim(),
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && canCreate) {
      handleCreate();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 text-white px-6 py-5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Icons.Ship />
            <div>
              <h2 className="text-xl font-display font-bold">New Voyage</h2>
              <p className="text-sm text-white/80">Enter voyage details</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5 dark:bg-navy-800" onKeyDown={handleKeyDown}>
          <div>
            <label className="block text-sm font-semibold text-navy-700 dark:text-navy-200 mb-2">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-600 rounded-xl text-lg input-field" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-navy-200 mb-2">From</label>
              <input type="text" value={fromPort} onChange={(e) => setFromPort(e.target.value)} placeholder="Singapore"
                className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-600 rounded-xl input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-navy-200 mb-2">To</label>
              <input type="text" value={toPort} onChange={(e) => setToPort(e.target.value)} placeholder="Hong Kong"
                className="w-full px-4 py-3 bg-white dark:bg-navy-900 border border-navy-200 dark:border-navy-600 rounded-xl input-field" />
            </div>
          </div>

          {voyageName && (
            <div className="bg-ocean-50 dark:bg-ocean-900/20 border border-ocean-200 dark:border-ocean-800/50 rounded-xl p-4">
              <div className="text-xs text-ocean-600 dark:text-ocean-400 font-semibold uppercase tracking-wide mb-1">Voyage Name</div>
              <div className="text-lg font-display font-bold text-navy-800 dark:text-white flex items-center gap-2">
                {fromPort} <Icons.ArrowRight /> {toPort}
              </div>
              <div className="text-xs text-navy-500 dark:text-navy-400 mt-1 font-mono">
                {'\uD83D\uDCC2'} {startDate}_{fromPort.replace(/[^a-z0-9]/gi, '_')}_to_{toPort.replace(/[^a-z0-9]/gi, '_')}.json
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-200 font-semibold hover:bg-navy-200 dark:hover:bg-navy-600 transition-colors">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={!canCreate}
              className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2
                ${canCreate ? 'btn-primary text-white' : 'bg-navy-200 dark:bg-navy-700 text-navy-400 dark:text-navy-500 cursor-not-allowed'}`}>
              <Icons.Plus /> Create Voyage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewVoyageModal;
