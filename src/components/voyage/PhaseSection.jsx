import { Icons } from '../Icons';
import { calcConsumption } from '../../utils/calculations';
import { PHASE_TYPES } from '../../utils/constants';
import EquipmentRow from './EquipmentRow';

const PhaseSection = ({ phase, onChange, onDelete, canDelete, densities, collapsed, showTotals, cumulativeTotals }) => {
  const handleEquipmentChange = (key, value) => {
    onChange({ ...phase, equipment: { ...phase.equipment, [key]: value } });
  };

  const handleTitleChange = (e) => {
    onChange({ ...phase, name: e.target.value });
  };

  const handleRemarksChange = (e) => {
    onChange({ ...phase, remarks: e.target.value });
  };

  const totals = { HFO: 0, MGO: 0, LSFO: 0 };
  const engineTotals = { HFO: 0, MGO: 0, LSFO: 0 };
  const boilerTotals = { HFO: 0, MGO: 0, LSFO: 0 };

  Object.entries(phase.equipment).forEach(([key, eq]) => {
    const cons = calcConsumption(eq.start, eq.end, eq.fuel, densities);
    if (cons) {
      totals[eq.fuel] += parseFloat(cons);
      if (key.startsWith('dg')) {
        engineTotals[eq.fuel] += parseFloat(cons);
      } else if (key.startsWith('boiler')) {
        boilerTotals[eq.fuel] += parseFloat(cons);
      }
    }
  });

  const displayEngineTotals = cumulativeTotals ? cumulativeTotals.engineCumulative : engineTotals;
  const displayBoilerTotals = cumulativeTotals ? cumulativeTotals.boilerCumulative : boilerTotals;

  const getPhaseClass = () => {
    if (phase.type === PHASE_TYPES.STANDBY) return 'phase-standby';
    if (phase.type === PHASE_TYPES.SEA) return 'phase-sea';
    return 'phase-port';
  };

  const getPhaseIcon = () => {
    if (phase.type === PHASE_TYPES.STANDBY) return '\u2693';
    if (phase.type === PHASE_TYPES.SEA) return '\uD83C\uDF0A';
    return '\uD83C\uDFED';
  };

  const getPhaseLabel = () => {
    if (phase.type === PHASE_TYPES.STANDBY) return 'STANDBY';
    if (phase.type === PHASE_TYPES.SEA) return 'SEA';
    return 'PORT';
  };

  const engineTotal = displayEngineTotals.HFO + displayEngineTotals.MGO + displayEngineTotals.LSFO;
  const boilerTotal = displayBoilerTotals.HFO + displayBoilerTotals.MGO + displayBoilerTotals.LSFO;

  return (
    <div className="mb-4 phase-card glass-card rounded-xl overflow-hidden animate-fade-in">
      <div className={`${getPhaseClass()} text-white px-5 py-3 flex justify-between items-center`}>
        <div className="flex items-center gap-3 flex-1">
          <span className="text-lg">{getPhaseIcon()}</span>
          <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold tracking-wide">
            {getPhaseLabel()}
          </span>
          <input
            type="text"
            value={phase.name}
            onChange={handleTitleChange}
            placeholder="Enter phase name..."
            className="phase-title-input"
          />
        </div>
        <div className="flex items-center gap-3">
          {canDelete && (
            <button
              onClick={onDelete}
              className="text-white/70 hover:text-white hover:bg-black/20 p-1.5 rounded-lg transition-colors"
              title="Delete this phase"
            >
              <Icons.X />
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy-50/80 dark:bg-navy-800/50">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold text-navy-600 dark:text-navy-300 w-28">Equipment</th>
                  <th className="py-3 px-4 text-left font-semibold text-navy-600 dark:text-navy-300 w-24">Fuel</th>
                  <th className="py-3 px-4 text-left font-semibold text-navy-600 dark:text-navy-300 w-32">Start (m{'\u00B3'})</th>
                  <th className="py-3 px-4 text-left font-semibold text-navy-600 dark:text-navy-300 w-32">End (m{'\u00B3'})</th>
                  <th className="py-3 px-4 text-right font-semibold text-navy-600 dark:text-navy-300 w-24">Diff (m{'\u00B3'})</th>
                  <th className="py-3 px-4 text-right font-semibold text-navy-600 dark:text-navy-300 w-24">MT</th>
                </tr>
              </thead>
              <tbody className="bg-white/50 dark:bg-navy-900/30">
                <EquipmentRow label="DG 1-2" equipmentKey="dg12" data={phase.equipment.dg12} onChange={(v) => handleEquipmentChange('dg12', v)} densities={densities} />
                <EquipmentRow label="DG 4" equipmentKey="dg4" data={phase.equipment.dg4} onChange={(v) => handleEquipmentChange('dg4', v)} densities={densities} />
                <EquipmentRow label="DG 3" equipmentKey="dg3" data={phase.equipment.dg3} onChange={(v) => handleEquipmentChange('dg3', v)} allowedFuels={['MGO', 'LSFO']} densities={densities} />
                <EquipmentRow label="Boiler 1" equipmentKey="boiler1" data={phase.equipment.boiler1} onChange={(v) => handleEquipmentChange('boiler1', v)} disabled={true} densities={densities} />
                <EquipmentRow label="Boiler 2" equipmentKey="boiler2" data={phase.equipment.boiler2} onChange={(v) => handleEquipmentChange('boiler2', v)} disabled={true} densities={densities} />
              </tbody>
            </table>
          </div>

          {showTotals && (
            <div className="p-4 bg-gradient-to-r from-ocean-50/50 to-transparent dark:from-ocean-900/20 dark:to-transparent border-t border-ocean-100 dark:border-ocean-800/30">
              <div className={`grid gap-4 ${phase.type !== PHASE_TYPES.STANDBY ? 'grid-cols-4' : 'grid-cols-2 max-w-xl'}`}>
                <div className="bg-white dark:bg-navy-800 rounded-xl p-4 border border-navy-100 dark:border-navy-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="font-bold text-navy-800 dark:text-white mb-3 text-sm border-b border-navy-100 dark:border-navy-700 pb-2 flex items-center gap-2">
                    <span className="text-base">{'\u2699\uFE0F'}</span>
                    <span>Engine Totals</span>
                    {cumulativeTotals && <span className="text-xs text-ocean-500 font-normal">(Cumulative)</span>}
                  </div>
                  <div className="space-y-1.5">
                    {displayEngineTotals.HFO > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-navy-500 dark:text-navy-400 text-sm">HFO:</span>
                        <span className="font-mono font-bold text-navy-800 dark:text-white">{displayEngineTotals.HFO.toFixed(2)} MT</span>
                      </div>
                    )}
                    {displayEngineTotals.MGO > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-navy-500 dark:text-navy-400 text-sm">MGO:</span>
                        <span className="font-mono font-bold text-navy-800 dark:text-white">{displayEngineTotals.MGO.toFixed(2)} MT</span>
                      </div>
                    )}
                    {displayEngineTotals.LSFO > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-navy-500 dark:text-navy-400 text-sm">LSFO:</span>
                        <span className="font-mono font-bold text-navy-800 dark:text-white">{displayEngineTotals.LSFO.toFixed(2)} MT</span>
                      </div>
                    )}
                    {engineTotal === 0 && (
                      <div className="text-navy-400 dark:text-navy-500 text-sm italic">No consumption</div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-navy-800 rounded-xl p-4 border border-navy-100 dark:border-navy-700 shadow-sm hover:shadow-md transition-shadow">
                  <div className="font-bold text-navy-800 dark:text-white mb-3 text-sm border-b border-navy-100 dark:border-navy-700 pb-2 flex items-center gap-2">
                    <span className="text-base">{'\uD83D\uDD25'}</span>
                    <span>Boiler Totals</span>
                    {cumulativeTotals && <span className="text-xs text-ocean-500 font-normal">(Cumulative)</span>}
                  </div>
                  <div className="space-y-1.5">
                    {displayBoilerTotals.HFO > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-navy-500 dark:text-navy-400 text-sm">HFO:</span>
                        <span className="font-mono font-bold text-navy-800 dark:text-white">{displayBoilerTotals.HFO.toFixed(2)} MT</span>
                      </div>
                    )}
                    {displayBoilerTotals.MGO > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-navy-500 dark:text-navy-400 text-sm">MGO:</span>
                        <span className="font-mono font-bold text-navy-800 dark:text-white">{displayBoilerTotals.MGO.toFixed(2)} MT</span>
                      </div>
                    )}
                    {displayBoilerTotals.LSFO > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-navy-500 dark:text-navy-400 text-sm">LSFO:</span>
                        <span className="font-mono font-bold text-navy-800 dark:text-white">{displayBoilerTotals.LSFO.toFixed(2)} MT</span>
                      </div>
                    )}
                    {boilerTotal === 0 && (
                      <div className="text-navy-400 dark:text-navy-500 text-sm italic">No consumption</div>
                    )}
                  </div>
                </div>

                {phase.type !== PHASE_TYPES.STANDBY && (
                  <div className="col-span-2 bg-white dark:bg-navy-800 rounded-xl p-4 border border-navy-100 dark:border-navy-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="font-bold text-navy-800 dark:text-white mb-3 text-sm border-b border-navy-100 dark:border-navy-700 pb-2 flex items-center gap-2">
                      <span className="text-base">{'\uD83D\uDCDD'}</span>
                      <span>Remarks</span>
                    </div>
                    <textarea
                      value={phase.remarks || ''}
                      onChange={handleRemarksChange}
                      placeholder="Enter remarks..."
                      rows="3"
                      className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-600
                                 rounded-lg text-sm input-field resize-none"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PhaseSection;
