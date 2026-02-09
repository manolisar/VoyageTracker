const CounterCarryOverModal = ({ isOpen, onClose, onConfirm, equipmentLabel, prevEnd, currentStart }) => {
  if (!isOpen) return null;

  const formatNumber = (num) => parseFloat(num).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 text-white px-6 py-4 rounded-t-2xl">
          <h3 className="text-lg font-display font-bold">Update Counter Start?</h3>
          <p className="text-sm text-white/80">Counter carry-over detected</p>
        </div>

        <div className="p-6 dark:bg-navy-800">
          <div className="mb-4">
            <div className="text-sm font-semibold text-navy-700 dark:text-navy-200 mb-3">Equipment: <span className="text-ocean-600 dark:text-ocean-400">{equipmentLabel}</span></div>

            <div className="bg-navy-50 dark:bg-navy-900 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-navy-500 dark:text-navy-400">Previous End:</span>
                <span className="font-mono font-bold text-navy-800 dark:text-white">{formatNumber(prevEnd)} m{'\u00B3'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-navy-500 dark:text-navy-400">Current Start:</span>
                <span className="font-mono font-bold text-gold-600 dark:text-gold-400">{formatNumber(currentStart)} m{'\u00B3'}</span>
              </div>
              <div className="border-t border-navy-200 dark:border-navy-700 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-navy-500 dark:text-navy-400">Difference:</span>
                  <span className="font-mono font-semibold text-red-500">{formatNumber(Math.abs(parseFloat(prevEnd) - parseFloat(currentStart)))} m{'\u00B3'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-200
                         font-medium hover:bg-navy-200 dark:hover:bg-navy-600 transition-colors"
            >
              Keep Current
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className="flex-1 px-4 py-2.5 rounded-xl font-medium transition-all btn-primary text-white"
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
