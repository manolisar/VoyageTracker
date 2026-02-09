import { useState } from 'react';
import { Icons } from '../Icons';
import { useToast } from '../../hooks/useToast';
import { calcConsumption } from '../../utils/calculations';

const VoyageEndModal = ({ cruise, onClose, onSave, densities }) => {
  const [lubeOilCons, setLubeOilCons] = useState(cruise.voyageEnd?.lubeOilCons || '');
  const [lubeOilROB, setLubeOilROB] = useState(cruise.voyageEnd?.lubeOilROB || '');
  const [engineer, setEngineer] = useState(cruise.voyageEnd?.engineer || '');
  const [notes, setNotes] = useState(cruise.voyageEnd?.notes || '');
  const toast = useToast();

  let totalHFO = 0, totalMGO = 0, totalLSFO = 0;
  let totalFWProd = 0, totalFWCons = 0, totalFWBunkered = 0;
  let totalOpenLoop = 0, totalClosedLoop = 0;
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
        if (report.freshWater.production) totalFWProd += parseFloat(report.freshWater.production);
        if (report.freshWater.consumption) totalFWCons += parseFloat(report.freshWater.consumption);
        if (report.freshWater.bunkered) totalFWBunkered += parseFloat(report.freshWater.bunkered);

        if (report.aep.openLoopHrs) {
          const parts = report.aep.openLoopHrs.split(':');
          if (parts.length === 2) {
            totalOpenLoop += parseInt(parts[0]) + parseInt(parts[1]) / 60;
          }
        }
        if (report.aep.closedLoopHrs) {
          const parts = report.aep.closedLoopHrs.split(':');
          if (parts.length === 2) {
            totalClosedLoop += parseInt(parts[0]) + parseInt(parts[1]) / 60;
          }
        }

        if (report.aep.alkaliCons) {
          totalNaOHCons += parseFloat(report.aep.alkaliCons);
        }
      }
    });
  });

  const handleSave = () => {
    const voyageEndData = {
      timestamp: new Date().toISOString(),
      lubeOilCons,
      lubeOilROB,
      engineer,
      notes,
      totals: {
        hfo: totalHFO,
        mgo: totalMGO,
        lsfo: totalLSFO,
        fwProd: totalFWProd,
        fwCons: totalFWCons,
        fwBunkered: totalFWBunkered,
        openLoop: totalOpenLoop,
        closedLoop: totalClosedLoop,
        naohCons: totalNaOHCons,
      }
    };
    onSave(voyageEndData);
    toast.addToast('Voyage completed successfully!', 'success');
  };

  const totalFuel = totalHFO + totalMGO + totalLSFO;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-3xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-5 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Icons.Flag />
            <div>
              <h2 className="text-xl font-display font-bold">Voyage End Summary</h2>
              <p className="text-sm text-white/80">{cruise.name} {'\u2022'} {cruise.vessel}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 dark:bg-navy-800">
          <div className="bg-navy-50 dark:bg-navy-900/50 rounded-2xl p-5">
            <h3 className="font-display font-semibold text-navy-700 dark:text-navy-200 mb-4">Total Fuel Consumption</h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'HFO', value: totalHFO, color: 'from-amber-500 to-amber-600' },
                { label: 'MGO', value: totalMGO, color: 'from-emerald-500 to-emerald-600' },
                { label: 'LSFO', value: totalLSFO, color: 'from-blue-500 to-blue-600' },
                { label: 'Total', value: totalFuel, color: 'from-ocean-500 to-ocean-600' },
              ].map(item => (
                <div key={item.label} className={`bg-gradient-to-br ${item.color} rounded-xl p-4 text-center text-white`}>
                  <div className="text-2xl font-display font-bold">{item.value.toFixed(2)}</div>
                  <div className="text-xs opacity-80">{item.label} (MT)</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gold-50 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800/50 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-navy-700 dark:text-navy-200 mb-3">{'\uD83D\uDEE2\uFE0F'} Engine Lub-Oil (Liters)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-navy-500 dark:text-navy-400 mb-1">Consumption *</label>
                <input type="number" step="1" value={lubeOilCons} onChange={(e) => setLubeOilCons(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-navy-800 border border-gold-300 dark:border-gold-700 rounded-xl font-mono text-lg input-field" placeholder="0" />
              </div>
              <div>
                <label className="block text-xs text-navy-500 dark:text-navy-400 mb-1">R.O.B.</label>
                <input type="number" step="1" value={lubeOilROB} onChange={(e) => setLubeOilROB(e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-navy-800 border border-gold-300 dark:border-gold-700 rounded-xl font-mono text-lg input-field" placeholder="0" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="bg-navy-50 dark:bg-navy-900/50 rounded-xl p-4">
              <h3 className="font-semibold text-navy-700 dark:text-navy-200 mb-3">NaOH Consumption</h3>
              <div className="bg-white dark:bg-navy-800 rounded-xl p-4 text-center">
                <div className="text-3xl font-display font-bold text-navy-800 dark:text-white">{totalNaOHCons.toFixed(1)}</div>
                <div className="text-sm text-navy-500 dark:text-navy-400">Total (Liters)</div>
              </div>
            </div>
            <div className="bg-navy-50 dark:bg-navy-900/50 rounded-xl p-4">
              <h3 className="font-semibold text-navy-700 dark:text-navy-200 mb-3">Fresh Water</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Bunkered', value: totalFWBunkered },
                  { label: 'Prod.', value: totalFWProd },
                  { label: 'Cons.', value: totalFWCons },
                ].map(item => (
                  <div key={item.label} className="bg-white dark:bg-navy-800 rounded-lg p-3 text-center">
                    <div className="text-lg font-display font-bold text-navy-800 dark:text-white">{item.value.toFixed(1)}</div>
                    <div className="text-xs text-navy-500 dark:text-navy-400">{item.label} (MT)</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-navy-50 dark:bg-navy-900/50 rounded-xl p-4">
            <h3 className="font-semibold text-navy-700 dark:text-navy-200 mb-3">AEP Operating Hours</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Open Loop', value: totalOpenLoop },
                { label: 'Closed Loop', value: totalClosedLoop },
              ].map(item => (
                <div key={item.label} className="bg-white dark:bg-navy-800 rounded-xl p-4 text-center">
                  <div className="text-2xl font-display font-bold text-navy-800 dark:text-white">{item.value.toFixed(1)}</div>
                  <div className="text-sm text-navy-500 dark:text-navy-400">{item.label} (hrs)</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-navy-200 mb-2">Chief Engineer / Signature</label>
              <input type="text" value={engineer} onChange={(e) => setEngineer(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600 rounded-xl input-field" placeholder="Enter name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-navy-700 dark:text-navy-200 mb-2">Notes / Remarks</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3"
                className="w-full px-4 py-3 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600 rounded-xl input-field resize-none" placeholder="Additional notes or remarks..." />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave}
              className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700
                         text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/25">
              <Icons.Check /> Complete Voyage
            </button>
            <button onClick={onClose}
              className="px-6 py-3.5 bg-navy-100 dark:bg-navy-700 hover:bg-navy-200 dark:hover:bg-navy-600
                         text-navy-700 dark:text-navy-200 rounded-xl font-semibold transition-colors">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoyageEndModal;
