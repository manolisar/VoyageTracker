import { useState, useEffect } from 'react';
import { Icons } from '../Icons';
import { useToast } from '../../hooks/useToast';
import { calcConsumption } from '../../utils/calculations';
import { PHASE_TYPES } from '../../utils/constants';
import ConfirmModal from '../modals/ConfirmModal';
import ReportForm from './ReportForm';

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

      <div className="glass-card rounded-2xl overflow-hidden mb-5 animate-slide-up" style={{ animationDelay: `${legIndex * 0.1}s` }}>
        <div
          className="px-5 py-4 cursor-pointer flex justify-between items-center bg-gradient-to-r from-navy-50 to-navy-100/50
                     dark:from-navy-800/50 dark:to-navy-900/30 hover:from-navy-100 hover:to-navy-100
                     dark:hover:from-navy-800 dark:hover:to-navy-800 transition-all"
          onClick={handleToggleCollapse}
        >
          <div className="flex items-center gap-4">
            <span className={`text-navy-400 dark:text-navy-500 transition-transform duration-300 ${collapsed ? '' : 'rotate-90'}`}>
              <Icons.ChevronRight />
            </span>
            <div>
              <h2 className="text-lg font-display font-bold text-navy-800 dark:text-white flex items-center gap-2">
                <span className="text-ocean-500">Leg {legIndex + 1}</span>
                <Icons.ArrowRight />
                <span>{depPort} {'\u2192'} {arrPort}</span>
              </h2>
              {collapsed && (
                <p className="text-sm text-navy-500 dark:text-navy-400">
                  HFO: {legTotalHFO.toFixed(2)} {'\u2022'} MGO: {legTotalMGO.toFixed(2)} {'\u2022'} LSFO: {legTotalLSFO.toFixed(2)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-ocean-500 to-ocean-600 text-white px-4 py-2 rounded-xl font-display font-bold shadow-lg shadow-ocean-500/25">
              {legTotal.toFixed(2)} MT
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
              className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Delete Leg"
            >
              <Icons.Trash />
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="p-5 dark:bg-navy-900/20">
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
