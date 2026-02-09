import { Icons } from '../Icons';
import ThemeToggle from '../ui/ThemeToggle';
import { APP_VERSION } from '../../utils/constants';

const Header = ({ saveStatus, directoryHandle, view, activeCruise, onSave, onShowSettings }) => {
  const getSaveStatusDisplay = () => {
    switch (saveStatus) {
      case 'saving': return { text: 'Saving...', class: 'bg-gold-500', dot: 'bg-gold-300' };
      case 'saved': return { text: 'Saved', class: 'bg-green-500', dot: 'bg-green-300 connected' };
      case 'error': return { text: 'Error', class: 'bg-red-500', dot: 'bg-red-300 error' };
      default: return directoryHandle
        ? { text: 'Connected', class: 'bg-navy-600 dark:bg-navy-700', dot: 'bg-green-400 connected' }
        : { text: 'No folder', class: 'bg-gold-500', dot: 'bg-gold-300 disconnected' };
    }
  };

  const status = getSaveStatusDisplay();

  return (
    <header className="glass sticky top-0 z-50 border-b border-navy-200/50 dark:border-navy-700/50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src={`${import.meta.env.BASE_URL}celebrity-x.svg`} alt="Celebrity Cruises" className="w-10 h-10" />
            <div>
              <h1 className="text-xl font-display font-bold text-navy-800 dark:text-white">Voyage Tracker</h1>
              <p className="text-xs text-navy-500 dark:text-navy-400">Engine Department &bull; v{APP_VERSION}</p>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className={`${status.class} text-white px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-2`}>
              <span className={`status-dot ${status.dot}`}></span>
              {status.text}
            </div>

            {view === 'edit' && activeCruise && (
              <>
                <button
                  onClick={onSave}
                  className="p-2.5 bg-ocean-500 hover:bg-ocean-600 text-white rounded-xl transition-colors shadow-lg shadow-ocean-500/25"
                  title="Save Now (Ctrl+S)"
                >
                  <Icons.Save />
                </button>
                <button
                  onClick={onShowSettings}
                  className="p-2.5 bg-navy-100 dark:bg-navy-700 hover:bg-navy-200 dark:hover:bg-navy-600
                             text-navy-600 dark:text-navy-200 rounded-xl transition-colors"
                  title="Density Settings"
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
