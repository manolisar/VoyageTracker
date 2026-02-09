import { Icons } from '../Icons';
import { calcCruiseTotal } from '../../utils/calculations';

const VoyageList = ({ voyages, directoryHandle, onLoadDirectory, onCreateNew, onOpenVoyage }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-display font-bold text-navy-800 dark:text-white">Voyage Files</h2>
        <div className="flex gap-3">
          <button
            onClick={onLoadDirectory}
            className="px-5 py-2.5 bg-navy-100 dark:bg-navy-700 hover:bg-navy-200 dark:hover:bg-navy-600
                       text-navy-700 dark:text-navy-200 rounded-xl font-semibold flex items-center gap-2 transition-colors"
          >
            <Icons.Folder /> Select Folder
          </button>
          <button
            onClick={onCreateNew}
            className="px-5 py-2.5 btn-primary text-white rounded-xl font-semibold flex items-center gap-2"
          >
            <Icons.Plus /> New Voyage
          </button>
        </div>
      </div>

      {!directoryHandle && voyages.length === 0 ? (
        <div className="glass-card rounded-2xl py-16 text-center">
          <div className="text-6xl mb-6">{'\uD83D\uDCC2'}</div>
          <p className="text-xl font-display font-semibold text-navy-700 dark:text-navy-200 mb-2">
            No folder selected
          </p>
          <p className="text-navy-500 dark:text-navy-400">
            Use <span className="font-semibold text-ocean-600 dark:text-ocean-400">&quot;Select Folder&quot;</span> above to open your voyage folder,<br/>
            or click <span className="font-semibold text-ocean-600 dark:text-ocean-400">&quot;New Voyage&quot;</span> to start fresh
          </p>
        </div>
      ) : voyages.length === 0 ? (
        <div className="glass-card rounded-2xl py-16 text-center">
          <div className="text-6xl mb-6">{'\uD83D\uDEA2'}</div>
          <p className="text-xl font-display font-semibold text-navy-700 dark:text-navy-200 mb-2">
            No voyage files found
          </p>
          <p className="text-navy-500 dark:text-navy-400">
            Click &quot;New Voyage&quot; to create your first voyage
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {voyages.map((voyage, index) => (
            <div
              key={voyage.id}
              className="voyage-card glass-card rounded-2xl p-5 flex justify-between items-center hover:shadow-xl
                         transition-all cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => onOpenVoyage(voyage)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-xl
                                flex items-center justify-center text-white text-xl shadow-lg shadow-ocean-500/25">
                  {'\uD83D\uDEA2'}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-navy-800 dark:text-white flex items-center gap-2">
                    {voyage.name || 'Unnamed Voyage'}
                    {voyage.voyageEnd && (
                      <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                        {'\u2713'} Completed
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-navy-500 dark:text-navy-400">
                    {voyage.startDate || 'No date'} &bull; {voyage.vessel} &bull; {voyage.legs.length} legs &bull; {calcCruiseTotal(voyage).toFixed(1)} MT
                  </p>
                  <p className="text-xs text-navy-400 dark:text-navy-500 mt-1 font-mono">
                    {'\uD83D\uDCC2'} {voyage.filename}
                  </p>
                </div>
              </div>
              <div className="text-ocean-500 group-hover:translate-x-1 transition-transform">
                <Icons.ArrowRight />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VoyageList;
