import { useState } from 'react';
import { Icons } from '../Icons';
import { useToast } from '../../hooks/useToast';
import { calcConsumption } from '../../utils/calculations';
import { PHASE_TYPES } from '../../utils/constants';
import { createPhase } from '../../utils/factories';
import PhaseSection from './PhaseSection';

const ReportForm = ({ report, onChange, densities, legIndex, reportType, onPhaseEnd }) => {
  const [collapsed, setCollapsed] = useState(false);
  const toast = useToast();

  const operationalPhases = report.phases.filter(p => p.type !== PHASE_TYPES.STANDBY);
  const standbyPhase = report.phases.find(p => p.type === PHASE_TYPES.STANDBY);

  const handlePhaseChange = (phaseId, newPhase, phaseIndex) => {
    const newPhases = report.phases.map(p => p.id === phaseId ? newPhase : p);
    onChange({ ...report, phases: newPhases });
    if (onPhaseEnd && phaseIndex !== undefined) {
      onPhaseEnd(legIndex, reportType, phaseIndex, newPhase.name, newPhase.equipment);
    }
  };

  const handleAddPhase = () => {
    const phaseType = report.type === 'departure' ? PHASE_TYPES.PORT : PHASE_TYPES.SEA;
    const defaultName = 'C/O (From \u2192 To)';
    const newPhase = createPhase(phaseType, defaultName);

    const newPhases = [...operationalPhases, newPhase];
    if (standbyPhase) {
      newPhases.push(standbyPhase);
    }
    onChange({ ...report, phases: newPhases });
    toast.addToast('New phase added', 'success');
  };

  const handleDeletePhase = (phaseId) => {
    const newPhases = report.phases.filter(p => p.id !== phaseId);
    onChange({ ...report, phases: newPhases });
  };

  const grandTotals = { HFO: 0, MGO: 0, LSFO: 0 };
  report.phases.forEach((phase) => {
    Object.values(phase.equipment).forEach(eq => {
      const cons = calcConsumption(eq.start, eq.end, eq.fuel, densities);
      if (cons) grandTotals[eq.fuel] += parseFloat(cons);
    });
  });

  const calculateCumulativeTotals = () => {
    const cumulative = { HFO: 0, MGO: 0, LSFO: 0 };
    const engineCumulative = { HFO: 0, MGO: 0, LSFO: 0 };
    const boilerCumulative = { HFO: 0, MGO: 0, LSFO: 0 };

    operationalPhases.forEach((phase) => {
      Object.entries(phase.equipment).forEach(([key, eq]) => {
        const cons = calcConsumption(eq.start, eq.end, eq.fuel, densities);
        if (cons) {
          cumulative[eq.fuel] += parseFloat(cons);
          if (key.startsWith('dg')) {
            engineCumulative[eq.fuel] += parseFloat(cons);
          } else if (key.startsWith('boiler')) {
            boilerCumulative[eq.fuel] += parseFloat(cons);
          }
        }
      });
    });

    return { cumulative, engineCumulative, boilerCumulative };
  };

  const totalConsumption = grandTotals.HFO + grandTotals.MGO + grandTotals.LSFO;
  const isDeparture = report.type === 'departure';

  return (
    <>
      <div className="glass-card rounded-xl overflow-hidden mb-5 animate-slide-up">
        <div
          className="report-head px-5 py-3.5 cursor-pointer flex justify-between items-center hover:bg-[var(--color-surface2)] dark:hover:bg-navy-800/70 transition-all"
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex items-center gap-3">
            <span className={`transition-transform duration-300 text-[var(--color-faint)] ${collapsed ? '' : 'rotate-90'}`}>
              <Icons.ChevronRight />
            </span>
            <div>
              <h3 className="text-[0.88rem] font-bold text-[var(--color-text)] dark:text-white flex items-center gap-2">
                <span className={isDeparture ? 'text-blue-500' : 'text-emerald-500'}>
                  {isDeparture ? '\uD83D\uDEA2' : '\u2693'}
                </span>
                <span>{isDeparture ? 'Departure' : 'Arrival'}</span>
                <span className="text-[var(--color-faint)]">{'\u2013'}</span>
                <span>{report.port || 'No port'}</span>
              </h3>
              {collapsed && (
                <p className="text-[0.65rem] text-[var(--color-dim)] mt-0.5 font-mono">
                  {report.date || 'No date'} {'\u2022'} {report.phases.length} phases
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="total-pill mono">{totalConsumption.toFixed(2)} MT</span>
          </div>
        </div>

        {!collapsed && (
          <div className="p-5 dark:bg-navy-900/20">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div>
                <label className="form-label">Date</label>
                <input type="date" value={report.date}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onChange({ ...report, date: e.target.value })}
                  className="form-input font-mono" />
              </div>
              <div>
                <label className="form-label">Port</label>
                <input type="text" value={report.port}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onChange({ ...report, port: e.target.value })}
                  className="form-input" placeholder="Singapore" />
              </div>
              <div>
                <label className="form-label">Engineer</label>
                <input type="text" value={report.engineer}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onChange({ ...report, engineer: e.target.value })}
                  className="form-input" />
              </div>
              {isDeparture ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="form-label">SBE</label>
                    <input type="time" value={report.timeEvents.sbe} step="360"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onChange({ ...report, timeEvents: { ...report.timeEvents, sbe: e.target.value }})}
                      className="form-input font-mono" />
                  </div>
                  <div>
                    <label className="form-label">FA</label>
                    <input type="time" value={report.timeEvents.fa} step="360"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onChange({ ...report, timeEvents: { ...report.timeEvents, fa: e.target.value }})}
                      className="form-input font-mono" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="form-label">SBE</label>
                    <input type="time" value={report.timeEvents.sbe} step="360"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onChange({ ...report, timeEvents: { ...report.timeEvents, sbe: e.target.value }})}
                      className="form-input font-mono" />
                  </div>
                  <div>
                    <label className="form-label">FWE</label>
                    <input type="time" value={report.timeEvents.fwe} step="360"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onChange({ ...report, timeEvents: { ...report.timeEvents, fwe: e.target.value }})}
                      className="form-input font-mono" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="section-label">
                {isDeparture ? '\u25B8 Port / Changeover Phases' : '\u25B8 Sea / Changeover Phases'}
              </span>
              <div className="flex-1 border-t border-[var(--color-border-subtle)] dark:border-white/10"></div>
            </div>

            {operationalPhases.map((phase, index) => {
              const isLastOperationalPhase = index === operationalPhases.length - 1;
              const hasMultiplePhases = operationalPhases.length > 1;
              const cumulativeTotals = (isLastOperationalPhase && hasMultiplePhases) ? calculateCumulativeTotals() : null;

              return (
                <PhaseSection
                  key={phase.id}
                  phase={phase}
                  onChange={(p) => handlePhaseChange(phase.id, p, index)}
                  onDelete={() => handleDeletePhase(phase.id)}
                  canDelete={operationalPhases.length > 1}
                  densities={densities}
                  collapsed={false}
                  showTotals={isLastOperationalPhase}
                  cumulativeTotals={cumulativeTotals}
                />
              );
            })}

            <button
              onClick={handleAddPhase}
              className="w-full py-2.5 border-2 border-dashed border-[var(--color-border-subtle)] hover:border-[var(--color-ocean-500)]
                         hover:bg-[var(--color-surface2)] rounded-lg text-[var(--color-dim)] hover:text-[var(--color-ocean-500)]
                         font-semibold text-[0.72rem] mb-5 transition-all flex items-center justify-center gap-2"
            >
              <Icons.Plus /> Add Fuel Changeover Phase
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="section-label">{'\u25B8'} Stand By (Maneuvering)</span>
              <div className="flex-1 border-t border-[var(--color-border-subtle)] dark:border-white/10"></div>
            </div>

            {standbyPhase && (
              <PhaseSection
                key={standbyPhase.id}
                phase={standbyPhase}
                onChange={(p) => handlePhaseChange(standbyPhase.id, p, report.phases.length - 1)}
                onDelete={() => {}}
                canDelete={false}
                densities={densities}
                collapsed={false}
                showTotals={true}
                cumulativeTotals={null}
              />
            )}

            <div className="cat-card fuel" style={{ gridColumn: 'unset' }}>
              <div className="cat-label">{isDeparture ? '\uD83D\uDEA2' : '\u2693'} {isDeparture ? 'Departure' : 'Arrival'} Totals (MT)</div>
              <div className="cat-body">
                <div className="fuel-cols" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                  <div className="fuel-col hfo">
                    <div className="fc-type"><span className="fc-dot"></span>HFO</div>
                    <div className="fc-big mono">{grandTotals.HFO.toFixed(2)}</div>
                  </div>
                  <div className="fuel-col mgo">
                    <div className="fc-type"><span className="fc-dot"></span>MGO</div>
                    <div className="fc-big mono">{grandTotals.MGO.toFixed(2)}</div>
                  </div>
                  <div className="fuel-col lsfo">
                    <div className="fc-type"><span className="fc-dot"></span>LSFO</div>
                    <div className="fc-big mono">{grandTotals.LSFO.toFixed(2)}</div>
                  </div>
                  <div className="fuel-col" style={{ textAlign: 'center' }}>
                    <div className="fc-type" style={{ color: 'var(--color-text)' }}>{'\u03A3'} Total</div>
                    <div className="fc-big mono" style={{ color: 'var(--color-text)' }}>{totalConsumption.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>

            {isDeparture && (
              <div className="grid grid-cols-2 gap-4 mt-5 max-w-xl">
                <div className="cat-card fuel" style={{ gridColumn: 'unset' }}>
                  <div className="cat-label">Fuel R.O.B. (MT)</div>
                  <div className="cat-body space-y-2">
                    {['hfo', 'mgo', 'lsfo'].map(fuel => (
                      <div key={fuel} className="flex items-center gap-3">
                        <label className="w-10 form-label mb-0 flex-shrink-0">{fuel}</label>
                        <input type="number" step="0.01" value={report.rob[fuel]}
                          onChange={(e) => onChange({ ...report, rob: { ...report.rob, [fuel]: e.target.value }})}
                          className="flex-1 min-w-0 form-input font-mono text-[0.78rem]" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="cat-card fuel" style={{ gridColumn: 'unset' }}>
                  <div className="cat-label">Fuel Bunkered (MT)</div>
                  <div className="cat-body space-y-2">
                    {['hfo', 'mgo', 'lsfo'].map(fuel => (
                      <div key={fuel} className="flex items-center gap-3">
                        <label className="w-10 form-label mb-0 flex-shrink-0">{fuel}</label>
                        <input type="number" step="0.01" value={report.bunkered[fuel]}
                          onChange={(e) => onChange({ ...report, bunkered: { ...report.bunkered, [fuel]: e.target.value }})}
                          className="flex-1 min-w-0 form-input font-mono text-[0.78rem]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!isDeparture && (
              <div className="grid grid-cols-3 gap-4 mt-5">
                <div className="cat-card fuel" style={{ gridColumn: 'unset' }}>
                  <div className="cat-label">R.O.B. (MT)</div>
                  <div className="cat-body space-y-2">
                    {['hfo', 'mgo', 'lsfo'].map(fuel => (
                      <div key={fuel} className="flex items-center gap-3">
                        <label className="w-10 form-label mb-0 flex-shrink-0">{fuel}</label>
                        <input type="number" step="0.01" value={report.rob[fuel]}
                          onChange={(e) => onChange({ ...report, rob: { ...report.rob, [fuel]: e.target.value }})}
                          className="flex-1 min-w-0 form-input font-mono text-[0.78rem]" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="cat-card water">
                  <div className="cat-label">Fresh Water (MT)</div>
                  <div className="cat-body space-y-2">
                    {[['rob', 'R.O.B.'], ['bunkered', 'Bunk.'], ['production', 'Prod.'], ['consumption', 'Cons.']].map(([key, label]) => (
                      <div key={key} className="flex items-center gap-3">
                        <label className="w-10 form-label mb-0 flex-shrink-0">{label}</label>
                        <input type="number" step="0.1" value={report.freshWater[key]}
                          onChange={(e) => onChange({ ...report, freshWater: { ...report.freshWater, [key]: e.target.value }})}
                          className="flex-1 min-w-0 form-input font-mono text-[0.78rem]" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="cat-card chem">
                  <div className="cat-label">AEP / Alkali</div>
                  <div className="cat-body space-y-2">
                    <div>
                      <label className="form-label">Open Loop (hh:mm)</label>
                      <input type="text" value={report.aep.openLoopHrs} placeholder="00:00"
                        onChange={(e) => onChange({ ...report, aep: { ...report.aep, openLoopHrs: e.target.value }})}
                        className="form-input font-mono text-[0.72rem]" />
                    </div>
                    <div>
                      <label className="form-label">Closed Loop (hh:mm)</label>
                      <input type="text" value={report.aep.closedLoopHrs} placeholder="00:00"
                        onChange={(e) => onChange({ ...report, aep: { ...report.aep, closedLoopHrs: e.target.value }})}
                        className="form-input font-mono text-[0.72rem]" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="form-label">NaOH Cons (L)</label>
                        <input type="number" step="0.1" value={report.aep.alkaliCons}
                          onChange={(e) => onChange({ ...report, aep: { ...report.aep, alkaliCons: e.target.value }})}
                          className="form-input font-mono text-[0.72rem]" />
                      </div>
                      <div>
                        <label className="form-label">NaOH ROB (L)</label>
                        <input type="number" step="0.1" value={report.aep.alkaliRob}
                          onChange={(e) => onChange({ ...report, aep: { ...report.aep, alkaliRob: e.target.value }})}
                          className="form-input font-mono text-[0.72rem]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ReportForm;
