import { Icons } from '../Icons';
import ThemeToggle from '../ui/ThemeToggle';
import { APP_VERSION } from '../../utils/constants';

const Header = ({ saveStatus, directoryHandle, view, activeCruise, onSave, onShowSettings }) => {
  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving': return { text: 'Saving...', dotClass: 'disconnected', badgeClass: 'bg-[#FFFBEB] text-[var(--color-hfo)] border border-[var(--color-hfo-border)]' };
      case 'saved': return { text: 'Saved', dotClass: 'connected', badgeClass: 'bg-[#ECFDF5] text-[var(--color-mgo)] border border-[var(--color-mgo-border)]' };
      case 'error': return { text: 'Error', dotClass: 'error', badgeClass: 'bg-red-50 text-red-600 border border-red-200' };
      default: return directoryHandle
        ? { text: 'Connected', dotClass: 'connected', badgeClass: 'bg-[#ECFDF5] text-[var(--color-mgo)] border border-[var(--color-mgo-border)]' }
        : { text: 'No folder', dotClass: 'disconnected', badgeClass: 'bg-[#FFFBEB] text-[var(--color-hfo)] border border-[var(--color-hfo-border)]' };
    }
  };

  const status = getSaveStatusDisplay();

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-navy-900 border-b-2 border-[var(--color-border-subtle)] dark:border-navy-700">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#1a1f2e]">
              <svg className="w-5 h-5" fill="none" stroke="#11878f" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <line x1="12" y1="7" x2="12" y2="19" />
                <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
                <line x1="5" y1="7" x2="19" y2="7" />
              </svg>
            </div>
            <div>
              <h1 className="text-[1.4rem] font-display font-extrabold tracking-tight text-[var(--color-text)] dark:text-white">Voyage Tracker</h1>
              <p className="text-[0.6rem] uppercase tracking-[1.5px] font-mono text-[var(--color-dim)] dark:text-navy-400">Engine Department &bull; v{APP_VERSION}</p>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className={`${status.badgeClass} px-3.5 py-1 rounded-full text-[0.65rem] font-semibold flex items-center gap-1.5 font-mono`}>
              <span className={`status-dot ${status.dotClass}`} style={{ width: 6, height: 6 }}></span>
              {status.text}
            </div>

            {view === 'edit' && activeCruise && (
              <>
                <button
                  onClick={onSave}
                  className="p-2.5 bg-ocean-500 hover:bg-ocean-600 text-white rounded-xl transition-colors shadow-lg shadow-ocean-500/25"
                  aria-label="Save Now (Ctrl+S)"
                >
                  <Icons.Save />
                </button>
                <button
                  onClick={onShowSettings}
                  className="p-2.5 bg-navy-100 dark:bg-navy-700 hover:bg-navy-200 dark:hover:bg-navy-600
                             text-navy-600 dark:text-navy-200 rounded-xl transition-colors"
                  aria-label="Density Settings"
                >
                  <Icons.Settings />
                </button>
              </>
            )}

            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
