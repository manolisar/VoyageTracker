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
        className="mb-4 text-[var(--color-dim)] hover:text-[var(--color-text)] dark:hover:text-white
                   font-semibold text-[0.78rem] flex items-center gap-1 transition-colors"
      >
        {'\u2190'} Back to Voyages
      </button>

      {/* Cruise Info Card */}
      <div className="glass-card rounded-xl p-5 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="form-label">Cruise Name</label>
            <input type="text" value={activeCruise.name}
              onChange={(e) => updateCruise({ ...activeCruise, name: e.target.value })}
              className="form-input font-medium font-mono"
              placeholder="Singapore to Hong Kong" />
          </div>
          <div>
            <label className="form-label">Vessel</label>
            <input type="text" value={activeCruise.vessel}
              onChange={(e) => updateCruise({ ...activeCruise, vessel: e.target.value })}
              className="form-input" />
          </div>
          <div>
            <label className="form-label">Start Date</label>
            <input type="date" value={activeCruise.startDate}
              onChange={(e) => updateCruise({ ...activeCruise, startDate: e.target.value })}
              className="form-input" />
          </div>
          <div>
            <label className="form-label">End Date</label>
            <input type="date" value={activeCruise.endDate}
              onChange={(e) => updateCruise({ ...activeCruise, endDate: e.target.value })}
              className="form-input" />
          </div>
        </div>
        <div className="mt-3 text-[0.55rem] text-[var(--color-faint)] font-mono flex items-center gap-2">
          <Icons.Save /> Saving to: {activeFilename}
        </div>
      </div>

      <CruiseSummary cruise={activeCruise} densities={densities} />

      {/* Notes shown if voyage completed and has notes */}
      {activeCruise.voyageEnd?.notes && (
        <div className="glass-card rounded-xl px-5 py-3 mb-6 border-l-4 border-l-[var(--color-mgo-band)]">
          <span className="text-[0.55rem] font-bold uppercase tracking-[1px] text-[var(--color-faint)]">Notes:</span>
          <span className="text-[0.78rem] text-[var(--color-dim)] dark:text-navy-400 ml-2">{activeCruise.voyageEnd.notes}</span>
        </div>
      )}

      {/* Legs Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="section-label">{'\u25B8'} Voyage Legs</span>
        <div className="flex gap-2">
          <button
            onClick={() => setAllLegsCollapsed(!allLegsCollapsed)}
            className="px-3 py-1.5 btn-flat rounded-lg text-[0.7rem] flex items-center gap-1.5"
          >
            {allLegsCollapsed ? <><Icons.ChevronDown /> Expand</> : <><Icons.ChevronRight /> Collapse</>}
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
                className="px-3 py-1.5 btn-warning rounded-lg text-[0.7rem] flex items-center gap-1.5"
                title="Clear voyage end data and reopen for editing"
              >
                <Icons.Edit /> Reopen
              </button>
              <button
                onClick={() => setShowVoyageEndModal(true)}
                className="px-3 py-1.5 btn-success rounded-lg text-[0.7rem] flex items-center gap-1.5"
              >
                <Icons.Flag /> Edit End
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowVoyageEndModal(true)}
              className="px-3 py-1.5 btn-flat rounded-lg text-[0.7rem] flex items-center gap-1.5 border-[var(--color-lsfo-border)] text-[var(--color-lsfo)] dark:text-[var(--color-lsfo-band)]"
            >
              <Icons.Flag /> End Voyage
            </button>
          )}
          <button
            onClick={addLeg}
            className="px-3 py-1.5 btn-primary text-white rounded-lg text-[0.7rem] font-semibold flex items-center gap-1.5"
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
        <div className="glass-card rounded-xl py-12 text-center">
          <div className="text-4xl mb-3">{'\uD83D\uDEA2'}</div>
          <p className="text-[0.78rem] text-[var(--color-dim)]">No legs yet. Click &quot;Add Leg&quot; to add voyage data.</p>
        </div>
      )}
    </div>
  );
};

export default VoyageEditor;
