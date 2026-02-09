import { APP_VERSION, DEFAULT_DENSITIES } from './constants';

export const validateCruiseData = (data) => {
  const errors = [];

  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format');
    return { valid: false, errors, data: null };
  }

  if (!data.id) errors.push('Missing cruise ID');
  if (!Array.isArray(data.legs)) errors.push('Invalid legs array');

  if (data.densities) {
    for (const [fuel, density] of Object.entries(data.densities)) {
      const d = parseFloat(density);
      if (isNaN(d) || d <= 0 || d > 2) {
        errors.push(`Invalid ${fuel} density: ${density}`);
      }
    }
  }

  const fixed = {
    id: data.id || Date.now(),
    name: data.name || '',
    vessel: data.vessel || 'Celebrity Solstice',
    startDate: data.startDate || '',
    endDate: data.endDate || '',
    legs: Array.isArray(data.legs) ? data.legs : [],
    densities: { ...DEFAULT_DENSITIES, ...(data.densities || {}) },
    voyageEnd: data.voyageEnd || null,
    lastModified: data.lastModified || new Date().toISOString(),
    version: APP_VERSION,
    filename: data.filename || null,
  };

  return {
    valid: errors.length === 0,
    errors,
    data: fixed,
  };
};
