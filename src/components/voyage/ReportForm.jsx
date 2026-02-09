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
      <div className="glass-card rounded-2xl overflow-hidden mb-5 animate-slide-up">
        <div
          className={`px-5 py-4 cursor-pointer flex justify-between items-center transition-colors
            ${isDeparture
              ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20'
              : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/20'}`}
          onClick={() => setCollapsed(!collapsed)}
        >
          <div className="flex items-center gap-3">
            <span className={`text-2xl ${isDeparture ? 'text-blue-500' : 'text-emerald-500'}`}>
              {isDeparture ? '\uD83D\uDEA2' : '\u2693'}
            </span>
            <div>
              <h3 className="text-lg font-display font-bold text-navy-800 dark:text-white">
                {isDeparture ? 'Departure' : 'Arrival'} {'\u2013'} {report.port || 'No port'}
              </h3>
              <p className="text-sm text-navy-500 dark:text-navy-400">
                {report.date || 'No date'} {'\u2022'} {report.phases.length} phases
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-xl font-display font-bold text-white
              ${isDeparture
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600'}`}>
              {totalConsumption.toFixed(2)} MT
            </div>
            <span className={`text-navy-400 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`}>
              <Icons.ChevronDown />
            </span>
          </div>
        </div>

        {!collapsed && (
          <div className="p-5 dark:bg-navy-900/30">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">Date</label>
                <input type="date" value={report.date}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onChange({ ...report, date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600 rounded-xl text-sm input-field" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">Port</label>
                <input type="text" value={report.port}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onChange({ ...report, port: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600 rounded-xl text-sm input-field" placeholder="Singapore" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">Engineer</label>
                <input type="text" value={report.engineer}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => onChange({ ...report, engineer: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600 rounded-xl text-sm input-field" />
              </div>
              {isDeparture ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">SBE</label>
                    <input type="time" value={report.timeEvents.sbe} step="360"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onChange({ ...report, timeEvents: { ...report.timeEvents, sbe: e.target.value }})}
                      className="w-full px-3 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600 rounded-xl text-sm input-field font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">FA</label>
                    <input type="time" value={report.timeEvents.fa} step="360"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onChange({ ...report, timeEvents: { ...report.timeEvents, fa: e.target.value }})}
                      className="w-full px-3 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600 rounded-xl text-sm input-field font-mono" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">SBE</label>
                    <input type="time" value={report.timeEvents.sbe} step="360"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onChange({ ...report, timeEvents: { ...report.timeEvents, sbe: e.target.value }})}
                      className="w-full px-3 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600 rounded-xl text-sm input-field font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy-500 dark:text-navy-400 mb-1.5 uppercase tracking-wide">FWE</label>
                    <input type="time" value={report.timeEvents.fwe} step="360"
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => onChange({ ...report, timeEvents: { ...report.timeEvents, fwe: e.target.value }})}
                      className="w-full px-3 py-2.5 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600 rounded-xl text-sm input-field font-mono" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-navy-600 dark:text-navy-300">
                {isDeparture ? '\uD83C\uDFED Port / Changeover Phases' : '\uD83C\uDF0A Sea / Changeover Phases'}
              </span>
              <div className="flex-1 border-t border-navy-200 dark:border-navy-700"></div>
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
              className="w-full py-3 border-2 border-dashed border-ocean-300 dark:border-ocean-700 hover:border-ocean-500 dark:hover:border-ocean-500
                         hover:bg-ocean-50 dark:hover:bg-ocean-900/20 rounded-xl text-ocean-500 hover:text-ocean-600
                         font-semibold text-sm mb-5 transition-all flex items-center justify-center gap-2"
            >
              <Icons.Plus /> Add Fuel Changeover Phase
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-semibold text-navy-600 dark:text-navy-300">{'\u2693'} Stand By (Maneuvering)</span>
              <div className="flex-1 border-t border-navy-200 dark:border-navy-700"></div>
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

            <div className={`report-totals rounded-2xl p-5 text-white shadow-lg
              ${isDeparture
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/25'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-emerald-500/25'}`}>
              <div className="text-xs font-semibold opacity-90 mb-3 uppercase tracking-wider">Report Totals</div>
              <div className="grid grid-cols-4 gap-4 text-center">
                {[
                  { label: 'HFO', value: grandTotals.HFO },
                  { label: 'MGO', value: grandTotals.MGO },
                  { label: 'LSFO', value: grandTotals.LSFO },
                  { label: 'Total', value: totalConsumption },
                ].map(item => (
                  <div key={item.label} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 hover:bg-white/25 transition-colors">
                    <div className="text-2xl font-display font-bold">{item.value.toFixed(2)}</div>
                    <div className="text-xs opacity-90 font-medium">{item.label} (MT)</div>
                  </div>
                ))}
              </div>
            </div>

            {isDeparture && (
              <div className="grid grid-cols-2 gap-5 mt-5 max-w-xl">
                <div className="bg-white dark:bg-navy-800 rounded-xl p-4 border border-navy-100 dark:border-navy-700">
                  <h4 className="font-semibold text-navy-700 dark:text-navy-200 mb-3 text-sm">Fuel R.O.B. (MT)</h4>
                  <div className="space-y-2">
                    {['hfo', 'mgo', 'lsfo'].map(fuel => (
                      <div key={fuel} className="flex items-center gap-3">
                        <label className="w-10 text-xs text-navy-500 dark:text-navy-400 uppercase font-semibold flex-shrink-0">{fuel}</label>
                        <input type="number" step="0.01" value={report.rob[fuel]}
                          onChange={(e) => onChange({ ...report, rob: { ...report.rob, [fuel]: e.target.value }})}
                          className="flex-1 min-w-0 px-3 py-2 bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-600 rounded-lg text-sm font-mono input-field" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-navy-800 rounded-xl p-4 border border-navy-100 dark:border-navy-700">
                  <h4 className="font-semibold text-navy-700 dark:text-navy-200 mb-3 text-sm">Fuel Bunkered (MT)</h4>
                  <div className="space-y-2">
                    {['hfo', 'mgo', 'lsfo'].map(fuel => (
                      <div key={fuel} className="flex items-center gap-3">
                        <label className="w-10 text-xs text-navy-500 dark:text-navy-400 uppercase font-semibold flex-shrink-0">{fuel}</label>
                        <input type="number" step="0.01" value={report.bunkered[fuel]}
                          onChange={(e) => onChange({ ...report, bunkered: { ...report.bunkered, [fuel]: e.target.value }})}
                          className="flex-1 min-w-0 px-3 py-2 bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-600 rounded-lg text-sm font-mono input-field" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!isDeparture && (
              <div className="grid grid-cols-3 gap-4 mt-5">
                <div className="bg-white dark:bg-navy-800 rounded-xl p-4 border border-navy-100 dark:border-navy-700">
                  <h4 className="font-semibold text-navy-700 dark:text-navy-200 mb-3 text-sm">R.O.B. (MT)</h4>
                  <div className="space-y-2">
                    {['hfo', 'mgo', 'lsfo'].map(fuel => (
                      <div key={fuel} className="flex items-center gap-3">
                        <label className="w-10 text-xs text-navy-500 dark:text-navy-400 uppercase font-semibold flex-shrink-0">{fuel}</label>
                        <input type="number" step="0.01" value={report.rob[fuel]}
                          onChange={(e) => onChange({ ...report, rob: { ...report.rob, [fuel]: e.target.value }})}
                          className="flex-1 min-w-0 px-3 py-2 bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-600 rounded-lg text-sm font-mono input-field" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-navy-800 rounded-xl p-4 border border-navy-100 dark:border-navy-700">
                  <h4 className="font-semibold text-navy-700 dark:text-navy-200 mb-3 text-sm">Fresh Water (MT)</h4>
                  <div className="space-y-2">
                    {[['rob', 'R.O.B.'], ['bunkered', 'Bunk.'], ['production', 'Prod.'], ['consumption', 'Cons.']].map(([key, label]) => (
                      <div key={key} className="flex items-center gap-3">
                        <label className="w-10 text-xs text-navy-500 dark:text-navy-400 font-semibold flex-shrink-0">{label}</label>
                        <input type="number" step="0.1" value={report.freshWater[key]}
                          onChange={(e) => onChange({ ...report, freshWater: { ...report.freshWater, [key]: e.target.value }})}
                          className="flex-1 min-w-0 px-3 py-2 bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-600 rounded-lg text-sm font-mono input-field" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white dark:bg-navy-800 rounded-xl p-4 border border-navy-100 dark:border-navy-700">
                  <h4 className="font-semibold text-navy-700 dark:text-navy-200 mb-3 text-sm">AEP / Alkali</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-navy-400 dark:text-navy-500 mb-1">Open Loop (hh:mm)</label>
                      <input type="text" value={report.aep.openLoopHrs} placeholder="00:00"
                        onChange={(e) => onChange({ ...report, aep: { ...report.aep, openLoopHrs: e.target.value }})}
                        className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-600 rounded-lg text-xs font-mono input-field" />
                    </div>
                    <div>
                      <label className="block text-xs text-navy-400 dark:text-navy-500 mb-1">Closed Loop (hh:mm)</label>
                      <input type="text" value={report.aep.closedLoopHrs} placeholder="00:00"
                        onChange={(e) => onChange({ ...report, aep: { ...report.aep, closedLoopHrs: e.target.value }})}
                        className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-600 rounded-lg text-xs font-mono input-field" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-navy-400 dark:text-navy-500 mb-1">NaOH Cons (L)</label>
                        <input type="number" step="0.1" value={report.aep.alkaliCons}
                          onChange={(e) => onChange({ ...report, aep: { ...report.aep, alkaliCons: e.target.value }})}
                          className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-600 rounded-lg text-xs font-mono input-field" />
                      </div>
                      <div>
                        <label className="block text-xs text-navy-400 dark:text-navy-500 mb-1">NaOH ROB (L)</label>
                        <input type="number" step="0.1" value={report.aep.alkaliRob}
                          onChange={(e) => onChange({ ...report, aep: { ...report.aep, alkaliRob: e.target.value }})}
                          className="w-full px-3 py-2 bg-navy-50 dark:bg-navy-900 border border-navy-200 dark:border-navy-600 rounded-lg text-xs font-mono input-field" />
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
