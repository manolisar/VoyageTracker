import { calcConsumption } from '../../utils/calculations';

const CruiseSummary = ({ cruise, densities }) => {
  let totalHFO = 0, totalMGO = 0, totalLSFO = 0, totalFWCons = 0, totalFWProd = 0;
  let lastFuelROB = { hfo: '\u2013', mgo: '\u2013', lsfo: '\u2013' };
  let lastFWROB = '\u2013';
  let lastNaOHROB = '\u2013';
  let totalNaOHCons = 0;

  cruise.legs.forEach(leg => {
    [leg.departure, leg.arrival].forEach(report => {
      if (!report) return;
      report.phases.forEach((phase) => {
        Object.values(phase.equipment).forEach(eq => {
          const cons = calcConsumption(eq.start, eq.end, eq.fuel, densities);
          if (cons) {
            if (eq.fuel === 'HFO') totalHFO += parseFloat(cons);
            else if (eq.fuel === 'MGO') totalMGO += parseFloat(cons);
            else totalLSFO += parseFloat(cons);
          }
        });
      });
      if (report.type === 'arrival') {
        if (report.freshWater.consumption) totalFWCons += parseFloat(report.freshWater.consumption);
        if (report.freshWater.production) totalFWProd += parseFloat(report.freshWater.production);
        if (report.aep.alkaliCons) totalNaOHCons += parseFloat(report.aep.alkaliCons);

        // Get last ROB values
        if (report.rob.hfo) lastFuelROB.hfo = parseFloat(report.rob.hfo).toFixed(2);
        if (report.rob.mgo) lastFuelROB.mgo = parseFloat(report.rob.mgo).toFixed(2);
        if (report.rob.lsfo) lastFuelROB.lsfo = parseFloat(report.rob.lsfo).toFixed(2);
        if (report.freshWater.rob) lastFWROB = parseFloat(report.freshWater.rob).toFixed(2);
        if (report.aep.alkaliRob) lastNaOHROB = parseFloat(report.aep.alkaliRob).toFixed(2);
      }
    });
  });

  const isCompleted = !!cruise.voyageEnd;
  const lubeOil = cruise.voyageEnd?.lubeOilCons || '\u2013';
  const lubeOilROBValue = cruise.voyageEnd?.lubeOilROB || '\u2013';

  return (
    <div className="glass-card rounded-2xl p-5 mb-6 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{'\uD83D\uDCCA'}</span>
          <h3 className="text-lg font-display font-bold text-navy-800 dark:text-white">
            Cruise Summary: {cruise.name || 'Unnamed'}
          </h3>
          {isCompleted && (
            <span className="badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1">
              {'\u2713'} Completed
            </span>
          )}
        </div>
        {isCompleted && (
          <div className="text-sm text-navy-500 dark:text-navy-400">
            <span className="font-medium">Engineer:</span> {cruise.voyageEnd.engineer || 'N/A'}
            <span className="mx-2">{'\u2022'}</span>
            <span>{new Date(cruise.voyageEnd.timestamp).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="flex gap-3">
        {/* Legs */}
        <div className="w-20 shrink-0 bg-gradient-to-br from-ocean-500/10 to-ocean-600/10 dark:from-ocean-500/20 dark:to-ocean-600/20
                       rounded-xl p-3 text-center border border-ocean-200/50 dark:border-ocean-700/30 flex flex-col items-center justify-center">
          <div className="text-[10px] font-semibold text-ocean-700 dark:text-ocean-400 mb-1 uppercase tracking-wide">{'\uD83D\uDEA2'} Legs</div>
          <div className="text-2xl font-display font-bold text-navy-800 dark:text-white">{cruise.legs.length}</div>
        </div>

        {/* Fuel Section */}
        <div className="flex-[3] min-w-0 summary-band-fuel bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20
                       rounded-xl p-3 border border-amber-200/50 dark:border-amber-700/30">
          <div className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 mb-2 uppercase tracking-wide">{'\u26FD'} Fuel (MT)</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-xs text-navy-500 dark:text-navy-400 mb-1">HFO</div>
              <div className="text-lg font-display font-bold text-navy-800 dark:text-white">{totalHFO.toFixed(2)}</div>
              <div className="text-[10px] text-navy-400 dark:text-navy-500">ROB: {lastFuelROB.hfo}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-navy-500 dark:text-navy-400 mb-1">MGO</div>
              <div className="text-lg font-display font-bold text-navy-800 dark:text-white">{totalMGO.toFixed(2)}</div>
              <div className="text-[10px] text-navy-400 dark:text-navy-500">ROB: {lastFuelROB.mgo}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-navy-500 dark:text-navy-400 mb-1">LSFO</div>
              <div className="text-lg font-display font-bold text-navy-800 dark:text-white">{totalLSFO.toFixed(2)}</div>
              <div className="text-[10px] text-navy-400 dark:text-navy-500">ROB: {lastFuelROB.lsfo}</div>
            </div>
          </div>
        </div>

        {/* Fresh Water Section */}
        <div className="flex-[2] min-w-0 summary-band-water bg-gradient-to-br from-blue-500/10 to-cyan-500/10 dark:from-blue-500/20 dark:to-cyan-500/20
                       rounded-xl p-3 border border-blue-200/50 dark:border-blue-700/30">
          <div className="text-[10px] font-semibold text-blue-700 dark:text-blue-400 mb-2 uppercase tracking-wide">{'\uD83D\uDCA7'} Fresh Water (MT)</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <div className="text-xs text-navy-500 dark:text-navy-400 mb-1">Prod</div>
              <div className="text-lg font-display font-bold text-navy-800 dark:text-white">{Math.round(totalFWProd)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-navy-500 dark:text-navy-400 mb-1">Cons</div>
              <div className="text-lg font-display font-bold text-navy-800 dark:text-white">{Math.round(totalFWCons)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-navy-500 dark:text-navy-400 mb-1">ROB</div>
              <div className="text-lg font-display font-bold text-navy-800 dark:text-white">{lastFWROB === '\u2013' ? '\u2013' : Math.round(parseFloat(lastFWROB))}</div>
            </div>
          </div>
        </div>

        {/* NaOH Section */}
        <div className="flex-[1.5] min-w-0 summary-band-chem bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20
                       rounded-xl p-3 border border-purple-200/50 dark:border-purple-700/30">
          <div className="text-[10px] font-semibold text-purple-700 dark:text-purple-400 mb-2 uppercase tracking-wide">{'\uD83E\uDDEA'} NaOH (L)</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="text-xs text-navy-500 dark:text-navy-400 mb-1">Cons</div>
              <div className="text-lg font-display font-bold text-navy-800 dark:text-white">{Math.round(totalNaOHCons)}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-navy-500 dark:text-navy-400 mb-1">ROB</div>
              <div className="text-lg font-display font-bold text-navy-800 dark:text-white">{lastNaOHROB === '\u2013' ? '\u2013' : Math.round(parseFloat(lastNaOHROB))}</div>
            </div>
          </div>
        </div>

        {/* Engine Lub-Oil Section */}
        <div className="flex-[1.5] min-w-0 summary-band-lube bg-gradient-to-br from-emerald-500/10 to-green-500/10 dark:from-emerald-500/20 dark:to-green-500/20
                       rounded-xl p-3 border border-emerald-200/50 dark:border-emerald-700/30">
          <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mb-2 uppercase tracking-wide">{'\uD83D\uDEE2\uFE0F'} Lub-Oil (L)</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <div className="text-xs text-navy-500 dark:text-navy-400 mb-1">Cons</div>
              <div className="text-lg font-display font-bold text-navy-800 dark:text-white">{lubeOil === '\u2013' ? '\u2013' : Math.round(parseFloat(lubeOil))}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-navy-500 dark:text-navy-400 mb-1">ROB</div>
              <div className="text-lg font-display font-bold text-navy-800 dark:text-white">{lubeOilROBValue === '\u2013' ? '\u2013' : Math.round(parseFloat(lubeOilROBValue))}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CruiseSummary;
