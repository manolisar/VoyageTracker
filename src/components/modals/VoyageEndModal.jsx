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
        <div className="modal-head flex items-center gap-3">
          <Icons.Flag />
          <div>
            <h2>Voyage End Summary</h2>
            <p>{cruise.name} {'\u2022'} {cruise.vessel}</p>
          </div>
        </div>

        <div className="p-6 space-y-5 dark:bg-navy-800">
          <div className="cat-card fuel" style={{ gridColumn: 'unset' }}>
            <div className="cat-label">Total Fuel Consumption</div>
            <div className="cat-body">
              <div className="fuel-cols" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
                <div className="fuel-col hfo">
                  <div className="fc-type"><span className="fc-dot"></span>HFO</div>
                  <div className="fc-big mono">{totalHFO.toFixed(2)}</div>
                  <div className="fc-rob">MT</div>
                </div>
                <div className="fuel-col mgo">
                  <div className="fc-type"><span className="fc-dot"></span>MGO</div>
                  <div className="fc-big mono">{totalMGO.toFixed(2)}</div>
                  <div className="fc-rob">MT</div>
                </div>
                <div className="fuel-col lsfo">
                  <div className="fc-type"><span className="fc-dot"></span>LSFO</div>
                  <div className="fc-big mono">{totalLSFO.toFixed(2)}</div>
                  <div className="fc-rob">MT</div>
                </div>
                <div className="fuel-col" style={{ textAlign: 'center' }}>
                  <div className="fc-type" style={{ color: 'var(--color-text)' }}>{'\u03A3'} Total</div>
                  <div className="fc-big mono" style={{ color: 'var(--color-text)' }}>{totalFuel.toFixed(2)}</div>
                  <div className="fc-rob">MT</div>
                </div>
              </div>
            </div>
          </div>

          <div className="cat-card lube">
            <div className="cat-label">Engine Lub-Oil (Liters)</div>
            <div className="cat-body">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Consumption *</label>
                  <input type="number" step="1" value={lubeOilCons} onChange={(e) => setLubeOilCons(e.target.value)}
                    className="form-input font-mono text-[1rem]" placeholder="0" />
                </div>
                <div>
                  <label className="form-label">R.O.B.</label>
                  <input type="number" step="1" value={lubeOilROB} onChange={(e) => setLubeOilROB(e.target.value)}
                    className="form-input font-mono text-[1rem]" placeholder="0" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="cat-card chem">
              <div className="cat-label">NaOH Consumption</div>
              <div className="cat-body text-center py-2">
                <div className="text-[2rem] font-extrabold mono" style={{ color: 'var(--color-chem)' }}>{totalNaOHCons.toFixed(1)}</div>
                <div className="text-[0.6rem] text-[var(--color-dim)]">Total (Liters)</div>
              </div>
            </div>
            <div className="cat-card water">
              <div className="cat-label">Fresh Water</div>
              <div className="cat-body">
                <div className="water-rows">
                  {[
                    { label: 'Bunkered', value: totalFWBunkered },
                    { label: 'Prod.', value: totalFWProd },
                    { label: 'Cons.', value: totalFWCons },
                  ].map(item => (
                    <div key={item.label} className="water-row">
                      <span className="wr-label">{item.label}</span>
                      <span className="wr-val mono">{item.value.toFixed(1)} MT</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="cat-card chem">
            <div className="cat-label">AEP Operating Hours</div>
            <div className="cat-body">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Open Loop', value: totalOpenLoop },
                  { label: 'Closed Loop', value: totalClosedLoop },
                ].map(item => (
                  <div key={item.label} className="text-center py-2">
                    <div className="text-[1.5rem] font-extrabold mono" style={{ color: 'var(--color-chem)' }}>{item.value.toFixed(1)}</div>
                    <div className="text-[0.6rem] text-[var(--color-dim)]">{item.label} (hrs)</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="form-label">Chief Engineer / Signature</label>
              <input type="text" value={engineer} onChange={(e) => setEngineer(e.target.value)}
                className="form-input" placeholder="Enter name" />
            </div>
            <div>
              <label className="form-label">Notes / Remarks</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows="3"
                className="form-input resize-none" placeholder="Additional notes or remarks..." />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave}
              className="flex-1 px-6 py-2.5 btn-success text-white rounded-lg font-semibold text-[0.78rem] transition-all flex items-center justify-center gap-2">
              <Icons.Check /> Complete Voyage
            </button>
            <button onClick={onClose}
              className="px-6 py-2.5 btn-flat rounded-lg font-semibold text-[0.78rem]">
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoyageEndModal;
