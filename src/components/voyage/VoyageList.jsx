import { Icons } from '../Icons';
import { calcCruiseTotal } from '../../utils/calculations';

const VoyageList = ({ voyages, directoryHandle, onLoadDirectory, onCreateNew, onOpenVoyage }) => {
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[0.9rem] font-bold text-[var(--color-text)] dark:text-white">Voyage Files</h2>
        <div className="flex gap-3">
          <button
            onClick={onLoadDirectory}
            className="px-4 py-2 btn-flat rounded-[10px] text-[0.78rem] flex items-center gap-2"
          >
            <Icons.Folder /> Select Folder
          </button>
          <button
            onClick={onCreateNew}
            className="px-4 py-2 btn-primary text-white rounded-[10px] text-[0.78rem] font-semibold flex items-center gap-2"
          >
            <Icons.Plus /> New Voyage
          </button>
        </div>
      </div>

      {!directoryHandle && voyages.length === 0 ? (
        <div className="glass-card rounded-xl py-16 text-center">
          <div className="text-5xl mb-5">{'\uD83D\uDCC2'}</div>
          <p className="text-[0.9rem] font-bold text-[var(--color-text)] dark:text-white mb-1.5">
            No folder selected
          </p>
          <p className="text-[0.78rem] text-[var(--color-dim)]">
            Use <span className="font-bold text-[var(--color-ocean-500)]">&quot;Select Folder&quot;</span> above to open your voyage folder,<br/>
            or click <span className="font-bold text-[var(--color-ocean-500)]">&quot;New Voyage&quot;</span> to start fresh
          </p>
        </div>
      ) : voyages.length === 0 ? (
        <div className="glass-card rounded-xl py-16 text-center">
          <div className="text-5xl mb-5">{'\uD83D\uDEA2'}</div>
          <p className="text-[0.9rem] font-bold text-[var(--color-text)] dark:text-white mb-1.5">
            No voyage files found
          </p>
          <p className="text-[0.78rem] text-[var(--color-dim)]">
            Click &quot;New Voyage&quot; to create your first voyage
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {voyages.map((voyage, index) => (
            <div
              key={voyage.id}
              className="voyage-card glass-card rounded-xl p-4 flex justify-between items-center
                         transition-all cursor-pointer group animate-slide-up"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => onOpenVoyage(voyage)}
            >
              <div className="flex items-center gap-3.5">
                <div className="voyage-card-icon">{'\uD83D\uDEA2'}</div>
                <div>
                  <h3 className="font-bold text-[0.88rem] text-[var(--color-text)] dark:text-white flex items-center gap-2">
                    {voyage.name || 'Unnamed Voyage'}
                    {voyage.voyageEnd && (
                      <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[0.55rem]">
                        {'\u2713'} Completed
                      </span>
                    )}
                  </h3>
                  <p className="text-[0.72rem] text-[var(--color-dim)]">
                    {voyage.startDate || 'No date'} &bull; {voyage.vessel} &bull; {voyage.legs.length} legs &bull; {calcCruiseTotal(voyage).toFixed(1)} MT
                  </p>
                  <p className="text-[0.6rem] text-[var(--color-faint)] mt-0.5 font-mono">
                    {'\uD83D\uDCC2'} {voyage.filename}
                  </p>
                </div>
              </div>
              <div className="text-[var(--color-faint)] group-hover:text-[var(--color-ocean-500)] group-hover:translate-x-1 transition-all">
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
