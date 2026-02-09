import { DEFAULT_DENSITIES } from './constants';

export const calcConsumption = (start, end, fuel, densities) => {
  if (!start || !end || start === '' || end === '') return null;
  const diffM3 = parseFloat(end) - parseFloat(start);
  if (isNaN(diffM3) || diffM3 < 0) return null;

  const density = densities[fuel] || DEFAULT_DENSITIES[fuel];
  const mt = diffM3 * density;
  return mt.toFixed(2);
};

export const calcCruiseTotal = (cruise) => {
  let total = 0;
  const cruiseDensities = cruise.densities || DEFAULT_DENSITIES;
  cruise.legs.forEach(leg => {
    [leg.departure, leg.arrival].forEach(report => {
      if (!report) return;
      report.phases.forEach((phase) => {
        Object.values(phase.equipment).forEach(eq => {
          const cons = calcConsumption(eq.start, eq.end, eq.fuel, cruiseDensities);
          if (cons) total += parseFloat(cons);
        });
      });
    });
  });
  return total;
};

export const generateFilename = (cruise) => {
  if (cruise.filename) {
    return cruise.filename;
  }

  const date = cruise.startDate || new Date().toISOString().split('T')[0];

  if (cruise.name && cruise.name.trim() !== '') {
    const safeName = cruise.name.replace(/[^a-z0-9]/gi, '_');
    return `${date}_${safeName}.json`;
  }

  return `${date}_voyage_${cruise.id}.json`;
};

export const generateDisplayFilename = (cruise) => {
  const date = cruise.startDate || new Date().toISOString().split('T')[0];
  const name = cruise.name || 'Unnamed_Cruise';
  const safeName = name.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
  return `${date}_${safeName}.json`;
};
