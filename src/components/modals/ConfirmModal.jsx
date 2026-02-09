const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-xl font-display font-bold text-navy-900 dark:text-white mb-2">{title}</h3>
          <p className="text-navy-600 dark:text-navy-300 mb-6">{message}</p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl bg-navy-100 dark:bg-navy-700 text-navy-700 dark:text-navy-200
                         font-medium hover:bg-navy-200 dark:hover:bg-navy-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 px-4 py-2.5 rounded-xl font-medium transition-all
                ${danger
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                  : 'btn-primary text-white'}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
