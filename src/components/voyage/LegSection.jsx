import { useState, useEffect } from 'react';
import { Icons } from '../Icons';
import { useToast } from '../../hooks/useToast';
import { calcConsumption } from '../../utils/calculations';
import { PHASE_TYPES } from '../../utils/constants';
import { defaultVoyageReport } from '../../utils/factories';
import ConfirmModal from '../modals/ConfirmModal';
import ReportForm from './ReportForm';
import VoyageReportSection from './VoyageReportSection';

const LegSection = ({ leg, onChange, onDelete, legIndex, densities, externalCollapsed, onPhaseEnd }) => {
  const [localOverride, setLocalOverride] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const toast = useToast();

  const depPort = leg.departure?.port || '?';
  const arrPort = leg.arrival?.port || '?';

  const collapsed = localOverride !== null ? localOverride : (externalCollapsed !== undefined ? externalCollapsed : false);

  // Simple departure change - no auto-fill, user uses manual Carry Over button
  const handleDepartureChange = (newDeparture) => {
    onChange({ ...leg, departure: newDeparture });
  };

  // Calculate leg totals
  let legTotalHFO = 0, legTotalMGO = 0, legTotalLSFO = 0;
  [leg.departure, leg.arrival].forEach(report => {
    if (!report) return;
    report.phases.forEach((phase) => {
      Object.values(phase.equipment).forEach(eq => {
        const cons = calcConsumption(eq.start, eq.end, eq.fuel, densities);
        if (cons) {
          if (eq.fuel === 'HFO') legTotalHFO += parseFloat(cons);
          else if (eq.fuel === 'MGO') legTotalMGO += parseFloat(cons);
          else legTotalLSFO += parseFloat(cons);
        }
      });
    });
  });

  const legTotal = legTotalHFO + legTotalMGO + legTotalLSFO;

  const handleToggleCollapse = () => {
    setLocalOverride(!collapsed);
  };

  useEffect(() => {
    if (externalCollapsed === undefined) {
      setLocalOverride(null);
    }
  }, [externalCollapsed]);

  return (
    <>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={onDelete}
        title="Delete Leg"
        message={`Are you sure you want to delete Leg ${legIndex + 1} (${depPort} \u2192 ${arrPort})? This action cannot be undone.`}
        confirmText="Delete Leg"
        danger={true}
      />

      <div className="glass-card rounded-xl overflow-hidden mb-5 animate-slide-up" style={{ animationDelay: `${legIndex * 0.1}s` }}>
        <div
          className="leg-head px-5 py-3.5 cursor-pointer flex justify-between items-center hover:bg-[var(--color-surface2)] dark:hover:bg-navy-800/70 transition-all"
          onClick={handleToggleCollapse}
        >
          <div className="flex items-center gap-3">
            <span className={`text-[var(--color-faint)] transition-transform duration-300 ${collapsed ? '' : 'rotate-90'}`}>
              <Icons.ChevronRight />
            </span>
            <div>
              <h2 className="text-[0.88rem] font-bold text-[var(--color-text)] dark:text-white flex items-center gap-2">
                <span className="text-[var(--color-ocean-500)]">Leg {legIndex + 1}</span>
                <span className="text-[var(--color-faint)]">{'\u2192'}</span>
                <span>{depPort} {'\u2192'} {arrPort}</span>
              </h2>
              {collapsed && (
                <p className="text-[0.65rem] text-[var(--color-dim)] mt-0.5 font-mono">
                  HFO: {legTotalHFO.toFixed(2)} {'\u2022'} MGO: {legTotalMGO.toFixed(2)} {'\u2022'} LSFO: {legTotalLSFO.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="total-pill mono">{legTotal.toFixed(2)} MT</span>
            <button
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
              className="p-1.5 text-[var(--color-faint)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete Leg"
            >
              <Icons.Trash />
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="p-5 dark:bg-navy-900/20">
            {leg.voyageReport ? (
              <VoyageReportSection
                voyageReport={leg.voyageReport}
                onChange={(vr) => onChange({ ...leg, voyageReport: vr })}
                onDelete={() => onChange({ ...leg, voyageReport: null })}
                depPort={leg.departure?.port || ''}
                arrPort={leg.arrival?.port || ''}
                depDate={leg.departure?.date || ''}
                arrDate={leg.arrival?.date || ''}
              />
            ) : (
              <button
                onClick={() => onChange({ ...leg, voyageReport: defaultVoyageReport() })}
                className="w-full py-2.5 border-2 border-dashed border-[var(--color-water-border)] hover:border-[var(--color-ocean-500)]
                           hover:bg-[var(--color-water-light)] dark:hover:bg-[rgba(2,132,199,0.08)] rounded-lg text-[var(--color-dim)] hover:text-[var(--color-ocean-500)]
                           font-semibold text-[0.72rem] mb-4 transition-all flex items-center justify-center gap-2"
              >
                <Icons.Compass /> Add Voyage Report
              </button>
            )}
            <ReportForm
              report={leg.departure}
              onChange={handleDepartureChange}
              densities={densities}
              legIndex={legIndex}
              reportType="departure"
              onPhaseEnd={onPhaseEnd}
            />
            <ReportForm
              report={leg.arrival}
              onChange={(r) => onChange({ ...leg, arrival: r })}
              densities={densities}
              legIndex={legIndex}
              reportType="arrival"
              onPhaseEnd={onPhaseEnd}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default LegSection;
