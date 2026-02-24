import { useState } from 'react';
import { Icons } from '../Icons';

const VoyageReportSection = ({ voyageReport, onChange, onDelete, depPort, arrPort, depDate, arrDate }) => {
  const [collapsed, setCollapsed] = useState(false);

  const vr = voyageReport;

  const updateField = (section, field, value) => {
    onChange({ ...vr, [section]: { ...vr[section], [field]: value } });
  };

  const updateNested = (section, sub, field, value) => {
    onChange({
      ...vr,
      [section]: {
        ...vr[section],
        [sub]: { ...vr[section][sub], [field]: value },
      },
    });
  };

  // Auto-calculate average speed from distance and time
  const calcAvgSpeed = (distance, time) => {
    const d = parseFloat(distance);
    const t = parseFloat(time);
    if (d > 0 && t > 0) return (d / t).toFixed(1);
    return '\u2013';
  };

  const voyageAvgSpeed = calcAvgSpeed(vr.voyage.totalMiles, vr.voyage.steamingTime);
  const pierToFASpeed = calcAvgSpeed(vr.departure.pierToFA.distance, vr.departure.pierToFA.time);
  const sbeToBerthSpeed = calcAvgSpeed(vr.arrival.sbeToBerth.distance, vr.arrival.sbeToBerth.time);

  const fromPort = depPort || 'From';
  const toPort = arrPort || 'To';

  return (
    <div className="cat-card nav rounded-xl overflow-hidden mb-4">
      <div
        className="px-4 py-2.5 cursor-pointer flex justify-between items-center hover:bg-[rgba(2,132,199,0.06)] transition-all"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2.5">
          <span className={`text-[var(--color-faint)] transition-transform duration-300 ${collapsed ? '' : 'rotate-90'}`}>
            <Icons.ChevronRight />
          </span>
          <span className="text-[var(--color-water)]">
            <Icons.Compass />
          </span>
          <div>
            <span className="cat-label" style={{ padding: 0, letterSpacing: '1.5px' }}>Voyage Report</span>
            {collapsed && (
              <p className="text-[0.6rem] text-[var(--color-dim)] font-mono mt-0.5">
                {fromPort} {'\u2192'} {toPort}
                {vr.voyage.totalMiles ? ` \u2022 ${vr.voyage.totalMiles} nm` : ''}
                {voyageAvgSpeed !== '\u2013' ? ` \u2022 ${voyageAvgSpeed} kts` : ''}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {vr.voyage.totalMiles && (
            <span className="total-pill mono text-[0.75rem]">{vr.voyage.totalMiles} nm</span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-[var(--color-faint)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Remove Voyage Report"
          >
            <Icons.Trash />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="border-t border-[var(--color-water-border)] dark:border-[rgba(2,132,199,0.2)]">
          {/* Top row: ports and dates (read-only, from engine data) */}
          <div className="grid grid-cols-4 gap-3 px-4 py-2.5 bg-[rgba(2,132,199,0.03)] dark:bg-[rgba(2,132,199,0.04)]">
            <div>
              <label className="form-label">From</label>
              <div className="text-[0.82rem] font-semibold text-[var(--color-text)] dark:text-white py-1">
                {depPort || <span className="text-[var(--color-faint)] italic font-normal">Set in Departure</span>}
              </div>
            </div>
            <div>
              <label className="form-label">To</label>
              <div className="text-[0.82rem] font-semibold text-[var(--color-text)] dark:text-white py-1">
                {arrPort || <span className="text-[var(--color-faint)] italic font-normal">Set in Arrival</span>}
              </div>
            </div>
            <div>
              <label className="form-label">Dep. Date</label>
              <div className="text-[0.82rem] font-mono text-[var(--color-text)] dark:text-white py-1">
                {depDate || <span className="text-[var(--color-faint)] italic font-normal text-[0.72rem]">{'\u2013'}</span>}
              </div>
            </div>
            <div>
              <label className="form-label">Arr. Date</label>
              <div className="text-[0.82rem] font-mono text-[var(--color-text)] dark:text-white py-1">
                {arrDate || <span className="text-[var(--color-faint)] italic font-normal text-[0.72rem]">{'\u2013'}</span>}
              </div>
            </div>
          </div>

          {/* 3-column grid: Departure / Sea Passage / Arrival */}
          <div className="vr-grid">
            {/* DEPARTURE column */}
            <div className="vr-col">
              <div className="vr-col-head">Departure</div>
              <div className="vr-field">
                <div>
                  <label className="form-label">SBE</label>
                  <input type="time" value={vr.departure.sbe} step="60"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateField('departure', 'sbe', e.target.value)}
                    className="form-input font-mono text-[0.78rem]" />
                </div>
                <div>
                  <label className="form-label">FA (Full Away)</label>
                  <input type="time" value={vr.departure.fa} step="60"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateField('departure', 'fa', e.target.value)}
                    className="form-input font-mono text-[0.78rem]" />
                </div>
              </div>

              <div className="vr-sub-head">Pier {'\u2192'} FA</div>
              <div className="vr-field">
                <div>
                  <label className="form-label">Dist (nm)</label>
                  <input type="number" step="0.1" value={vr.departure.pierToFA.distance}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateNested('departure', 'pierToFA', 'distance', e.target.value)}
                    className="form-input font-mono text-[0.78rem]" />
                </div>
                <div>
                  <label className="form-label">Time (h)</label>
                  <input type="number" step="0.1" value={vr.departure.pierToFA.time}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateNested('departure', 'pierToFA', 'time', e.target.value)}
                    className="form-input font-mono text-[0.78rem]" />
                </div>
              </div>
              <div className="vr-calc mono">
                Avg: {pierToFASpeed} kts
              </div>
            </div>

            {/* SEA PASSAGE column */}
            <div className="vr-col">
              <div className="vr-col-head">Sea Passage (FA {'\u2192'} SBE)</div>
              <div className="vr-field-full">
                <label className="form-label">Total Miles</label>
                <input type="number" step="0.1" value={vr.voyage.totalMiles}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateField('voyage', 'totalMiles', e.target.value)}
                  className="form-input font-mono text-[0.78rem]" />
              </div>
              <div className="vr-field-full">
                <label className="form-label">Steaming Time (h)</label>
                <input type="number" step="0.1" value={vr.voyage.steamingTime}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => updateField('voyage', 'steamingTime', e.target.value)}
                  className="form-input font-mono text-[0.78rem]" />
              </div>
              <div className="vr-calc mono" style={{ marginTop: '0.5rem', fontSize: '1.1rem', padding: '0.6rem' }}>
                {voyageAvgSpeed} kts
              </div>
              <div className="text-center text-[0.5rem] text-[var(--color-faint)] mt-1 uppercase tracking-wider font-bold">
                Average Speed
              </div>
            </div>

            {/* ARRIVAL column */}
            <div className="vr-col">
              <div className="vr-col-head">Arrival</div>
              <div className="vr-field">
                <div>
                  <label className="form-label">SBE</label>
                  <input type="time" value={vr.arrival.sbe} step="60"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateField('arrival', 'sbe', e.target.value)}
                    className="form-input font-mono text-[0.78rem]" />
                </div>
                <div>
                  <label className="form-label">FWE</label>
                  <input type="time" value={vr.arrival.fwe} step="60"
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateField('arrival', 'fwe', e.target.value)}
                    className="form-input font-mono text-[0.78rem]" />
                </div>
              </div>

              <div className="vr-sub-head">SBE {'\u2192'} Berth</div>
              <div className="vr-field">
                <div>
                  <label className="form-label">Dist (nm)</label>
                  <input type="number" step="0.1" value={vr.arrival.sbeToBerth.distance}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateNested('arrival', 'sbeToBerth', 'distance', e.target.value)}
                    className="form-input font-mono text-[0.78rem]" />
                </div>
                <div>
                  <label className="form-label">Time (h)</label>
                  <input type="number" step="0.1" value={vr.arrival.sbeToBerth.time}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateNested('arrival', 'sbeToBerth', 'time', e.target.value)}
                    className="form-input font-mono text-[0.78rem]" />
                </div>
              </div>
              <div className="vr-calc mono">
                Avg: {sbeToBerthSpeed} kts
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoyageReportSection;
