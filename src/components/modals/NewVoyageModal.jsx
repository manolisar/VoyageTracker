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
        <div className="modal-head flex items-center gap-3">
          <Icons.Ship />
          <div>
            <h2>New Voyage</h2>
            <p>Enter voyage details</p>
          </div>
        </div>

        <div className="p-6 space-y-5 dark:bg-navy-800" onKeyDown={handleKeyDown}>
          <div>
            <label className="form-label">Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="form-input font-mono" autoFocus />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">From</label>
              <input type="text" value={fromPort} onChange={(e) => setFromPort(e.target.value)} placeholder="Singapore"
                className="form-input" />
            </div>
            <div>
              <label className="form-label">To</label>
              <input type="text" value={toPort} onChange={(e) => setToPort(e.target.value)} placeholder="Hong Kong"
                className="form-input" />
            </div>
          </div>

          {voyageName && (
            <div className="bg-[var(--color-surface2)] dark:bg-[rgba(30,41,59,0.5)] border border-[var(--color-border-subtle)] dark:border-white/10 rounded-lg p-4">
              <div className="form-label mb-1">Voyage Name</div>
              <div className="text-[0.95rem] font-bold text-[var(--color-text)] dark:text-white flex items-center gap-2">
                {fromPort} <Icons.ArrowRight /> {toPort}
              </div>
              <div className="text-[0.6rem] text-[var(--color-faint)] mt-1 font-mono">
                {'\uD83D\uDCC2'} {startDate}_{fromPort.replace(/[^a-z0-9]/gi, '_')}_to_{toPort.replace(/[^a-z0-9]/gi, '_')}.json
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg btn-flat font-semibold text-[0.78rem]">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={!canCreate}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-[0.78rem] transition-all flex items-center justify-center gap-2
                ${canCreate ? 'btn-primary text-white' : 'bg-[var(--color-surface2)] dark:bg-navy-700 text-[var(--color-faint)] dark:text-navy-500 cursor-not-allowed'}`}>
              <Icons.Plus /> Create Voyage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewVoyageModal;
