import { Icons } from '../Icons';
import { useToast } from '../../hooks/useToast';
import CruiseSummary from './CruiseSummary';
import LegSection from './LegSection';

const VoyageEditor = ({
  activeCruise,
  densities,
  activeFilename,
  allLegsCollapsed,
  setAllLegsCollapsed,
  updateCruise,
  addLeg,
  updateLeg,
  deleteLeg,
  setView,
  setActiveFilename,
  setShowVoyageEndModal,
  trackPhaseEnd,
}) => {
  const toast = useToast();

  if (!activeCruise) return null;

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => { setView('list'); setActiveFilename(null); }}
        className="mb-4 text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300
                   font-semibold text-sm flex items-center gap-1 transition-colors"
      >
        {'\u2190'} Back to Voyages
      </button>

      {/* Cruise Info Card */}
      <div className="glass-card rounded-2xl p-5 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">
              Cruise Name
            </label>
            <input type="text" value={activeCruise.name}
              onChange={(e) => updateCruise({ ...activeCruise, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600
                         rounded-xl text-sm input-field font-medium"
              placeholder="Singapore to Hong Kong" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">
              Vessel
            </label>
            <input type="text" value={activeCruise.vessel}
              onChange={(e) => updateCruise({ ...activeCruise, vessel: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600
                         rounded-xl text-sm input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">
              Start Date
            </label>
            <input type="date" value={activeCruise.startDate}
              onChange={(e) => updateCruise({ ...activeCruise, startDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600
                         rounded-xl text-sm input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">
              End Date
            </label>
            <input type="date" value={activeCruise.endDate}
              onChange={(e) => updateCruise({ ...activeCruise, endDate: e.target.value })}
              className="w-full px-4 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600
                         rounded-xl text-sm input-field" />
          </div>
        </div>
        <div className="mt-3 text-xs text-navy-400 dark:text-navy-500 font-mono flex items-center gap-2">
          <Icons.Save /> Saving to: {activeFilename}
        </div>
      </div>

      <CruiseSummary cruise={activeCruise} densities={densities} />

      {/* Notes shown if voyage completed and has notes */}
      {activeCruise.voyageEnd?.notes && (
        <div className="glass-card rounded-xl px-5 py-3 mb-6 bg-gradient-to-r from-green-50/50 to-emerald-50/50
                        dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200/50 dark:border-green-800/30">
          <span className="text-sm font-semibold text-navy-600 dark:text-navy-300">Notes:</span>
          <span className="text-sm text-navy-600 dark:text-navy-400 ml-2">{activeCruise.voyageEnd.notes}</span>
        </div>
      )}

      {/* Legs Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-display font-bold text-navy-800 dark:text-white">Voyage Legs</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setAllLegsCollapsed(!allLegsCollapsed)}
            className="px-4 py-2 bg-navy-100 dark:bg-navy-700 hover:bg-navy-200 dark:hover:bg-navy-600
                       text-navy-600 dark:text-navy-200 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
          >
            {allLegsCollapsed ? <><Icons.ChevronDown /> Expand All</> : <><Icons.ChevronRight /> Collapse All</>}
          </button>
          {activeCruise.voyageEnd ? (
            <>
              <button
                onClick={() => {
                  if (confirm('Reopen this voyage for editing? This will clear the voyage end data.')) {
                    updateCruise({ ...activeCruise, voyageEnd: null });
                    toast.addToast('Voyage reopened for editing', 'success');
                  }
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center gap-2"
                title="Clear voyage end data and reopen for editing"
              >
                <Icons.Edit /> Reopen Voyage
              </button>
              <button
                onClick={() => setShowVoyageEndModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
              >
                <Icons.Flag /> Edit Voyage End
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowVoyageEndModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
            >
              <Icons.Flag /> End Voyage
            </button>
          )}
          <button
            onClick={addLeg}
            className="px-4 py-2 btn-primary text-white rounded-xl font-semibold text-sm flex items-center gap-2"
          >
            <Icons.Plus /> Add Leg
          </button>
        </div>
      </div>

      {activeCruise.legs.map((leg, idx) => (
        <LegSection
          key={leg.id}
          leg={leg}
          legIndex={idx}
          onChange={(newLeg) => updateLeg(idx, newLeg)}
          onDelete={() => deleteLeg(idx)}
          densities={densities}
          externalCollapsed={allLegsCollapsed}
          onPhaseEnd={trackPhaseEnd}
        />
      ))}

      {activeCruise.legs.length === 0 && (
        <div className="glass-card rounded-2xl py-12 text-center">
          <div className="text-5xl mb-4">{'\uD83D\uDEA2'}</div>
          <p className="text-navy-500 dark:text-navy-400">No legs yet. Click &quot;Add Leg&quot; to add voyage data.</p>
        </div>
      )}
    </div>
  );
};

export default VoyageEditor;
