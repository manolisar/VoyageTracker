const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', danger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-md animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="p-6 dark:bg-navy-800">
          <h3 className="text-[1rem] font-bold text-[var(--color-text)] dark:text-white mb-2">{title}</h3>
          <p className="text-[0.82rem] text-[var(--color-dim)] dark:text-navy-300 mb-6">{message}</p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg btn-flat font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all
                ${danger
                  ? 'btn-danger'
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
