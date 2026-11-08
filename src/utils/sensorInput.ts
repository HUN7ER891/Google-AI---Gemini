import type { StationData } from '../types/airQuality.ts';

export interface ManualSensorInput {
  name: string;
  latitude: string;
  longitude: string;
  elevationM: string;
  pm25: string;
  pm10: string;
  temperatureC: string;
}

function numberInRange(value: string, min: number, max: number): number {
  const number = value.trim() === '' ? NaN : Number(value);
  if (!Number.isFinite(number) || number < min || number > max) throw new Error('invalid_manual_input');
  return number;
}

export function validateManualInput(input: ManualSensorInput) {
  const name = input.name.trim();
  if (!name || name.length > 120) throw new Error('invalid_manual_input');
  return {
    name,
    latitude: numberInRange(input.latitude, -90, 90),
    longitude: numberInRange(input.longitude, -180, 180),
    elevationM: numberInRange(input.elevationM, -500, 9000),
    pm25: numberInRange(input.pm25, 0, 1_000_000),
    pm10: numberInRange(input.pm10, 0, 1_000_000),
    temperatureC: numberInRange(input.temperatureC, -100, 100),
  };
}

// Local storage is untrusted input, including entries saved by older prototype versions.
export function readManualSensor(value: unknown): StationData | null {
  if (!value || typeof value !== 'object') return null;
  const s = value as StationData;
  if (s.isCustom !== true || typeof s.id !== 'string' || !s.id.startsWith('custom_') ||
      typeof s.name !== 'string' || typeof s.municipality !== 'string' || typeof s.lastUpdated !== 'string' ||
      !['custom_iot', 'sensor_community', 'purple_air'].includes(s.source) || !s.pollutants || !s.weather) return null;
  const required = [s.latitude, s.longitude, s.elevationM, s.pollutants.pm25, s.pollutants.pm10,
    s.weather.temperatureC, s.weather.humidityPct, s.weather.windSpeedKmH, s.weather.windDirectionDeg, s.weather.surfacePressureHPa];
  if (!required.every(n => typeof n === 'number' && Number.isFinite(n))) return null;
  try {
    validateManualInput({ name: s.name, latitude: String(s.latitude), longitude: String(s.longitude),
      elevationM: String(s.elevationM), pm25: String(s.pollutants.pm25), pm10: String(s.pollutants.pm10),
      temperatureC: String(s.weather.temperatureC) });
  } catch { return null; }
  const optionalPollutants = [s.pollutants.no2, s.pollutants.so2, s.pollutants.co, s.pollutants.o3];
  if (!optionalPollutants.every(n => n === undefined || (typeof n === 'number' && Number.isFinite(n) && n >= 0))) return null;
  const f = s.hourlyForecast;
  const validForecast = f && Array.isArray(f.time) && f.time.every(t => typeof t === 'string') &&
    [f.pm25, f.pm10, f.aqi].every(a => Array.isArray(a) && a.length === f.time.length && a.every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0));
  return { ...s, nameBs: s.name, sourceName: 'Manual entry / lokalni unos', provenance: 'manual',
    forecastProvenance: 'synthetic', customEndpoint: typeof s.customEndpoint === 'string' ? s.customEndpoint : undefined,
    hourlyForecast: validForecast ? f : undefined };
}
