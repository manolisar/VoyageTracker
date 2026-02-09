import { calcConsumption } from '../../utils/calculations';
import { FUEL_OPTIONS } from '../../utils/constants';

const FUEL_ROW_CLASS = {
  HFO: 'fuel-row-hfo',
  MGO: 'fuel-row-mgo',
  LSFO: 'fuel-row-lsfo',
};

const FUEL_CLASS_LOWER = {
  HFO: 'hfo',
  MGO: 'mgo',
  LSFO: 'lsfo',
};

const EquipmentRow = ({ label, equipmentKey, data, onChange, disabled = false, allowedFuels = null, densities }) => {
  const consumption = calcConsumption(data.start, data.end, data.fuel, densities);
  const diff = (data.start && data.end) ? (parseFloat(data.end) - parseFloat(data.start)).toFixed(1) : '\u2013';

  const fuelOptions = allowedFuels || FUEL_OPTIONS;
  const rowClass = FUEL_ROW_CLASS[data.fuel] || '';
  const fuelLower = FUEL_CLASS_LOWER[data.fuel] || 'hfo';
  const isZero = !consumption || parseFloat(consumption) === 0;

  return (
    <tr className={`table-row border-b border-[var(--color-border-subtle)] dark:border-navy-700 ${rowClass}`}>
      <td className="py-3 px-4 font-bold text-[var(--color-text)] dark:text-navy-200">{label}</td>
      <td className="py-2 px-2">
        <div className="eq-fuel-cell">
          <span className={`flag-band ${fuelLower}`}></span>
          <span className={`eq-fuel-label ${fuelLower} mono`}>{data.fuel}</span>
          <select
            value={data.fuel}
            onChange={(e) => onChange({ ...data, fuel: e.target.value })}
            disabled={disabled}
            className={`ml-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all
              ${disabled
                ? 'bg-transparent text-[var(--color-faint)] cursor-not-allowed w-0 opacity-0 absolute'
                : 'bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600 text-navy-700 dark:text-navy-200 cursor-pointer hover:border-ocean-400'}`}
          >
            {fuelOptions.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      </td>
      <td className="py-2 px-2">
        <input
          type="number"
          step="0.1"
          value={data.start}
          onChange={(e) => onChange({ ...data, start: e.target.value })}
          className="w-full px-3 py-2 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600
                     rounded-lg text-sm font-mono input-field"
          placeholder="0.0"
        />
      </td>
      <td className="py-2 px-2">
        <input
          type="number"
          step="0.1"
          value={data.end}
          onChange={(e) => onChange({ ...data, end: e.target.value })}
          className="w-full px-3 py-2 bg-white dark:bg-navy-800 border border-navy-200 dark:border-navy-600
                     rounded-lg text-sm font-mono input-field"
          placeholder="0.0"
        />
      </td>
      <td className="py-3 px-4 text-right font-mono text-sm text-[var(--color-dim)] dark:text-navy-400">{diff}</td>
      <td className="py-3 px-4 text-right font-mono text-sm font-bold">
        <span className={`eq-mt ${isZero ? 'zero' : ''}`}>
          {isZero ? '\u2014' : consumption}
        </span>
      </td>
    </tr>
  );
};

export default EquipmentRow;
