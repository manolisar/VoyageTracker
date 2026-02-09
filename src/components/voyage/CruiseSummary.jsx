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
    <div className="mb-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="sum-header">
          {'\u25B8'} Cruise Summary {'\u2014'} {cruise.name || 'Unnamed'} &bull; {cruise.legs.length} Leg{cruise.legs.length !== 1 ? 's' : ''}
          {isCompleted && (
            <span className="ml-2 badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-0.5 text-[0.55rem]">
              {'\u2713'} Completed
            </span>
          )}
        </div>
        {isCompleted && (
          <div className="text-[0.6rem] text-[var(--color-faint)]">
            <span className="font-medium">{cruise.voyageEnd.engineer || 'N/A'}</span>
            <span className="mx-1.5">{'\u2022'}</span>
            <span>{new Date(cruise.voyageEnd.timestamp).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Cards Grid */}
      <div className="sum-grid">
        {/* FUEL — full width */}
        <div className="cat-card fuel span-full">
          <div className="cat-label">{'\u26FD'} Fuel Consumption (MT)</div>
          <div className="cat-body">
            <div className="fuel-cols">
              <div className="fuel-col hfo">
                <div className="fc-type"><span className="fc-dot"></span>HFO</div>
                <div className="fc-big mono">{totalHFO.toFixed(2)}</div>
                <div className="fc-rob mono">ROB {lastFuelROB.hfo}</div>
              </div>
              <div className="fuel-col mgo">
                <div className="fc-type"><span className="fc-dot"></span>MGO</div>
                <div className="fc-big mono">{totalMGO.toFixed(2)}</div>
                <div className="fc-rob mono">ROB {lastFuelROB.mgo}</div>
              </div>
              <div className="fuel-col lsfo">
                <div className="fc-type"><span className="fc-dot"></span>LSFO</div>
                <div className="fc-big mono">{totalLSFO.toFixed(2)}</div>
                <div className="fc-rob mono">ROB {lastFuelROB.lsfo}</div>
              </div>
            </div>
          </div>
        </div>

        {/* WATER */}
        <div className="cat-card water">
          <div className="cat-label">{'\uD83D\uDCA7'} Potable Water (MT)</div>
          <div className="cat-body">
            <div className="water-rows">
              <div className="water-row"><span className="wr-label">Production</span><span className="wr-val mono">{Math.round(totalFWProd)}</span></div>
              <div className="water-row"><span className="wr-label">Consumption</span><span className="wr-val mono">{Math.round(totalFWCons)}</span></div>
              <div className="water-row"><span className="wr-label">R.O.B.</span><span className="wr-val mono">{lastFWROB === '\u2013' ? '\u2013' : Math.round(parseFloat(lastFWROB))}</span></div>
            </div>
          </div>
        </div>

        {/* CHEMICALS */}
        <div className="cat-card chem">
          <div className="cat-label"><span className="hazard-icon">{'\u26A0'}</span> NaOH / Alkali (L)</div>
          <div className="cat-body">
            <div className="chem-rows">
              <div className="chem-row"><span className="cr-label">Consumption</span><span className="cr-val mono">{Math.round(totalNaOHCons)}</span></div>
              <div className="chem-row"><span className="cr-label">R.O.B.</span><span className="cr-val mono">{lastNaOHROB === '\u2013' ? '\u2013' : Math.round(parseFloat(lastNaOHROB))}</span></div>
            </div>
          </div>
        </div>

        {/* LUBE OIL */}
        <div className="cat-card lube">
          <div className="cat-label">{'\uD83D\uDEE2\uFE0F'} Engine Lub-Oil (L)</div>
          <div className="cat-body">
            <div className="lube-rows">
              <div className="lube-row"><span className="lr-label">Consumption</span><span className="lr-val mono">{lubeOil === '\u2013' ? '\u2013' : Math.round(parseFloat(lubeOil))}</span></div>
              <div className="lube-row"><span className="lr-label">R.O.B.</span><span className="lr-val mono">{lubeOilROBValue === '\u2013' ? '\u2013' : Math.round(parseFloat(lubeOilROBValue))}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CruiseSummary;
