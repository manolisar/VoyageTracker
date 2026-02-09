const CounterCarryOverModal = ({ isOpen, onClose, onConfirm, equipmentLabel, prevEnd, currentStart }) => {
  if (!isOpen) return null;

  const formatNumber = (num) => parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Update Counter Start?</h3>
          <p>Counter carry-over detected</p>
        </div>

        <div className="p-6 dark:bg-navy-800">
          <div className="mb-4">
            <div className="text-[0.78rem] font-semibold text-[var(--color-text)] dark:text-navy-200 mb-3">Equipment: <span className="text-[var(--color-ocean-500)]">{equipmentLabel}</span></div>

            <div className="bg-[var(--color-surface2)] dark:bg-navy-900 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[0.78rem] text-[var(--color-dim)]">Previous End:</span>
                <span className="font-mono font-bold text-[var(--color-text)] dark:text-white">{formatNumber(prevEnd)} m{'\u00B3'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[0.78rem] text-[var(--color-dim)]">Current Start:</span>
                <span className="font-mono font-bold text-[var(--color-hfo)]">{formatNumber(currentStart)} m{'\u00B3'}</span>
              </div>
              <div className="border-t border-[var(--color-border-subtle)] dark:border-white/10 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-[0.78rem] text-[var(--color-dim)]">Difference:</span>
                  <span className="font-mono font-semibold text-red-500">{formatNumber(Math.abs(parseFloat(prevEnd) - parseFloat(currentStart)))} m{'\u00B3'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg btn-flat font-medium text-[0.78rem]"
            >
              Keep Current
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium text-[0.78rem] transition-all btn-primary text-white"
            >
              Update to {formatNumber(prevEnd)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CounterCarryOverModal;
