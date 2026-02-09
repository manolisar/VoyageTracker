import { Icons } from '../Icons';
import { calcConsumption } from '../../utils/calculations';
import { PHASE_TYPES } from '../../utils/constants';
import EquipmentRow from './EquipmentRow';

const FUEL_COLORS = {
  HFO: { dot: 'var(--color-hfo-band)', text: 'var(--color-hfo)' },
  MGO: { dot: 'var(--color-mgo-band)', text: 'var(--color-mgo)' },
  LSFO: { dot: 'var(--color-lsfo-band)', text: 'var(--color-lsfo)' },
};

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

  const getPhaseTagClass = () => {
    if (phase.type === PHASE_TYPES.STANDBY) return 'ph-tag ph-tag-standby';
    if (phase.type === PHASE_TYPES.SEA) return 'ph-tag ph-tag-sea';
    return 'ph-tag ph-tag-port';
  };

  const engineTotal = displayEngineTotals.HFO + displayEngineTotals.MGO + displayEngineTotals.LSFO;
  const boilerTotal = displayBoilerTotals.HFO + displayBoilerTotals.MGO + displayBoilerTotals.LSFO;
  const phaseGrandTotal = engineTotal + boilerTotal;
  const isStandby = phase.type === PHASE_TYPES.STANDBY;

  const renderFuelLines = (fuelTotals) => {
    const fuels = ['HFO', 'MGO', 'LSFO'];
    const lines = fuels.filter(f => fuelTotals[f] > 0);
    if (lines.length === 0) {
      return <div className="pt-noval">No consumption</div>;
    }
    return lines.map(f => (
      <div key={f} className="pt-line">
        <span className="pt-label">
          <span className="pt-dot" style={{ background: FUEL_COLORS[f].dot }}></span>
          {f}
        </span>
        <span className="pt-val mono" style={{ color: FUEL_COLORS[f].text }}>
          {fuelTotals[f].toFixed(2)} MT
        </span>
      </div>
    ));
  };

  return (
    <div className="mb-4 phase-card rounded-xl animate-fade-in" style={{ overflow: 'hidden' }}>
      <div className={`${getPhaseClass()} px-5 py-3 flex justify-between items-center`}>
        <div className="flex items-center gap-2.5 flex-1">
          <span className="text-base">{getPhaseIcon()}</span>
          <span className={getPhaseTagClass()}>
            {getPhaseLabel()}
          </span>
          <input
            type="text"
            value={phase.name}
            onChange={handleTitleChange}
            placeholder="Enter phase name..."
            className="phase-title-input"
          />
          {cumulativeTotals && <span className="text-[0.6rem] text-[var(--color-dim)] dark:text-navy-400 font-normal">(Cumulative)</span>}
        </div>
        <div className="flex items-center gap-3">
          {canDelete && (
            <button
              onClick={onDelete}
              className="text-[var(--color-faint)] hover:text-[var(--color-text)] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 p-1.5 rounded-lg transition-colors"
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
              <thead className="bg-[var(--color-surface2)] dark:bg-navy-800/50">
                <tr>
                  <th className="py-2.5 px-4 text-left text-[0.5rem] font-bold tracking-[1.2px] uppercase text-[var(--color-faint)] border-b border-[var(--color-border-subtle)] dark:border-navy-700 w-28">Equipment</th>
                  <th className="py-2.5 px-4 text-left text-[0.5rem] font-bold tracking-[1.2px] uppercase text-[var(--color-faint)] border-b border-[var(--color-border-subtle)] dark:border-navy-700 w-24">Fuel</th>
                  <th className="py-2.5 px-4 text-left text-[0.5rem] font-bold tracking-[1.2px] uppercase text-[var(--color-faint)] border-b border-[var(--color-border-subtle)] dark:border-navy-700 w-32 mono">Start (m{'\u00B3'})</th>
                  <th className="py-2.5 px-4 text-left text-[0.5rem] font-bold tracking-[1.2px] uppercase text-[var(--color-faint)] border-b border-[var(--color-border-subtle)] dark:border-navy-700 w-32 mono">End (m{'\u00B3'})</th>
                  <th className="py-2.5 px-4 text-right text-[0.5rem] font-bold tracking-[1.2px] uppercase text-[var(--color-faint)] border-b border-[var(--color-border-subtle)] dark:border-navy-700 w-24 mono">Diff</th>
                  <th className="py-2.5 px-4 text-right text-[0.5rem] font-bold tracking-[1.2px] uppercase text-[var(--color-faint)] border-b border-[var(--color-border-subtle)] dark:border-navy-700 w-24 mono">MT</th>
                </tr>
              </thead>
              <tbody>
                <EquipmentRow label="DG 1-2" equipmentKey="dg12" data={phase.equipment.dg12} onChange={(v) => handleEquipmentChange('dg12', v)} densities={densities} />
                <EquipmentRow label="DG 4" equipmentKey="dg4" data={phase.equipment.dg4} onChange={(v) => handleEquipmentChange('dg4', v)} densities={densities} />
                <EquipmentRow label="DG 3" equipmentKey="dg3" data={phase.equipment.dg3} onChange={(v) => handleEquipmentChange('dg3', v)} allowedFuels={['MGO', 'LSFO']} densities={densities} />
                <EquipmentRow label="Boiler 1" equipmentKey="boiler1" data={phase.equipment.boiler1} onChange={(v) => handleEquipmentChange('boiler1', v)} disabled={true} densities={densities} />
                <EquipmentRow label="Boiler 2" equipmentKey="boiler2" data={phase.equipment.boiler2} onChange={(v) => handleEquipmentChange('boiler2', v)} disabled={true} densities={densities} />
              </tbody>
            </table>
          </div>

          {showTotals && (
            <>
              <div className={`ptotals ${isStandby ? 'cols-2' : ''}`}>
                {/* Engine block */}
                <div className="pt-block">
                  <div className="pt-head">{'\u2699\uFE0F'} Engine</div>
                  {renderFuelLines(displayEngineTotals)}
                </div>

                {/* Boiler block */}
                <div className="pt-block">
                  <div className="pt-head">{'\uD83D\uDD25'} Boiler</div>
                  {renderFuelLines(displayBoilerTotals)}
                </div>

                {/* Phase Total block — only for non-standby */}
                {!isStandby && (
                  <div className="pt-block">
                    <div className="pt-head">{'\u03A3'} Phase Total</div>
                    {phaseGrandTotal > 0 ? (
                      <div className="pt-line">
                        <span className="pt-label">All</span>
                        <span className="pt-val mono">{phaseGrandTotal.toFixed(2)} MT</span>
                      </div>
                    ) : (
                      <div className="pt-noval">No consumption</div>
                    )}
                  </div>
                )}
              </div>

              {/* Remarks — below totals as simple italic row */}
              {!isStandby && (
                <div className="phase-remarks">
                  <textarea
                    value={phase.remarks || ''}
                    onChange={handleRemarksChange}
                    placeholder="Enter remarks..."
                    rows="2"
                    className="w-full bg-transparent border-none resize-none text-sm focus:outline-none placeholder:text-[var(--color-faint)]"
                    style={{ fontStyle: 'italic' }}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default PhaseSection;
